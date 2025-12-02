import { create } from 'zustand'
import { UserService } from '@/services/user-service.ts'

import { HotkeyMode } from '../../main/types/message.ts'

interface UserConfigStore {
  shortcutKeys: string[]
  shortcutCommandKeys: string[]
  showComparison: boolean
  actions: {
    loadUserConfig: () => Promise<void>
    setShowComparison: (showComparison: boolean) => Promise<void>
    setShortcutKeys: (keys: string[]) => void
    setShortcutCommandKeys: (keys: string[]) => void
    updateHotkeyConfig: (mode: HotkeyMode, keys: string[]) => Promise<void>
  }
}

const useUserConfigStore = create<UserConfigStore>((set, _) => ({
  shortcutKeys: [],
  shortcutCommandKeys: [],
  showComparison: true,
  actions: {
    loadUserConfig: async () => {
      const config = await UserService.getConfig()
      const normalConfig = config.hotkey_configs?.find(
        (item: any) => item.mode === 'normal',
      )
      const commandConfig = config.hotkey_configs?.find(
        (item: any) => item.mode === 'command',
      )
      set({
        shortcutKeys: normalConfig?.hotkey_combination || ['Fn'],
        shortcutCommandKeys: commandConfig?.hotkey_combination || ['Fn', 'LCmd'],
        showComparison: config.translation?.show_comparison ?? true,
      })
    },
    setShowComparison: async (showComparison: boolean) => {
      await UserService.setPartialConfig({
        translation: { show_comparison: showComparison },
      })
      set({ showComparison })
    },
    setShortcutKeys: (keys: string[]) => set({ shortcutKeys: keys }),
    setShortcutCommandKeys: (keys: string[]) => set({ shortcutCommandKeys: keys }),
    updateHotkeyConfig: async (_mode: HotkeyMode, _keys: string[]) => {
      // TODO: implement
    },
  },
}))

export const useUserConfigActions = () => useUserConfigStore((state) => state.actions)

export default useUserConfigStore
