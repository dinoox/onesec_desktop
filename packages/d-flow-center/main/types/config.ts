import { GlobalConfig, HotkeyConfig } from './message'
import { User } from '@/types/user.ts'

interface StoreSchema {
  auth_token: string
  hotkey_configs: HotkeyConfig[]
  user: User | null
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
}

export { USER_DEFAULT_CONFIG }
export type { StoreSchema }
