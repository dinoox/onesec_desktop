import { GlobalConfig, HotkeyConfig } from './message'
import { User } from '@/types/user.ts'

interface StoreSchema {
  auth_token: string
  hotkey_configs: HotkeyConfig[]
  user: User | null
  translation: { show_comparison: boolean }
}

const USER_DEFAULT_CONFIG: GlobalConfig = {
  auth_token: '',
  hotkey_configs: [
    {
      mode: 'normal',
      hotkey_combination: ['Fn'],
    },
    { mode: 'command', hotkey_combination: ['Fn', 'LCmd'] },
  ],
  user: null,
  translation: { show_comparison: true },
}

export { USER_DEFAULT_CONFIG }
export type { StoreSchema }
