import { create } from 'zustand'
import { devtools, persist, createJSONStorage } from 'zustand/middleware'

interface UserState {
  userName: string
  token: string
  /** Long-lived refresh token (Phoenix `POST /api/auth/refresh`). */
  refreshToken: string
  email: string
  setUserName: (userName: string) => void
  setToken: (token: string) => void
  setTokens: (tokens: { token: string; refreshToken: string }) => void
  setEmail: (email: string) => void
  clearAuth: () => void
}

const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        userName: '',
        token: '',
        refreshToken: '',
        email: '',
        setUserName: (userName) => set(() => ({ userName })),
        setToken: (token) => set(() => ({ token })),
        setTokens: ({ token, refreshToken }) => set(() => ({ token, refreshToken })),
        setEmail: (email) => set(() => ({ email })),
        clearAuth: () => set(() => ({ userName: '', token: '', refreshToken: '', email: '' }))
      }),
      {
        name: 'userStore',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          token: state.token,
          refreshToken: state.refreshToken,
          userName: state.userName,
          email: state.email
        })
      }
    )
  )
)

export default useUserStore 