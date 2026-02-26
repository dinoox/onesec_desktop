import fs from 'fs'
import path from 'path'
import Store from 'electron-store'
import { StoreSchema, USER_DEFAULT_CONFIG } from '../types/config.ts'
import log from 'electron-log'

class UserConfigManager {
  private store: Store<StoreSchema>
  private readonly launchMarkerPath: string


  constructor() {
    this.store = new Store<StoreSchema>({
      name: 'config',
      defaults: USER_DEFAULT_CONFIG,
      clearInvalidConfig: true,
    })

    log.info(`Store Path: ${this.store.path}`)
    this.launchMarkerPath = path.join(path.dirname(this.store.path), '.launched')
  }

  getConfig(): StoreSchema {
    return this.store.store
  }

  getConfigPath(): string {
    return this.store.path
  }

  setConfig(config: Partial<StoreSchema>): void {
    Object.entries(config).forEach(([key, value]) => {
      if (value !== undefined) {
        this.store.set(key as keyof StoreSchema, value)
      }
    })
  }

  isFirstLaunch(): boolean {
    return !fs.existsSync(this.launchMarkerPath)
  }

  markAsLaunched(): void {
    fs.writeFileSync(this.launchMarkerPath, '')
  }
}

export default new UserConfigManager()
