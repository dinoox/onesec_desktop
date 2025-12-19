import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
import {
  buildIPCMessage,
  DEFAULT_IPC_CHANNEL,
  IPCMessage,
  MessageTypes,
} from '../main/types/message.ts'
import windowManager from '../main/services/window-manager.ts'
import { app } from 'electron'

log.transports.file.format = (message) => {
  return message.data.map((item) => {
    if (typeof item === 'string') {
      // eslint-disable-next-line no-control-regex
      return item.replace(/\x1b\[[0-9;]*m/g, '')
    }
    return item
  })
}

autoUpdater.logger = log
let updateCheckTimer: NodeJS.Timeout | null = null
const CHECK_INTERVAL = 30 * 60 * 1000 // 30 min

// if (!app.isPackaged) {
//   autoUpdater.forceDevUpdateConfig = true
// }

autoUpdater.on('checking-for-update', () => {
  log.info('checking-for-update')
})

autoUpdater.on('update-available', (info) => {
  log.info('发现新版本')
})

autoUpdater.on('update-not-available', (info) => {
  log.info('当前已是最新版本')
})

autoUpdater.on('error', (err) => {
  log.info('更新错误:', err)
})

autoUpdater.on('download-progress', (progressObj) => {
  log.info(`下载进度: ${progressObj.percent}%`)
})

autoUpdater.on('update-downloaded', (info) => {
  const ipcMessage: IPCMessage = buildIPCMessage(MessageTypes.APP_UPDATE_DOWNLOADED, {
    type: MessageTypes.APP_UPDATE_DOWNLOADED,
    data: info,
  })
  windowManager.broadcast(DEFAULT_IPC_CHANNEL, ipcMessage)
  log.info('更新下载完成')
})

const checkForUpdates = async () => {
  await new Promise((resolve) => setTimeout(resolve, 3000))
  await autoUpdater.checkForUpdatesAndNotify()
}

const startPeriodicUpdateCheck = async () => {
  if (updateCheckTimer) {
    clearInterval(updateCheckTimer)
  }

  await checkForUpdates()

  updateCheckTimer = setInterval(() => {
    checkForUpdates()
  }, CHECK_INTERVAL)
}

export default autoUpdater
export { startPeriodicUpdateCheck, checkForUpdates }
