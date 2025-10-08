import { GlobalConfig, HotkeyConfig } from './message'

interface StoreSchema {
  auth_token: string | null
  hotkey_configs: HotkeyConfig[]
}

const USER_DEFAULT_CONFIG: GlobalConfig = {
  auth_token: null,
  hotkey_configs: [
    {
      mode: 'normal',
      hotkey_combination: ['fn', 'Opt⌥'],
    },
    { mode: 'command', hotkey_combination: ['fn', 'Cmd⌘'] },
  ],
}

export { USER_DEFAULT_CONFIG }
export type { StoreSchema }
