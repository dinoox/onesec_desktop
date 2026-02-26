import { create } from 'zustand'
import type { User, LoginData } from '@/types/user'
import { UserService } from '@/services/user-service.ts'

interface AuthStore {
  user: User | null
  accessToken: string
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
  actions: {
    initAuth: async () => {
      const config = await UserService.getConfig()
      const token = config.login_data?.access_token || ''
      set({
        isAuthed: !!token,
        accessToken: token,
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
        isAuthed: false,
      })

      await UserService.claimLogout()
    },
  },
}))

export default useAuthStore
