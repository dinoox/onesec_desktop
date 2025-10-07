import { GlobalConfig, HotkeyConfig } from '../../main/types/message'

// 声明全局的 ipcRenderer 类型
declare global {
  interface Window {
    ipcRenderer: {
      invoke(channel: string, ...args: any[]): Promise<any>
    }
  }
}

/**
 * 配置服务 - 用于渲染进程访问主进程的配置管理
 */
export class ConfigService {
  /**
   * 获取完整配置
   */
  static async getConfig(): Promise<GlobalConfig> {
    return window.ipcRenderer.invoke('config:get')
  }

  /**
   * 获取访问令牌
   */
  static async getAccessToken(): Promise<string | null> {
    return window.ipcRenderer.invoke('config:getAccessToken')
  }

  /**
   * 设置访问令牌
   */
  static async setAccessToken(token: string | null): Promise<{ success: boolean }> {
    return window.ipcRenderer.invoke('config:setAccessToken', token)
  }

  /**
   * 获取快捷键配置
   */
  static async getHotkeyConfigs(): Promise<HotkeyConfig[]> {
    return window.ipcRenderer.invoke('config:getHotkeyConfigs')
  }

  /**
   * 设置快捷键配置
   */
  static async setHotkeyConfigs(configs: HotkeyConfig[]): Promise<{ success: boolean }> {
    return window.ipcRenderer.invoke('config:setHotkeyConfigs', configs)
  }

  /**
   * 更新配置（部分更新）
   */
  static async updateConfig(updates: Partial<GlobalConfig>): Promise<GlobalConfig> {
    return window.ipcRenderer.invoke('config:update', updates)
  }

  /**
   * 重置配置为默认值
   */
  static async resetConfig(): Promise<GlobalConfig> {
    return window.ipcRenderer.invoke('config:reset')
  }
}
