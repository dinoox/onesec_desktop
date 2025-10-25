import { create } from 'zustand'
import { UserService } from '@/services/user-service.ts'

interface UserConfigStore {
  shortcutKeys: string[]
  shortcutCommandKeys: string[]
  actions: {
    loadUserConfig: () => Promise<void>
  }
}

const useUserConfigStore = create<UserConfigStore>((set, get) => ({
  shortcutKeys: [],
  shortcutCommandKeys: [],
  actions: {
    loadUserConfig: async () => {
      const config = await UserService.getConfig()
      const normalConfig = config.hotkey_configs?.find((item) => item.mode === 'normal')
      const commandConfig = config.hotkey_configs?.find((item) => item.mode === 'command')
      set({
        shortcutKeys: normalConfig?.hotkey_combination || [],
        shortcutCommandKeys: commandConfig?.hotkey_combination || [],
      })
    }
  }
}))

export const useUserConfigActions = () => useUserConfigStore((state) => state.actions)

export default useUserConfigStore
