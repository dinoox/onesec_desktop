import { create } from 'zustand'
import { UserService } from '@/services/user-service.ts'

import { HotkeyMode } from '../../main/types/message.ts'

interface UserConfigStore {
  shortcutKeys: string[]
  shortcutSmartKeys: string[]
  shortcutFreeKeys: string[]
  shortcutPersonaKeys: string[]
  showComparison: boolean
  hideStatusPanel: boolean
  historyRetention: string
  actions: {
    loadUserConfig: () => Promise<void>
    setShowComparison: (showComparison: boolean) => Promise<void>
    setHideStatusPanel: (hideStatusPanel: boolean) => Promise<void>
    setHistoryRetention: (historyRetention: string) => Promise<void>
    setShortcutKeys: (keys: string[]) => void
    setShortcutSmartKeys: (keys: string[]) => void
    setShortcutFreeKeys: (keys: string[]) => void
    setShortcutPersonaKeys: (keys: string[]) => void
  }
}

const useUserConfigStore = create<UserConfigStore>((set, get) => ({
  shortcutKeys: [],
  shortcutSmartKeys: [],
  shortcutFreeKeys: [],
  shortcutPersonaKeys: [],
  showComparison: true,
  hideStatusPanel: false,
  historyRetention: 'forever',
  actions: {
    loadUserConfig: async () => {
      const config = await UserService.getConfig()
      const settings = config.setting
      const normalConfig = config.hotkey_configs?.find(
        (item: any) => item.mode === 'normal',
      )
      const smartConfig = config.hotkey_configs?.find(
        (item: any) => item.mode === 'smart',
      )
      const freeConfig = config.hotkey_configs?.find((item: any) => item.mode === 'free')
      const personaConfig = config.hotkey_configs?.find(
        (item: any) => item.mode === 'persona',
      )
      set({
        shortcutKeys: normalConfig?.hotkey_combination || ['Fn'],
        shortcutSmartKeys: smartConfig?.hotkey_combination || ['Fn', 'LCmd'],
        shortcutFreeKeys: freeConfig?.hotkey_combination || ['Fn', 'Space'],
        shortcutPersonaKeys: personaConfig?.hotkey_combination || [],
        showComparison: settings?.show_comparison ?? true,
        hideStatusPanel: settings?.hide_status_panel ?? false,
        historyRetention: settings?.history_retention ?? 'forever',
      })
    },
    setShowComparison: async (showComparison: boolean) => {
      await UserService.setPartialConfig({
        setting: {
          show_comparison: showComparison,
          hide_status_panel: get().hideStatusPanel,
          history_retention: get().historyRetention,
        },
      })
      set({ showComparison })
    },
    setHideStatusPanel: async (hideStatusPanel: boolean) => {
      await UserService.setPartialConfig({
        setting: {
          show_comparison: get().showComparison,
          hide_status_panel: hideStatusPanel,
          history_retention: get().historyRetention,
        },
      })
      set({ hideStatusPanel })
    },
    setHistoryRetention: async (historyRetention: string) => {
      await UserService.setPartialConfig({
        setting: {
          show_comparison: get().showComparison,
          hide_status_panel: get().hideStatusPanel,
          history_retention: historyRetention,
        },
      })
      set({ historyRetention })
    },
    setShortcutKeys: (keys: string[]) => set({ shortcutKeys: keys }),
    setShortcutSmartKeys: (keys: string[]) => set({ shortcutSmartKeys: keys }),
    setShortcutFreeKeys: (keys: string[]) => set({ shortcutFreeKeys: keys }),
    setShortcutPersonaKeys: (keys: string[]) => set({ shortcutPersonaKeys: keys }),
  },
}))

export const useUserConfigActions = () => useUserConfigStore((state) => state.actions)

export default useUserConfigStore
