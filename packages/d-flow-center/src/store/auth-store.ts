import { create } from 'zustand'
import type { User } from '@/types/user'
import { logout } from '@/services/api/auth-api.ts'
import { UserService } from '@/services/user-service.ts'

interface AuthStore {
  user: User | null
  accessToken: string
  isAuthed: boolean
  actions: {
    initAuth: () => Promise<void>
    setAuthed: (user: User, accessToken: string) => Promise<void>
    updateUser: (user: User) => Promise<void>
    logout: () => Promise<void>
  }
}

const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthed: false,
  accessToken: '',
  actions: {
    initAuth: async () => {
      const config = await UserService.getConfig()
      const hasToken = !!config.auth_token
      set({
        isAuthed: hasToken,
        accessToken: config.auth_token,
        user: config.user,
      })
    },

    setAuthed: async (user, accessToken) => {
      await UserService.setPartialConfig({
        auth_token: accessToken,
        user,
      })

      set({
        user,
        accessToken,
        isAuthed: true,
      })

      await UserService.claimLogin()
    },

    updateUser: async (user) => {
      await UserService.setPartialConfig({ user })
      set({ user })
    },

    logout: async () => {
      logout().then()

      await UserService.setPartialConfig({
        auth_token: '',
        user: null,
      })

      set({
        user: null,
        accessToken: '',
        isAuthed: false,
      })

      await UserService.claimLogout()
    },
  },
}))

export default useAuthStore
