import { create } from 'zustand'
import { UserService } from '@/services/user-service.ts'

interface UserConfigStore {
  shortcutKeys: string[]
  shortcutCommandKeys: string[]
  showComparison: boolean
  actions: {
    loadUserConfig: () => Promise<void>
    setShowComparison: (showComparison: boolean) => Promise<void>
  }
}

const useUserConfigStore = create<UserConfigStore>((set, get) => ({
  shortcutKeys: [],
  shortcutCommandKeys: [],
  showComparison: true,
  actions: {
    loadUserConfig: async () => {
      const config = await UserService.getConfig()
      const normalConfig = config.hotkey_configs?.find((item) => item.mode === 'normal')
      const commandConfig = config.hotkey_configs?.find((item) => item.mode === 'command')
      set({
        shortcutKeys: normalConfig?.hotkey_combination || [],
        shortcutCommandKeys: commandConfig?.hotkey_combination || [],
        showComparison: config.translation?.show_comparison ?? true,
      })
    },
    setShowComparison: async (showComparison: boolean) => {
      const config = await UserService.getConfig()
      await UserService.setTranslationConfig(showComparison)
      set({ showComparison })
    },
  },
}))

export const useUserConfigActions = () => useUserConfigStore((state) => state.actions)

export default useUserConfigStore
