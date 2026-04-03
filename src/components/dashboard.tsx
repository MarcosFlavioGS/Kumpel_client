'use client'

import { useState, useEffect, useCallback } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useUserStore, useChatStore } from '@/app/stores'
import { useRouter } from 'next/navigation'
import ChatRoom from './chatRoom'
import { LogOut, Hash } from 'lucide-react'
import { SubscribeRoomDialog } from './subscribeRoomDialog'
import { CreateRoomDialog } from './createRoomDialog'
import { API_URL } from '@/config'
import { cn } from '@/lib/utils'

interface Room {
  name: string
  room_id: string
  code: string
}

interface UserData {
  id: string
  name: string
  mail: string
  created_rooms?: Room[]
  subscribed_rooms?: Room[]
}

interface ChatRoomData {
  id: string
  name: string
  code: string
}

function SidebarSkeleton() {
  return (
    <div className='flex h-full flex-col gap-3 p-2'>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className='flex items-center gap-3 rounded-lg bg-kumpel-hover/50 p-3'>
          <div className='h-10 w-10 shrink-0 animate-pulse rounded-full bg-kumpel-border' />
          <div className='min-w-0 flex-1 space-y-2'>
            <div className='h-3.5 w-3/4 animate-pulse rounded bg-kumpel-border' />
            <div className='h-3 w-1/2 animate-pulse rounded bg-kumpel-border' />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [rooms, setRooms] = useState<ChatRoomData[]>([])
  const [selectedRoom, setSelectedRoom] = useState<ChatRoomData | null>(null)
  /** Below md: full-screen chat vs full-width channel list (desktop always shows split view). */
  const [showMobileChat, setShowMobileChat] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const token = useUserStore((state) => state.token)
  const userName = useUserStore((state) => state.userName)
  const clearAuth = useUserStore((state) => state.clearAuth)
  const setUserName = useUserStore((state) => state.setUserName)
  const setMessages = useChatStore((state) => state.setMessages)

  const handleLogout = () => {
    clearAuth()
    router.push('/')
  }

  const selectRoom = (room: ChatRoomData) => {
    setMessages([])
    setSelectedRoom(room)
    setShowMobileChat(true)
  }

  const fetchUserRooms = useCallback(
    async (options?: { silent?: boolean }) => {
      const silent = options?.silent ?? false
      try {
        if (!silent) setIsLoading(true)
        setError(null)

        const response = await fetch(`${API_URL}/api/currentUser`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (response.status === 401) {
          clearAuth()
          router.push('/')
          return
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const responseText = await response.text()

        try {
          const userData: UserData = JSON.parse(responseText)

          if (!userData || typeof userData !== 'object') {
            throw new Error('Invalid response format: user data not found')
          }

          const createdRooms = Array.isArray(userData.created_rooms) ? userData.created_rooms : []
          const subscribedRooms = Array.isArray(userData.subscribed_rooms) ? userData.subscribed_rooms : []

          const uniqueRoomIds = new Set<string>()

          const allRooms = [...createdRooms, ...subscribedRooms]
            .filter((room) => {
              const roomId = String(room.room_id)
              if (uniqueRoomIds.has(roomId)) {
                return false
              }
              uniqueRoomIds.add(roomId)
              return true
            })
            .map((room) => ({
              id: String(room.room_id),
              name: room.name,
              code: room.code
            }))

          setRooms(allRooms)
          setUserName(userData.name)
        } catch (parseError) {
          console.error('JSON Parse Error:', parseError)
          throw new Error('Failed to parse server response as JSON')
        }
      } catch (err) {
        console.error('Error fetching user rooms:', err)
        if (err instanceof Error) {
          if (err.message.includes('Failed to fetch')) {
            setError('Cannot connect to the server. Check that the API is running.')
          } else if (err.message.includes('not JSON')) {
            setError('Server returned invalid data. Try again later.')
          } else if (err.message.includes('Invalid response format')) {
            setError('Unexpected data from server. Try again later.')
          } else {
            setError(err.message)
          }
        } else {
          setError('An unexpected error occurred. Please try again.')
        }
      } finally {
        if (!silent) setIsLoading(false)
      }
    },
    [token, router, clearAuth, setUserName]
  )

  useEffect(() => {
    if (!token) {
      router.push('/')
      return
    }
    void fetchUserRooms()
  }, [token, router, fetchUserRooms])

  const sidebarClass = cn(
    'flex h-full min-h-0 min-w-0 flex-col border-kumpel-border bg-kumpel-sidebar md:border-r',
    'w-full md:w-[272px] md:shrink-0',
    showMobileChat && selectedRoom ? 'hidden md:flex' : 'flex'
  )

  const mainClass = cn(
    'relative min-h-0 min-w-0 flex-1 flex-col',
    selectedRoom && showMobileChat ? 'flex' : 'hidden md:flex'
  )

  if (isLoading) {
    return (
      <div className='flex h-full min-h-0 flex-col bg-kumpel-bg md:flex-row'>
        <aside className='flex h-full min-h-0 w-full min-w-0 flex-col border-b border-kumpel-border bg-kumpel-sidebar md:w-[272px] md:shrink-0 md:border-b-0 md:border-r'>
          <div className='border-b border-kumpel-border px-4 py-4'>
            <div className='h-5 w-32 animate-pulse rounded bg-kumpel-border' />
          </div>
          <SidebarSkeleton />
        </aside>
        <div className='hidden flex-1 items-center justify-center md:flex'>
          <p className='text-sm text-kumpel-muted'>Loading your spaces…</p>
        </div>
        <div className='flex flex-1 items-center justify-center py-8 md:hidden'>
          <p className='text-sm text-kumpel-muted'>Loading your spaces…</p>
        </div>
      </div>
    )
  }

  return (
    <div className='flex h-full min-h-0 flex-col bg-kumpel-bg md:flex-row'>
      <aside className={sidebarClass}>
        <div className='flex items-center justify-between gap-2 border-b border-kumpel-border px-3 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:pt-3'>
          <div className='min-w-0'>
            <h2 className='truncate text-sm font-semibold uppercase tracking-wide text-kumpel-muted'>Channels</h2>
            {userName ? (
              <p
                className='truncate text-xs text-zinc-400'
                title={userName}>
                {userName}
              </p>
            ) : null}
          </div>
          <Button
            variant='ghost'
            size='icon'
            onClick={handleLogout}
            className='shrink-0 text-kumpel-muted hover:bg-kumpel-danger/15 hover:text-kumpel-danger'
            title='Log out'
            type='button'>
            <LogOut className='h-5 w-5' />
          </Button>
        </div>

        {error && (
          <div
            className='mx-2 mt-2 rounded-lg border border-kumpel-danger/35 bg-kumpel-danger/10 px-3 py-2 text-xs text-red-200'
            role='alert'>
            {error}
          </div>
        )}

        <ScrollArea className='mt-2 min-h-0 flex-1 px-2 pb-2'>
          <div className='space-y-0.5 pr-2'>
            {rooms.map((room) => {
              const selected = selectedRoom?.id === room.id
              return (
                <button
                  key={room.id}
                  type='button'
                  onClick={() => selectRoom(room)}
                  className={cn(
                    'group flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors active:bg-kumpel-hover-strong md:py-2',
                    selected
                      ? 'bg-kumpel-hover-strong text-white shadow-sm ring-1 ring-white/[0.06]'
                      : 'text-zinc-300 hover:bg-kumpel-hover hover:text-white'
                  )}>
                  <span
                    className={cn(
                      'w-1 shrink-0 self-stretch rounded-full transition-colors',
                      selected ? 'bg-kumpel-accent' : 'bg-transparent group-hover:bg-kumpel-border'
                    )}
                    aria-hidden
                  />
                  <Avatar
                    className={cn(
                      'h-9 w-9 shrink-0 transition-transform duration-200',
                      selected ? 'ring-2 ring-kumpel-accent/50' : 'group-hover:scale-[1.02]'
                    )}>
                    <AvatarFallback
                      className={cn(
                        'text-sm font-semibold text-white',
                        selected ? 'bg-kumpel-accent' : 'bg-kumpel-input'
                      )}>
                      {room.name.slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm font-medium leading-tight'>{room.name}</p>
                    <p className='truncate font-mono text-[11px] text-kumpel-muted'>Code · {room.code}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </ScrollArea>

        <div className='mt-auto space-y-2 border-t border-kumpel-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:pb-3'>
          <CreateRoomDialog
            onCreated={(room) => {
              setMessages([])
              setRooms((prev) => {
                if (prev.some((r) => r.id === room.id)) return prev
                return [room, ...prev]
              })
              selectRoom(room)
              void fetchUserRooms({ silent: true })
            }}
          />
          <SubscribeRoomDialog
            onSubscribed={() => {
              void fetchUserRooms({ silent: true })
            }}
          />
        </div>
      </aside>

      <div className={mainClass}>
        {selectedRoom ? (
          <ChatRoom
            room={selectedRoom}
            onNavigateBack={() => setShowMobileChat(false)}
          />
        ) : (
          <div className='flex h-full flex-col items-center justify-center gap-4 px-6 text-center'>
            <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-kumpel-sidebar ring-1 ring-kumpel-border'>
              <Hash
                className='h-8 w-8 text-kumpel-muted'
                aria-hidden
              />
            </div>
            <div>
              <p className='text-lg font-semibold text-white'>Select a channel</p>
              <p className='mt-1 max-w-sm text-sm text-kumpel-muted'>
                Pick a room in the sidebar to start messaging, or create a new channel for your group.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
