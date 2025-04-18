import { create } from 'zustand'
import { devtools, persist, createJSONStorage } from 'zustand/middleware'

interface UserState {
  userName: string
  token: string
  email: string
  setUserName: (userName: string) => void
  setToken: (token: string) => void
  setEmail: (email: string) => void
  clearAuth: () => void
}

const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        userName: '',
        token: '',
        email: '',
        setUserName: (userName) => set(() => ({ userName })),
        setToken: (token) => set(() => ({ token })),
        setEmail: (email) => set(() => ({ email })),
        clearAuth: () => set(() => ({ userName: '', token: '', email: '' }))
      }),
      {
        name: 'userStore',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          token: state.token,
          userName: state.userName,
          email: state.email
        })
      }
    )
  )
)

export default useUserStore 