import { Message } from '@/type/message/message'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

/** Cap per room to keep localStorage reasonable */
const MAX_MESSAGES_PER_ROOM = 250

interface ChatState {
  messagesByRoomId: Record<string, Message[]>
  unreadByRoomId: Record<string, number>
  hasMoreByRoomId: Record<string, boolean>
  appendMessageForRoom: (
    roomId: string,
    message: Message,
    options: { isActiveRoom: boolean }
  ) => void
  prependHistoryForRoom: (roomId: string, messages: Message[], hasMore: boolean) => void
  clearUnreadForRoom: (roomId: string) => void
  resetChat: () => void
}

const useChatStore = create<ChatState>()(
  devtools(
    persist(
      (set) => ({
        messagesByRoomId: {},
        unreadByRoomId: {},
        hasMoreByRoomId: {},
        appendMessageForRoom: (roomId, message, { isActiveRoom }) =>
          set((state) => {
            const prevList = state.messagesByRoomId[roomId] ?? []
            const knownIds = new Set(prevList.map((m) => m.id).filter(Boolean))
            if (message.id && knownIds.has(message.id)) return state
            const nextList = [...prevList, message].slice(-MAX_MESSAGES_PER_ROOM)
            const unreadByRoomId = { ...state.unreadByRoomId }
            if (!isActiveRoom) {
              unreadByRoomId[roomId] = (unreadByRoomId[roomId] ?? 0) + 1
            }
            return {
              messagesByRoomId: { ...state.messagesByRoomId, [roomId]: nextList },
              unreadByRoomId
            }
          }),
        prependHistoryForRoom: (roomId, messages, hasMore) =>
          set((state) => {
            const existing = state.messagesByRoomId[roomId] ?? []
            const knownIds = new Set(existing.map((m) => m.id).filter(Boolean))
            const newMsgs = messages.filter((m) => !m.id || !knownIds.has(m.id))
            const combined = [...newMsgs, ...existing].slice(-MAX_MESSAGES_PER_ROOM)
            return {
              messagesByRoomId: { ...state.messagesByRoomId, [roomId]: combined },
              hasMoreByRoomId: { ...state.hasMoreByRoomId, [roomId]: hasMore }
            }
          }),
        clearUnreadForRoom: (roomId) =>
          set((state) => ({
            unreadByRoomId: { ...state.unreadByRoomId, [roomId]: 0 }
          })),
        resetChat: () =>
          set({
            messagesByRoomId: {},
            unreadByRoomId: {},
            hasMoreByRoomId: {}
          })
      }),
      {
        name: 'kumpel-chat',
        partialize: (state) => ({
          messagesByRoomId: state.messagesByRoomId,
          unreadByRoomId: state.unreadByRoomId
        })
      }
    )
  )
)

export default useChatStore
