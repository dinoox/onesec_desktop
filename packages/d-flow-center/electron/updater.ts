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
      return item.replace(/\x1b\[[0-9;]*m/g, '')
    }
    return item
  })
}
autoUpdater.logger = log
// if (!app.isPackaged) {
//   autoUpdater.forceDevUpdateConfig = true
// }

autoUpdater.on('checking-for-update', () => {
  console.log('checking-for-update')
})

autoUpdater.on('update-available', (info) => {
  console.log('发现新版本')
})

autoUpdater.on('update-not-available', (info) => {
  console.log('当前已是最新版本')
})

autoUpdater.on('error', (err) => {
  console.log('更新错误:', err)
})

autoUpdater.on('download-progress', (progressObj) => {
  console.log(`下载进度: ${progressObj.percent}%`)
})

autoUpdater.on('update-downloaded', (info) => {
  const ipcMessage: IPCMessage = buildIPCMessage(MessageTypes.APP_UPDATE_DOWNLOADED, {
    type: MessageTypes.APP_UPDATE_DOWNLOADED,
    data: info,
  })

  windowManager.broadcast(DEFAULT_IPC_CHANNEL, ipcMessage)
  console.log('更新下载完成')
})

export const checkForUpdates = async () => {
  await new Promise((resolve) => setTimeout(resolve, 3000))
  await autoUpdater.checkForUpdatesAndNotify()
}

export default autoUpdater
