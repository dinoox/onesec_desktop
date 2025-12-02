import {
  IPC_USER_CONFIG_GET_CHANNEL,
  IPC_USER_CONFIG_SET_PARTIAL_CHANNEL,
  IPC_USER_LOGIN_CHANNEL,
  IPC_USER_LOGOUT_CHANNEL,
  IPC_OPEN_EXTERNAL_URL_CHANNEL,
  IPC_QUIT_AND_INSTALL_CHANNEL,
  IPC_AUTH_TOKEN_FAILED_CHANNEL,
  IPC_HOT_KEY_SETTING_START_CHANNEL,
  IPC_HOT_KEY_SETTING_RESULT_CHANNEL,
  IPC_HOT_KEY_SETTING_END_CHANNEL,
  MessageTypes,
} from '../types/message'
import userConfigManager from './user-config-manager'
import nativeProcessManager from './native-process-manager'
import { ipcMain, shell } from 'electron'
import autoUpdater from '../../electron/updater'
import log from 'electron-log'
import udsService from './uds-service'

class IPCService {
  constructor() {}

  async initialize() {
    ipcMain.handle(IPC_USER_CONFIG_GET_CHANNEL, this.handleGetUserConfig)
    ipcMain.handle(IPC_USER_CONFIG_SET_PARTIAL_CHANNEL, this.handleSetPartialUserConfig)
    ipcMain.handle(IPC_USER_LOGIN_CHANNEL, this.handleUserLogin)
    ipcMain.handle(IPC_USER_LOGOUT_CHANNEL, this.handleUserLogout)
    ipcMain.handle(IPC_AUTH_TOKEN_FAILED_CHANNEL, this.handleAuthTokenFailed)
    ipcMain.handle(IPC_OPEN_EXTERNAL_URL_CHANNEL, this.handleOpenExternalUrl)
    ipcMain.handle(IPC_QUIT_AND_INSTALL_CHANNEL, this.handleQuitAndInstall)
    ipcMain.handle(IPC_HOT_KEY_SETTING_START_CHANNEL, this.handleHotKeySettingStart)
    ipcMain.handle(IPC_HOT_KEY_SETTING_END_CHANNEL, this.handleHotKeySettingEnd)
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

  // Quit and Install
  private handleQuitAndInstall = () => {
    log.info('Quit and Install')
    autoUpdater.quitAndInstall()
  }

  // Hot Key Setting
  private handleHotKeySettingStart = (_: any, mode: string) => {
    const timestamp = Date.now()

    udsService.broadcast({
      type: MessageTypes.HOTKEY_SETTING_START,
      timestamp,
      data: { mode },
    })
  }

  private handleHotKeySettingEnd = (_: any, mode: string) => {
    const timestamp = Date.now()

    udsService.broadcast({
      type: MessageTypes.HOTKEY_SETTING_END,
      timestamp,
      data: { mode },
    })
  }
}

export default new IPCService()
