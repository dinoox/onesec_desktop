import { create } from 'zustand'
import { UserService } from '@/services/user-service.ts'

import { HotkeyMode } from '../../main/types/message.ts'

interface UserConfigStore {
  shortcutKeys: string[]
  shortcutCommandKeys: string[]
  showComparison: boolean
  hideFloatingPanel: boolean
  actions: {
    loadUserConfig: () => Promise<void>
    setShowComparison: (showComparison: boolean) => Promise<void>
    setHideFloatingPanel: (hideFloatingPanel: boolean) => Promise<void>
    setShortcutKeys: (keys: string[]) => void
    setShortcutCommandKeys: (keys: string[]) => void
  }
}

const useUserConfigStore = create<UserConfigStore>((set, get) => ({
  shortcutKeys: [],
  shortcutCommandKeys: [],
  showComparison: true,
  hideFloatingPanel: false,
  actions: {
    loadUserConfig: async () => {
      const config = await UserService.getConfig()
      const settings = config.setting
      const normalConfig = config.hotkey_configs?.find(
        (item: any) => item.mode === 'normal',
      )
      const commandConfig = config.hotkey_configs?.find(
        (item: any) => item.mode === 'command',
      )
      set({
        shortcutKeys: normalConfig?.hotkey_combination || ['Fn'],
        shortcutCommandKeys: commandConfig?.hotkey_combination || ['Fn', 'LCmd'],
        showComparison: settings?.show_comparison ?? true,
        hideFloatingPanel: settings?.hide_floating_panel ?? false,
      })
    },
    setShowComparison: async (showComparison: boolean) => {
      await UserService.setPartialConfig({
        setting: {
          show_comparison: showComparison,
          hide_floating_panel: get().hideFloatingPanel,
        },
      })
      set({ showComparison })
    },
    setHideFloatingPanel: async (hideFloatingPanel: boolean) => {
      await UserService.setPartialConfig({
        setting: {
          show_comparison: get().showComparison,
          hide_floating_panel: hideFloatingPanel,
        },
      })
      set({ hideFloatingPanel })
    },
    setShortcutKeys: (keys: string[]) => set({ shortcutKeys: keys }),
    setShortcutCommandKeys: (keys: string[]) => set({ shortcutCommandKeys: keys }),
  },
}))

export const useUserConfigActions = () => useUserConfigStore((state) => state.actions)

export default useUserConfigStore
