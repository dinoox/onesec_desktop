import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { User } from '@/types/user'
import { StorageKeys } from '@/types/constants'
import { logout } from '@/services/api/auth-api.ts'

interface AuthStore {
  user: User
  accessToken: string
  refreshToken: string
  isAuthed: boolean
  actions: {
    setAuthed: (user: User, accessToken: string) => void
    setAccessToken: (t: string) => void
    setRefreshToken: (t: string) => void
    logout: () => Promise<void>
  }
}

const useAuthStore = create(
  persist<AuthStore>(
    (set) => ({
      user: {} as User,
      isAuthed: false,
      refreshToken: '',
      accessToken: '',
      actions: {
        setAuthed: (user, accessToken) => set({ user, accessToken, isAuthed: true }),
        setAccessToken: (t) => set({ accessToken: t }),
        setRefreshToken: (t) => set({ refreshToken: t }),
        logout: async () => {
          await logout()
          set({ user: undefined, isAuthed: false })
          localStorage.removeItem(StorageKeys.AuthStorage)
        },
      },
    }),
    {
      name: StorageKeys.AuthStorage,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) =>
        ({
          [StorageKeys.User]: state.user,
          [StorageKeys.AccessToken]: state.accessToken,
          [StorageKeys.RefreshToken]: state.refreshToken,
          [StorageKeys.Authed]: state.isAuthed,
        }) as AuthStore,
    },
  ),
)

export const useAuthActions = () => useAuthStore((state) => state.actions)

export default useAuthStore
