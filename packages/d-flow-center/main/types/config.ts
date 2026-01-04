import { HotkeyConfig } from './message'
import { User } from '@/types/user.ts'
import { Theme } from '@/components/theme-provider.tsx'

interface StoreSchema {
  auth_token: string
  hotkey_configs: HotkeyConfig[]
  user: User | null
  setting: {
    show_comparison: boolean
    hide_status_panel: boolean
    history_retention: string
  }
  theme: Theme
}

const USER_DEFAULT_CONFIG: StoreSchema = {
  auth_token: '',
  hotkey_configs: [
    {
      mode: 'normal',
      hotkey_combination: ['Fn'],
    },
    { mode: 'command', hotkey_combination: ['Fn', 'LCmd'] },
    { mode: 'free', hotkey_combination: ['Fn', 'Space'] },
    { mode: 'persona', hotkey_combination: [] },
  ],
  user: null,
  setting: {
    show_comparison: true,
    hide_status_panel: false,
    history_retention: 'forever',
  },
  theme: 'system',
}

export { USER_DEFAULT_CONFIG }
export type { StoreSchema }
