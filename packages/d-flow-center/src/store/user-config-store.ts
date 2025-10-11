import { create } from 'zustand'
import { UserService } from '@/services/user-service.ts'

interface UserConfigStore {
  shortcutKeys: string[]
  shortcutCommandKeys: string[]
  actions: {
    setShortcutKeys: (keys: string[]) => void
    setShortcutCommandKeys: (keys: string[]) => void
    loadUserConfig: () => Promise<void>
    updateHotkeyConfig: (mode: 'normal' | 'command', keys: string[]) => Promise<void>
  }
}

const useUserConfigStore = create<UserConfigStore>((set, get) => ({
  shortcutKeys: [],
  shortcutCommandKeys: [],
  actions: {
    setShortcutKeys: (keys) => set({ shortcutKeys: keys }),
    setShortcutCommandKeys: (keys) => set({ shortcutCommandKeys: keys }),
    loadUserConfig: async () => {
      const config = await UserService.getConfig()
      const normalConfig = config.hotkey_configs?.find((item) => item.mode === 'normal')
      const commandConfig = config.hotkey_configs?.find((item) => item.mode === 'command')
      set({
        shortcutKeys: normalConfig?.hotkey_combination || [],
        shortcutCommandKeys: commandConfig?.hotkey_combination || [],
      })
    },
    updateHotkeyConfig: async (mode, keys) => {
      await UserService.setHotKeyConfig(mode, keys)
      if (mode === 'normal') {
        set({ shortcutKeys: keys })
      } else {
        set({ shortcutCommandKeys: keys })
      }
    },
  },
}))

export const useUserConfigActions = () => useUserConfigStore((state) => state.actions)

export default useUserConfigStore
