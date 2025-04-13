import { Message } from '@/type/message/message'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface ChatState {
  messages: Message[]
  setMessages: (messages: Message[]) => void
}

const useChatStore = create<ChatState>()(
  devtools(
    persist(
      (set) => ({
        messages: [],
        setMessages: (messages) => set(() => ({ messages }))
      }),
      { name: 'chatStore' }
    )
  )
)

export default useChatStore 