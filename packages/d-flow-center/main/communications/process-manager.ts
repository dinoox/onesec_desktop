import log from 'electron-log'
import windowManager, {WINDOW_STATUS_ID} from '../services/window-manager.ts'
import udsService from './uds-service.ts'
import nativeProcessManager from '../services/native-process-manager.ts'
import {
  DEFAULT_IPC_CHANNEL, IPC_HIDE_STATUS_WINDOW_CHANNEL,
  IPC_RESIZE_STATUS_WINDOW_CHANNEL,
  IPC_USER_CONFIG_GET_CHANNEL,
  IPC_USER_CONFIG_SET_CHANNEL,
  IPCMessage,
  MessageTypes,
} from '../types/message.ts'
import userConfigManager from '../services/user-config-manager.ts'
import { ipcMain } from 'electron'

/**
 * 全局进程管理类
 * 管理 electron 主进程，渲染进程窗口、原生进程的生命周期
 * 管理进程间通信
 */
class ProcessManager {
  constructor() {}

  async initialize() {
    try {
      await udsService.start()
      await nativeProcessManager.start()
      await this.setupUDSForward()
      await this.setupIPCMainHandlers()
      // TODO: 暂时用 PERMISSION_STATUS 事件监测 Native Process 已启动
      udsService.on(MessageTypes.PERMISSION_STATUS, () => this.initNativeProcessConfig())
    } catch (err) {
      log.error(err)
    }
  }

  async setupUDSForward() {
    Object.values(MessageTypes).forEach((messageType) => {
      udsService.on(messageType, (_data: any, originalMessage: any) => {
        const eventMessage: IPCMessage = {
          id: `event_${Date.now()}`,
          type: 'event',
          source: 'worker',
          action: messageType,
          data: originalMessage,
          timestamp: Date.now(),
        }

        windowManager.broadcast(DEFAULT_IPC_CHANNEL, eventMessage)
      })
    })
  }

  async initNativeProcessConfig() {
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

      //TODO: 移动登录后处理逻辑
      await this.initNativeProcessConfig()
      windowManager.showWindow(WINDOW_STATUS_ID)
    })

    ipcMain.handle(IPC_RESIZE_STATUS_WINDOW_CHANNEL, (_, toWidth, toHeight) => {
      windowManager.resizeStatusWindow(toWidth, toHeight)
    })

    ipcMain.handle(IPC_HIDE_STATUS_WINDOW_CHANNEL, () => {
      windowManager.hideWindow(WINDOW_STATUS_ID)
    })
  }

  async destroy() {
    await udsService.stop()
    await nativeProcessManager.stop()
  }
}

export default new ProcessManager()
