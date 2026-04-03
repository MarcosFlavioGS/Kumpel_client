import { Message } from '@/type/message/message'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

/** Cap per room to keep localStorage reasonable */
const MAX_MESSAGES_PER_ROOM = 250

interface ChatState {
  messagesByRoomId: Record<string, Message[]>
  unreadByRoomId: Record<string, number>
  appendMessageForRoom: (
    roomId: string,
    message: Message,
    options: { isActiveRoom: boolean }
  ) => void
  clearUnreadForRoom: (roomId: string) => void
  resetChat: () => void
}

const useChatStore = create<ChatState>()(
  devtools(
    persist(
      (set) => ({
        messagesByRoomId: {},
        unreadByRoomId: {},
        appendMessageForRoom: (roomId, message, { isActiveRoom }) =>
          set((state) => {
            const prevList = state.messagesByRoomId[roomId] ?? []
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
        clearUnreadForRoom: (roomId) =>
          set((state) => ({
            unreadByRoomId: { ...state.unreadByRoomId, [roomId]: 0 }
          })),
        resetChat: () =>
          set({
            messagesByRoomId: {},
            unreadByRoomId: {}
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
