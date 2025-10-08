import { app } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import { GlobalConfig } from '../types/message'

export class UserConfigManager {
  private static instance: UserConfigManager | null = null
  private readonly configPath: string
  private config: GlobalConfig

  private readonly DEFAULT_CONFIG: GlobalConfig = {
    auth_token: null,
    hotkey_configs: [
      {
        mode: 'normal',
        hotkey_combination: ['fn', 'Opt⌥'],
      },
      { mode: 'command', hotkey_combination: ['fn', 'Cmd⌘'] },
    ],
  }

  private constructor() {
    const userDataPath = app.getPath('userData')
    this.configPath = path.join(userDataPath, 'config.json')
    this.config = this.loadConfig()
  }

  static getInstance(): UserConfigManager {
    if (!UserConfigManager.instance) {
      UserConfigManager.instance = new UserConfigManager()
    }
    return UserConfigManager.instance
  }

  getConfig(): GlobalConfig {
    this.config = this.loadConfig()
    return { ...this.config }
  }

  setConfig(config: GlobalConfig) {
    this.config = { ...config }
    this.saveConfig(this.config)
  }

  private loadConfig(): GlobalConfig {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, 'utf-8')
        const config = JSON.parse(data)
        return { ...this.DEFAULT_CONFIG, ...config }
      } else {
        // 文件不存在，创建默认配置
        this.saveConfig(this.DEFAULT_CONFIG)
        return { ...this.DEFAULT_CONFIG }
      }
    } catch (error) {
      return { ...this.DEFAULT_CONFIG }
    }
  }

  private saveConfig(config: GlobalConfig): void {
    try {
      const configDir = path.dirname(this.configPath)
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true })
      }
      fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2), 'utf-8')
    } catch (error) {
      throw error
    }
  }
}

export const userConfigManager = UserConfigManager.getInstance()
