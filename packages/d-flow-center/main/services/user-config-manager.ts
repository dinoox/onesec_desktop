import Store from 'electron-store'
import { GlobalConfig } from '../types/message'
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

  getConfig(): GlobalConfig {
    return {
      auth_token: this.store.get('auth_token', USER_DEFAULT_CONFIG.auth_token),
      hotkey_configs: this.store.get('hotkey_configs', USER_DEFAULT_CONFIG.hotkey_configs),
    }
  }

  setConfig(config: GlobalConfig): void {
    this.store.set('auth_token', config.auth_token)
    this.store.set('hotkey_configs', config.hotkey_configs)
  }
}

export default new UserConfigManager()
