import Store from 'electron-store'
import { StoreSchema, USER_DEFAULT_CONFIG } from '../types/config.ts'

class UserConfigManager {
  private store: Store<StoreSchema>

  constructor() {
    this.store = new Store<StoreSchema>({
      name: 'config',
      defaults: USER_DEFAULT_CONFIG,
      clearInvalidConfig: true, // 配置文件损坏，自动清除并使用默认配置
    })
  }

  getConfig(): StoreSchema {
    return this.store.store
  }

  setConfig(config: Partial<StoreSchema>): void {
    Object.entries(config).forEach(([key, value]) => {
      if (value !== undefined) {
        this.store.set(key as keyof StoreSchema, value)
      }
    })
  }

  updateHotkeyConfig(mode: string, hotkey_combination: string[]): void {
    const configs = this.store.get('hotkey_configs', USER_DEFAULT_CONFIG.hotkey_configs)
    const index = configs.findIndex((c) => c.mode === mode)

    if (index !== -1) {
      configs[index].hotkey_combination = hotkey_combination
    } else {
      configs.push({ mode: mode as any, hotkey_combination })
    }

    this.store.set('hotkey_configs', configs)
  }
}

export default new UserConfigManager()
