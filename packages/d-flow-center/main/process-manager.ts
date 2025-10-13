import log from 'electron-log'
import windowManager, {
  WINDOW_CONTENT_ID,
  WINDOW_STATUS_ID,
} from './services/window-manager.ts'
import udsService from './services/uds-service.ts'
import nativeProcessManager from './services/native-process-manager.ts'
import { DEFAULT_IPC_CHANNEL, MessageTypes, buildIPCMessage } from './types/message.ts'
import permissionService from './services/permission-service.ts'
import ipcService from './services/ipc-service.ts'
import { createWindow } from '../electron/main.ts'
import userConfigManager from './services/user-config-manager.ts'

/**
 * 全局进程管理类
 * 管理 electron 主进程，渲染进程窗口、Native 进程的生命周期
 * 管理进程间通信
 */
class ProcessManager {
  constructor() {}

  async initialize() {
    try {
      await udsService.start()
      await this.setupUDSForward()
      await ipcService.initialize()
      udsService.on(MessageTypes.CONNECTION_SUCCESS, () => {
        nativeProcessManager.syncUserConfigToNativeProcess()
        permissionService.initialize()
      })
    } catch (err) {
      log.error(err)
    }
  }

  async setupUDSForward() {
    Object.values(MessageTypes).forEach((messageType) => {
      udsService.on(messageType, (_data: any, udsMessage: any) => {
        windowManager.broadcast(
          DEFAULT_IPC_CHANNEL,
          buildIPCMessage(messageType, udsMessage),
        )

        if (messageType === 'auth_token_failed') {
          nativeProcessManager.stop()
          if (!windowManager.getContentWindow()) {
            createWindow(() => {
              windowManager.broadcast(
                DEFAULT_IPC_CHANNEL,
                buildIPCMessage(messageType, udsMessage),
              )
            })
          }
          windowManager.getWindow(WINDOW_CONTENT_ID)?.show()
          windowManager.getWindow(WINDOW_STATUS_ID)?.hide()
        }

        if (messageType === 'hotkey_setting_result') {
          const { mode, hotkey_combination } = udsMessage.data || {}
          if (!(mode && hotkey_combination)) return

          const conflictingMode = userConfigManager.getConfig().hotkey_configs.find(
            (conf) =>
              conf.mode !== mode &&
              JSON.stringify(conf.hotkey_combination) ===
              JSON.stringify(hotkey_combination)
          )

          if (conflictingMode) {
            nativeProcessManager.syncUserConfigToNativeProcess()
          }
        }
      })
    })
  }

  async destroy() {
    await udsService.stop()
    await nativeProcessManager.stop()
  }
}

export default new ProcessManager()
