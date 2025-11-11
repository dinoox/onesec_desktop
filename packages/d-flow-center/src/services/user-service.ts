import {
  IPC_USER_CONFIG_GET_CHANNEL,
  IPC_USER_CONFIG_SET_PARTIAL_CHANNEL,
  IPC_USER_LOGIN_CHANNEL,
  IPC_USER_LOGOUT_CHANNEL,
} from '../../main/types/message'
import { StoreSchema } from '../../main/types/config.ts'

export class UserService {
  static async getConfig(): Promise<StoreSchema> {
    return window.ipcRenderer.invoke(IPC_USER_CONFIG_GET_CHANNEL)
  }

  static async setPartialConfig(partialConfig: Partial<StoreSchema>) {
    return window.ipcRenderer.invoke(IPC_USER_CONFIG_SET_PARTIAL_CHANNEL, partialConfig)
  }

  static async claimLogin() {
    return window.ipcRenderer.invoke(IPC_USER_LOGIN_CHANNEL)
  }

  static async claimLogout() {
    return window.ipcRenderer.invoke(IPC_USER_LOGOUT_CHANNEL)
  }
}
