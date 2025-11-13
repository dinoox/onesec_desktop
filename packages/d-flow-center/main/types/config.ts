import { HotkeyConfig } from './message'
import { User } from '@/types/user.ts'
import { Theme } from '@/components/theme-provider.tsx'

interface StoreSchema {
  auth_token: string
  hotkey_configs: HotkeyConfig[]
  user: User | null
  translation: { show_comparison: boolean }
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
  ],
  user: null,
  translation: { show_comparison: true },
  theme: 'system',
}

export { USER_DEFAULT_CONFIG }
export type { StoreSchema }
