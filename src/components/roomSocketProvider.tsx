'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react'
import { Socket, Channel } from 'phoenix'
import { WS_URL } from '@/config'
import { useChatStore } from '@/app/stores'
import type { Message } from '@/type/message/message'

export type RoomConnection = 'disconnected' | 'connecting' | 'connected' | 'error'

export interface RoomSocketRoom {
  id: string
  code: string
  name: string
}

interface RoomSocketContextValue {
  sendRoomMessage: (
    roomId: string,
    event: string,
    payload: { body: string; user: string; code: string; color: string }
  ) => boolean
  getRoomConnection: (roomId: string) => RoomConnection
  getRoomError: (roomId: string) => string | null
}

const RoomSocketContext = createContext<RoomSocketContextValue | null>(null)

export function useRoomSocket() {
  const ctx = useContext(RoomSocketContext)
  if (!ctx) {
    throw new Error('useRoomSocket must be used within RoomSocketProvider')
  }
  return ctx
}

interface RoomSocketProviderProps {
  token: string
  rooms: RoomSocketRoom[]
  /** Currently open channel; messages here are not counted as unread */
  activeChannelId: string | null
  children: ReactNode
}

export function RoomSocketProvider({
  token,
  rooms,
  activeChannelId,
  children
}: RoomSocketProviderProps) {
  const socketRef = useRef<Socket | null>(null)
  const channelsRef = useRef<Map<string, Channel>>(new Map())
  const activeChannelIdRef = useRef(activeChannelId)
  const [statusByRoom, setStatusByRoom] = useState<Record<string, RoomConnection>>({})
  const [errorByRoom, setErrorByRoom] = useState<Record<string, string | null>>({})

  useEffect(() => {
    activeChannelIdRef.current = activeChannelId
  }, [activeChannelId])

  useEffect(() => {
    if (!token) return
    const socket = new Socket(`${WS_URL}/socket`, {
      params: { token }
    })
    socket.connect()
    socketRef.current = socket
    return () => {
      /* Teardown must leave every channel that exists when the socket is torn down (not a render-time ref snapshot). */
      // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: read latest Map at cleanup
      const channels = channelsRef.current
      channels.forEach((ch) => {
        try {
          ch.leave()
        } catch {
          /* ignore */
        }
      })
      channels.clear()
      socket.disconnect()
      socketRef.current = null
    }
  }, [token])

  useEffect(() => {
    const socket = socketRef.current
    if (!socket || !token) return

    const currentIds = new Set(rooms.map((r) => r.id))

    for (const [id, ch] of [...channelsRef.current.entries()]) {
      if (!currentIds.has(id)) {
        try {
          ch.leave()
        } catch {
          /* ignore */
        }
        channelsRef.current.delete(id)
        setStatusByRoom((p) => {
          const n = { ...p }
          delete n[id]
          return n
        })
        setErrorByRoom((p) => {
          const n = { ...p }
          delete n[id]
          return n
        })
      }
    }

    for (const room of rooms) {
      if (channelsRef.current.has(room.id)) continue

      const ch = socket.channel(`chat_room:${room.id}`, { code: room.code })

      ch.onMessage = (event, payload) => {
        if (event !== 'new_message') return payload
        const p = payload as { body: string; user: string; code?: string; color: string }
        const isActive = activeChannelIdRef.current === room.id
        const msg: Message = {
          body: p.body,
          user: p.user,
          code: p.code ?? room.code,
          color: p.color,
          timestamp: new Date().toISOString()
        }
        useChatStore.getState().appendMessageForRoom(room.id, msg, { isActiveRoom: isActive })

        const docHidden = typeof document !== 'undefined' && document.hidden
        if (
          !isActive &&
          docHidden &&
          typeof Notification !== 'undefined' &&
          Notification.permission === 'granted'
        ) {
          new Notification(room.name, {
            body: `${p.user}: ${p.body}`
          })
        }
        return payload
      }

      setStatusByRoom((prev) => ({ ...prev, [room.id]: 'connecting' }))

      ch.join()
        .receive('ok', () => {
          setStatusByRoom((prev) => ({ ...prev, [room.id]: 'connected' }))
          setErrorByRoom((prev) => ({ ...prev, [room.id]: null }))
        })
        .receive('error', (resp: { reason?: string } | string) => {
          const reason =
            typeof resp === 'object' && resp && 'reason' in resp
              ? String(resp.reason)
              : 'Failed to join channel'
          setStatusByRoom((prev) => ({ ...prev, [room.id]: 'error' }))
          setErrorByRoom((prev) => ({ ...prev, [room.id]: reason }))
        })

      channelsRef.current.set(room.id, ch)
    }
  }, [rooms, token])

  const sendRoomMessage = useCallback(
    (roomId: string, event: string, payload: { body: string; user: string; code: string; color: string }) => {
      const ch = channelsRef.current.get(roomId)
      if (!ch || statusByRoom[roomId] !== 'connected') return false
      ch.push(event, payload)
      return true
    },
    [statusByRoom]
  )

  const getRoomConnection = useCallback(
    (roomId: string): RoomConnection => statusByRoom[roomId] ?? 'disconnected',
    [statusByRoom]
  )

  const getRoomError = useCallback(
    (roomId: string) => errorByRoom[roomId] ?? null,
    [errorByRoom]
  )

  const value = useMemo(
    () => ({
      sendRoomMessage,
      getRoomConnection,
      getRoomError
    }),
    [sendRoomMessage, getRoomConnection, getRoomError]
  )

  return <RoomSocketContext.Provider value={value}>{children}</RoomSocketContext.Provider>
}
