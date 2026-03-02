import { HotkeyConfig } from './message'
import { User, LoginData } from '@/types/user.ts'
import { Theme } from '@/components/theme-provider.tsx'

interface StoreSchema {
  login_data: LoginData | null
  hotkey_configs: HotkeyConfig[]
  user: User | null
  setting: {
    show_comparison: boolean
    history_retention: string
  }
  theme: Theme
  personaID: number
}

const USER_DEFAULT_CONFIG: StoreSchema = {
  login_data: null,
  hotkey_configs: [
    {
      mode: 'normal',
      hotkey_combination: ['Fn'],
    },
    { mode: 'smart', hotkey_combination: ['Fn', 'LCmd'] },
    { mode: 'free', hotkey_combination: ['Fn', 'Space'] },
    { mode: 'persona', hotkey_combination: [] },
  ],
  user: null,
  setting: {
    show_comparison: true,
    history_retention: 'forever',
  },
  theme: 'system',
  personaID: 1,
}

export { USER_DEFAULT_CONFIG }
export type { StoreSchema }
