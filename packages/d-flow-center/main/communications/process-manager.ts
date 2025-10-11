import log from 'electron-log'
import windowManager, { WINDOW_STATUS_ID } from '../services/window-manager.ts'
import udsService from './uds-service.ts'
import nativeProcessManager from '../services/native-process-manager.ts'
import {
  DEFAULT_IPC_CHANNEL,
  IPC_HIDE_STATUS_WINDOW_CHANNEL,
  IPC_RESIZE_STATUS_WINDOW_CHANNEL,
  IPC_SHOW_STATUS_WINDOW_CHANNEL,
  IPC_HOT_KEY_SETTING_START_CHANNEL,
  IPC_USER_CONFIG_GET_CHANNEL,
  IPC_USER_CONFIG_SET_CHANNEL,
  IPCMessage,
  Message,
  MessageTypes,
  IPC_HOT_KEY_SETTING_END_CHANNEL,
  IPC_USER_LOGIN_CHANNEL,
  IPC_USER_LOGOUT_CHANNEL,
  IPC_PERMISSION_SET_CHANNEL,
  IPC_PERMISSION_GET_CHANNEL,
} from '../types/message.ts'
import userConfigManager from '../services/user-config-manager.ts'
import { ipcMain } from 'electron'
import permissionService from '../services/permission-service.ts'
import { PermissionStatus } from '@/store/status-store.ts'
import { config } from 'zod'
import chalk from 'chalk'

/**
 * 全局进程管理类
 * 管理 electron 主进程，渲染进程窗口、原生进程的生命周期
 * 管理进程间通信
 */
class ProcessManager {
  constructor() {}

  async initialize() {
    log.info(chalk.green('✓', `ProcessManager initialize`))
    try {
      await udsService.start()
      await this.setupUDSForward()
      await this.setupIPCMainHandlers()
      // TODO: 暂时用 PERMISSION_STATUS 事件监测 Native Process 已启动
      udsService.on(MessageTypes.PERMISSION_STATUS, (_: any, udsMessage: any) => {
        this.syncUserConfigToNativeProcess()
        permissionService.initialize(udsMessage.data)
      })
    } catch (err) {
      log.error(err)
    }
  }

  async setupUDSForward() {
    Object.values(MessageTypes).forEach((messageType) => {
      udsService.on(messageType, (_data: any, udsMessage: any) => {
        const eventMessage: IPCMessage = {
          id: `event_${Date.now()}`,
          type: 'event',
          source: 'main',
          action: messageType,
          data: udsMessage,
          timestamp: Date.now(),
        }
        windowManager.broadcast(DEFAULT_IPC_CHANNEL, eventMessage)

        // if (messageType === 'screen_change') {
        //   windowManager.moveStatusWindowToNewScreen()
        // }
      })
    })
  }

  async syncUserConfigToNativeProcess() {
    const config = userConfigManager.getConfig()

    udsService.broadcast({
      type: MessageTypes.INIT_CONFIG,
      timestamp: Date.now(),
      data: {
        auth_token: config.auth_token,
        hotkey_configs: config.hotkey_configs,
      },
    })

    log.info(`Init Native Config: ${JSON.stringify(config)}`)
  }

  async setupIPCMainHandlers() {
    ipcMain.handle(IPC_USER_CONFIG_GET_CHANNEL, () => {
      return userConfigManager.getConfig()
    })

    ipcMain.handle(IPC_USER_CONFIG_SET_CHANNEL, async (_, config) => {
      userConfigManager.setConfig(config)
      await this.syncUserConfigToNativeProcess()
    })

    ipcMain.handle(IPC_USER_LOGIN_CHANNEL, async (_, data) => {
      await nativeProcessManager.restart()
      windowManager.showWindow(WINDOW_STATUS_ID)
    })

    ipcMain.handle(IPC_USER_LOGOUT_CHANNEL, async (_, data) => {
      await nativeProcessManager.stop()
      windowManager.hideWindow(WINDOW_STATUS_ID)
    })

    ipcMain.handle(IPC_RESIZE_STATUS_WINDOW_CHANNEL, (_, toWidth, toHeight) => {
      windowManager.resizeStatusWindow(toWidth, toHeight)
    })

    ipcMain.handle(IPC_SHOW_STATUS_WINDOW_CHANNEL, () => {
      windowManager.showWindow(WINDOW_STATUS_ID)
    })

    ipcMain.handle(IPC_HIDE_STATUS_WINDOW_CHANNEL, () => {
      windowManager.hideWindow(WINDOW_STATUS_ID)
    })

    // Permission
    ipcMain.handle(IPC_PERMISSION_GET_CHANNEL, async () => {
      return await permissionService.checkAllPermissions()
    })
    ipcMain.handle(IPC_PERMISSION_SET_CHANNEL, (_, ps: PermissionStatus) => {
      permissionService.openSettingsForPermission(ps)
    })

    //
    ipcMain.handle(IPC_HOT_KEY_SETTING_START_CHANNEL, (_, mode: string) => {
      const timestamp = Date.now()

      udsService.broadcast({
        type: 'hotkey_setting',
        timestamp,
        data: {
          mode,
          timestamp,
        },
      })
    })

    ipcMain.handle(
      IPC_HOT_KEY_SETTING_END_CHANNEL,
      (_, mode: string, hotkey_combination: any[]) => {
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
      },
    )
  }

  async destroy() {
    await udsService.stop()
    await nativeProcessManager.stop()
  }
}

export default new ProcessManager()
