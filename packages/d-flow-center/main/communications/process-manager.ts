import log from 'electron-log'
import { WindowManager } from '../services/window-manager.ts'
import { UDSService } from './uds-service.ts'
import { NativeProcessManager } from '../services/native-process-manager.ts'
import {
  DEFAULT_IPC_CHANNEL,
  IPC_USER_CONFIG_GET_CHANNEL,
  IPC_USER_CONFIG_SET_CHANNEL,
  IPCMessage,
  MessageTypes,
} from '../types/message.ts'
import { userConfigManager, UserConfigManager } from '../services/user-config-manager.ts'
import { ipcMain } from 'electron'

export class ProcessManager {
  private constructor() {}
  private static instance: ProcessManager | null = null

  private udsService: UDSService = UDSService.getInstance()
  private windowManager: WindowManager = WindowManager.getInstance()
  private nativeProcessManager: NativeProcessManager = NativeProcessManager.getInstance()
  private configManager: UserConfigManager = UserConfigManager.getInstance()

  static getInstance(): ProcessManager {
    if (!ProcessManager.instance) {
      ProcessManager.instance = new ProcessManager()
    }
    return ProcessManager.instance
  }

  async initialize() {
    try {
      await this.udsService.start()
      await this.nativeProcessManager.start()
      await this.setupUDSForward()
      await this.setupIPCMainHandlers()
      // TODO: 暂时用 PERMISSION_STATUS 事件监测 Native Process 已启动
      this.udsService.on(MessageTypes.PERMISSION_STATUS, () => this.initNativeProcessConfig())
    } catch (err) {
      log.error(err)
    }
  }

  async setupUDSForward() {
    Object.values(MessageTypes).forEach((messageType) => {
      this.udsService.on(messageType, (_data: any, originalMessage: any) => {
        const eventMessage: IPCMessage = {
          id: `event_${Date.now()}`,
          type: 'event',
          source: 'worker',
          action: messageType,
          data: originalMessage,
          timestamp: Date.now(),
        }

        this.windowManager.broadcast(DEFAULT_IPC_CHANNEL, eventMessage)
      })
    })
  }

  async initNativeProcessConfig() {
    const config = this.configManager.getConfig()

    this.udsService.broadcast({
      type: MessageTypes.INIT_CONFIG,
      timestamp: Date.now(),
      data: {
        auth_token: config.auth_token,
        hotkey_configs: config.hotkey_configs,
      },
    })
  }

  async setupIPCMainHandlers() {
    ipcMain.handle(IPC_USER_CONFIG_GET_CHANNEL, () => {
      return userConfigManager.getConfig()
    })

    ipcMain.handle(IPC_USER_CONFIG_SET_CHANNEL, (_, config) => {
      userConfigManager.setConfig(config)
      return { success: true }
    })
  }

  async destroy() {
    await this.udsService.stop()
    await this.nativeProcessManager.stop()
  }
}

export const processManager = ProcessManager.getInstance()
