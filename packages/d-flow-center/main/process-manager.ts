import log from 'electron-log'
import windowManager, { WINDOW_CONTENT_ID } from './services/window-manager.ts'
import udsService from './services/uds-service.ts'
import nativeProcessManager from './services/native-process-manager.ts'
import {
  buildIPCMessage,
  DEFAULT_IPC_CHANNEL,
  IPCMessage,
  MessageTypes,
} from './types/message.ts'
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
      await nativeProcessManager.start()
    } catch (err) {
      log.error(err)
    }
  }

  async setupUDSForward() {
    Object.values(MessageTypes).forEach((messageType) => {
      udsService.on(messageType, (_data: any, udsMessage: any) => {
        const ipcMessage: IPCMessage = buildIPCMessage(messageType, udsMessage)

        windowManager.broadcast(DEFAULT_IPC_CHANNEL, ipcMessage)

        this.ipcInterceptor(ipcMessage)
      })
    })
  }

  async ipcInterceptor(message: IPCMessage) {
    if (message.action === 'auth_token_failed') {
      if (!userConfigManager.getConfig().auth_token) return
      if (!windowManager.getContentWindow()) {
        createWindow(() => windowManager.broadcast(DEFAULT_IPC_CHANNEL, message))
      }
      windowManager.getWindow(WINDOW_CONTENT_ID)?.show()
      return
    }

    if (message.action === MessageTypes.CONFIG_UPDATED) {
      const { preferred_linux_distro } = message.data?.data || {}
      if (!preferred_linux_distro) return

      const currentUser = userConfigManager.getConfig().user
      if (currentUser) {
        userConfigManager.setConfig({
          user: {
            ...currentUser,
            preferred_linux_distro,
          },
        })
      }
    }
  }

  async destroy() {
    await udsService.stop()
    await nativeProcessManager.stop()
  }
}

export default new ProcessManager()
