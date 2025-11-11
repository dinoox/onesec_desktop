import { HotkeyConfig } from './message'
import { User } from '@/types/user.ts'

// export type SystemFamily = 'debian' | 'redhat';
export enum SystemFamily {
  Debian = 'debian',
  RedHat = 'red_hat',
}

export interface EnvironmentPreferences {
  preferred_system: SystemFamily | null
}

interface StoreSchema {
  auth_token: string
  hotkey_configs: HotkeyConfig[]
  user: User | null
  translation: { show_comparison: boolean }
}

const USER_DEFAULT_CONFIG: StoreSchema = {
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
