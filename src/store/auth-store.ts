import { create } from 'zustand'
import type { User, LoginData } from '@/types/user'
import { UserService } from '@/services/user-service.ts'

interface AuthStore {
  user: User | null
  accessToken: string
  refreshToken: string
  isAuthed: boolean
  actions: {
    initAuth: () => Promise<void>
    setAuthed: (user: User, loginData: LoginData) => Promise<void>
    updateUser: (user: User) => Promise<void>
    logout: () => Promise<void>
  }
}

const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthed: false,
  accessToken: '',
  refreshToken: '',
  actions: {
    initAuth: async () => {
      const config = await UserService.getConfig()
      const token = config.login_data?.access_token || ''
      set({
        isAuthed: !!token,
        accessToken: token,
        refreshToken: config.login_data?.refresh_token || '',
        user: config.user,
      })
    },

    setAuthed: async (user, loginData) => {
      await UserService.setPartialConfig({
        login_data: loginData,
        user,
      })

      set({
        user,
        accessToken: loginData.access_token,
        refreshToken: loginData.refresh_token,
        isAuthed: true,
      })

      await UserService.claimLogin()
    },

    updateUser: async (user) => {
      await UserService.setPartialConfig({ user })
      set({ user })
    },

    logout: async () => {
      await UserService.setPartialConfig({
        login_data: null,
        user: null,
      })

      set({
        user: null,
        accessToken: '',
        refreshToken: '',
        isAuthed: false,
      })

      await UserService.claimLogout()
    },
  },
}))

export default useAuthStore
