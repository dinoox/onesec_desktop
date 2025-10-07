import {
  GlobalConfig,
  IPC_USER_CONFIG_GET_CHANNEL,
  IPC_USER_CONFIG_SET_CHANNEL,
} from '../../main/types/message'

export class UserConfigService {
  static async getConfig(): Promise<GlobalConfig> {
    return window.ipcRenderer.invoke(IPC_USER_CONFIG_GET_CHANNEL)
  }

  static async setConfig(config: GlobalConfig): Promise<{ success: boolean }> {
    return window.ipcRenderer.invoke(IPC_USER_CONFIG_SET_CHANNEL, config)
  }
}
