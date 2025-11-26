import {
  IPC_USER_CONFIG_GET_CHANNEL,
  IPC_USER_CONFIG_SET_PARTIAL_CHANNEL,
  IPC_USER_LOGIN_CHANNEL,
  IPC_USER_LOGOUT_CHANNEL,
  IPC_OPEN_EXTERNAL_URL_CHANNEL, IPC_AUTH_TOKEN_FAILED_CHANNEL,
} from '../types/message'
import userConfigManager from './user-config-manager'
import nativeProcessManager from './native-process-manager'
import { ipcMain, shell } from 'electron'

class IPCService {
  constructor() {}

  async initialize() {
    ipcMain.handle(IPC_USER_CONFIG_GET_CHANNEL, this.handleGetUserConfig)
    ipcMain.handle(IPC_USER_CONFIG_SET_PARTIAL_CHANNEL, this.handleSetPartialUserConfig)
    ipcMain.handle(IPC_USER_LOGIN_CHANNEL, this.handleUserLogin)
    ipcMain.handle(IPC_USER_LOGOUT_CHANNEL, this.handleUserLogout)
    ipcMain.handle(IPC_AUTH_TOKEN_FAILED_CHANNEL, this.handleAuthTokenFailed)
    ipcMain.handle(IPC_OPEN_EXTERNAL_URL_CHANNEL, this.handleOpenExternalUrl)
  }

  // User Config
  private handleGetUserConfig = () => userConfigManager.getConfig()

  private handleSetPartialUserConfig = async (_: any, partialConfig: any) => {
    userConfigManager.setConfig(partialConfig)
    await nativeProcessManager.syncUserConfigToNativeProcess()
  }

  // User Auth
  private handleUserLogin = async () => {}

  private handleUserLogout = async () => {}
  private handleAuthTokenFailed = async () => {
    await nativeProcessManager.sendAuthTokenFailed()
  }

  // External URL
  private handleOpenExternalUrl = async (_: any, url: string) => {
    return await shell.openExternal(url)
  }
}

export default new IPCService()
