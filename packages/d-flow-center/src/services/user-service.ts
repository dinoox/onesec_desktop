import {
  GlobalConfig,
  HotkeyConfig,
  HotkeyMode,
  IPC_USER_CONFIG_GET_CHANNEL,
  IPC_USER_CONFIG_SET_CHANNEL,
  IPC_USER_LOGIN_CHANNEL,
  IPC_USER_LOGOUT_CHANNEL,
} from '../../main/types/message'

export class UserService {
  static async getConfig(): Promise<GlobalConfig> {
    return window.ipcRenderer.invoke(IPC_USER_CONFIG_GET_CHANNEL)
  }

  static async setConfig(config: GlobalConfig) {
    return window.ipcRenderer.invoke(IPC_USER_CONFIG_SET_CHANNEL, config)
  }

  static async setHotKeyConfig(mode: HotkeyMode, hotkey_combination: string[]) {
    const config = await this.getConfig()
    const updatedHotkeyConfigs =
      config.hotkey_configs?.map((item) =>
        item.mode === mode ? { ...item, hotkey_combination } : item,
      ) || []

    if (!updatedHotkeyConfigs.some((item) => item.mode === mode)) {
      updatedHotkeyConfigs.push({
        mode,
        hotkey_combination,
      })
    }

    return this.setConfig({
      ...config,
      hotkey_configs: updatedHotkeyConfigs,
    })
  }

  static async claimLogin() {
    return window.ipcRenderer.invoke(IPC_USER_LOGIN_CHANNEL)
  }

  static async claimLogout() {
    return window.ipcRenderer.invoke(IPC_USER_LOGOUT_CHANNEL)
  }
}
