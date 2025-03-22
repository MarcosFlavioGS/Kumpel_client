import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface ChatState {
  userName: string
  chatId: string
  code: string
  token: string
  email: string
  setUserName: (userName: string) => void
  setChatId: (chatId: string) => void
  setCode: (code: string) => void
  setToken: (token: string) => void
  setEmail: (emal: string) => void
}

const useStore = create<ChatState>()(
  devtools(
    persist(
      (set) => ({
        userName: '',
        chatId: '',
        code: '',
        token: '',
        email: '',
        setUserName: (userName) => set(() => ({ userName: userName })),
        setChatId: (chatId) => set(() => ({ chatId: chatId })),
        setCode: (code) => set(() => ({ code: code })),
        setToken: (token) => set(() => ({ token: token })),
        setEmail: (email) => set(() => ({ email: email }))
      }),
      { name: 'chatStore' }
    )
  )
)

export default useStore
