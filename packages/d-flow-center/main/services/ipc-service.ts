import {
  IPC_HIDE_STATUS_WINDOW_CHANNEL,
  IPC_RESIZE_STATUS_WINDOW_CHANNEL,
  IPC_SHOW_STATUS_WINDOW_CHANNEL,
  IPC_HOT_KEY_SETTING_START_CHANNEL,
  IPC_HOT_KEY_SETTING_END_CHANNEL,
  IPC_PERMISSION_SET_CHANNEL,
  IPC_PERMISSION_GET_CHANNEL,
  IPC_USER_CONFIG_GET_CHANNEL,
  IPC_USER_CONFIG_SET_CHANNEL,
  IPC_USER_LOGIN_CHANNEL,
  IPC_USER_LOGOUT_CHANNEL,
  IPC_OPEN_EXTERNAL_URL_CHANNEL,
} from '../types/message'
import userConfigManager from './user-config-manager'
import nativeProcessManager from './native-process-manager'
import windowManager, { WINDOW_STATUS_ID } from './window-manager'
import permissionService from './permission-service'
import { PermissionStatus } from '@/store/status-store.ts'
import udsService from './uds-service.ts'
import { ipcMain, shell } from 'electron'
import {USER_DEFAULT_CONFIG} from "../types/config.ts";

class IPCService {
  constructor() {}

  async initialize() {
    ipcMain.handle(IPC_USER_CONFIG_GET_CHANNEL, this.handleGetUserConfig)
    ipcMain.handle(IPC_USER_CONFIG_SET_CHANNEL, this.handleSetUserConfig)
    ipcMain.handle(IPC_USER_LOGIN_CHANNEL, this.handleUserLogin)
    ipcMain.handle(IPC_USER_LOGOUT_CHANNEL, this.handleUserLogout)
    ipcMain.handle(IPC_RESIZE_STATUS_WINDOW_CHANNEL, this.handleResizeStatusWindow)
    ipcMain.handle(IPC_SHOW_STATUS_WINDOW_CHANNEL, this.handleShowStatusWindow)
    ipcMain.handle(IPC_HIDE_STATUS_WINDOW_CHANNEL, this.handleHideStatusWindow)
    ipcMain.handle(IPC_PERMISSION_GET_CHANNEL, this.handleGetPermission)
    ipcMain.handle(IPC_PERMISSION_SET_CHANNEL, this.handleSetPermission)
    ipcMain.handle(IPC_HOT_KEY_SETTING_START_CHANNEL, this.handleHotKeySettingStart)
    ipcMain.handle(IPC_HOT_KEY_SETTING_END_CHANNEL, this.handleHotKeySettingEnd)
    ipcMain.handle(IPC_OPEN_EXTERNAL_URL_CHANNEL, this.handleOpenExternalUrl)
  }

  // User Config
  private handleGetUserConfig = () => userConfigManager.getConfig()

  private handleSetUserConfig = async (_: any, config: any) => {
    userConfigManager.setConfig(config)
    await nativeProcessManager.syncUserConfigToNativeProcess()
  }

  // User Auth
  private handleUserLogin = async () => {
    await nativeProcessManager.restart()
    windowManager.showWindow(WINDOW_STATUS_ID)
  }

  private handleUserLogout = async () => {
    await nativeProcessManager.stop()
    userConfigManager.setConfig(USER_DEFAULT_CONFIG)
    windowManager.hideWindow(WINDOW_STATUS_ID)
  }

  // Window Management
  private handleResizeStatusWindow = async (_: any, toWidth: number, toHeight: number) =>
    await windowManager.resizeStatusWindow(toWidth, toHeight)

  private handleShowStatusWindow = () => windowManager.showWindow(WINDOW_STATUS_ID)

  private handleHideStatusWindow = () => windowManager.hideWindow(WINDOW_STATUS_ID)

  // Permission
  private handleGetPermission = async () => await permissionService.checkAllPermissions()

  private handleSetPermission = (_: any, ps: PermissionStatus) =>
    permissionService.openSettingsForPermission(ps)

  // Hot Key Setting
  private handleHotKeySettingStart = (_: any, mode: string) => {
    const timestamp = Date.now()

    udsService.broadcast({
      type: 'hotkey_setting',
      timestamp,
      data: {
        mode,
        timestamp,
      },
    })
  }

  private handleHotKeySettingEnd = (_: any, mode: string, hotkey_combination: any[]) => {
    const timestamp = Date.now()

    udsService.broadcast({
      type: 'hotkey_setting_end',
      timestamp,
      data: {
        mode,
        timestamp,
        hotkey_combination,
      },
    })
  }

  // External URL
  private handleOpenExternalUrl = async (_: any, url: string) => {
    return await shell.openExternal(url)
  }
}

export default new IPCService()
