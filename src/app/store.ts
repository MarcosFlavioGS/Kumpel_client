import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface ChatState {
  userName: string
  chatId: string
  code: string
  setUserName: (userName: string) => void
  setChatId: (chatId: string) => void
  setCode: (code: string) => void
}

const useStore = create<ChatState>()(
  devtools(
    persist(
      (set) => ({
		userName: '',
        chatId: '',
        code: '',
        setUserName: (userName) => set(() => ({ userName: userName })),
        setChatId: (chatId) => set(() => ({ chatId: chatId })), 
        setCode: (code) => set(() => ({ code: code }))
      }),
      { name: 'chatStore' }
    )
  )
)

export default useStore
