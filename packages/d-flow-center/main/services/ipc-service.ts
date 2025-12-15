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
  IPC_IS_FIRST_LAUNCH_CHANNEL,
  IPC_MARK_AS_LAUNCHED_CHANNEL,
  IPC_GET_AUDIOS_CHANNEL,
  IPC_DOWNLOAD_AUDIO_CHANNEL,
  IPC_DELETE_AUDIO_CHANNEL,
  IPC_READ_AUDIO_FILE_CHANNEL,
  IPC_UPDATE_AUDIO_CHANNEL,
  IPC_DELETE_AUDIOS_BY_RETENTION_CHANNEL,
  MessageTypes,
} from '../types/message'
import userConfigManager from './user-config-manager'
import nativeProcessManager from './native-process-manager'
import { ipcMain, shell, dialog } from 'electron'
import autoUpdater from '../../electron/updater'
import log from 'electron-log'
import udsService from './uds-service'
import databaseService from './database-service'
import path from 'path'
import fs from 'fs'
import windowManager from './window-manager'

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
    ipcMain.handle(IPC_IS_FIRST_LAUNCH_CHANNEL, this.handleIsFirstLaunch)
    ipcMain.handle(IPC_MARK_AS_LAUNCHED_CHANNEL, this.handleMarkAsLaunched)
    ipcMain.handle(IPC_GET_AUDIOS_CHANNEL, this.handleGetAudios)
    ipcMain.handle(IPC_DOWNLOAD_AUDIO_CHANNEL, this.handleDownloadAudio)
    ipcMain.handle(IPC_DELETE_AUDIO_CHANNEL, this.handleDeleteAudio)
    ipcMain.handle(IPC_READ_AUDIO_FILE_CHANNEL, this.handleReadAudioFile)
    ipcMain.handle(IPC_UPDATE_AUDIO_CHANNEL, this.handleUpdateAudio)
    ipcMain.handle(
      IPC_DELETE_AUDIOS_BY_RETENTION_CHANNEL,
      this.handleDeleteAudiosByRetention,
    )
  }

  // User Config
  private handleGetUserConfig = () => userConfigManager.getConfig()

  private handleSetPartialUserConfig = async (_: any, partialConfig: any) => {
    userConfigManager.setConfig(partialConfig)
    await nativeProcessManager.syncUserConfigToNativeProcess()
  }

  // User Auth
  private handleUserLogin = async () => {
    if (userConfigManager.isFirstLaunch()) {
      userConfigManager.markAsLaunched()
    }
  }

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

  // First Launch
  private handleIsFirstLaunch = () => userConfigManager.isFirstLaunch()
  private handleMarkAsLaunched = () => userConfigManager.markAsLaunched()

  // Audios
  private handleGetAudios = () => databaseService.getAudios()

  private handleDownloadAudio = async (_: any, filename: string) => {
    const configDir = path.dirname(userConfigManager.getConfigPath())
    const sourcePath = path.join(configDir, 'audios', filename)

    if (!fs.existsSync(sourcePath)) {
      throw new Error('音频文件不存在')
    }

    const result = await dialog.showSaveDialog(windowManager.getContentWindow()!, {
      defaultPath: filename,
      filters: [{ name: 'Audio Files', extensions: ['wav'] }],
    })

    if (!result.canceled && result.filePath) {
      fs.copyFileSync(sourcePath, result.filePath)
      return true
    }

    return false
  }

  private handleDeleteAudio = async (_: any, filename: string) => {
    const configDir = path.dirname(userConfigManager.getConfigPath())
    const audioPath = path.join(configDir, 'audios', filename)

    if (fs.existsSync(audioPath)) {
      fs.unlinkSync(audioPath)
    }

    return databaseService.deleteAudio(filename)
  }

  private handleReadAudioFile = async (_: any, filename: string) => {
    const configDir = path.dirname(userConfigManager.getConfigPath())
    const audioPath = path.join(configDir, 'audios', filename)

    if (!fs.existsSync(audioPath)) {
      throw new Error('音频文件不存在')
    }

    const buffer = fs.readFileSync(audioPath)
    return buffer.toString('base64')
  }

  private handleUpdateAudio = async (
    _: any,
    id: string,
    content: string,
    error: string | null = null,
  ) => {
    return databaseService.updateAudio(id, content, error)
  }

  private handleDeleteAudiosByRetention = async (_: any, retention: string) => {
    const audiosToDelete = databaseService.getAudios()
    const deletedCount = databaseService.deleteAudiosByRetention(retention)

    if (deletedCount > 0) {
      const configDir = path.dirname(userConfigManager.getConfigPath())
      const remainingAudios = databaseService.getAudios()
      const remainingFilenames = new Set(remainingAudios.map((a) => a.filename))

      audiosToDelete.forEach((audio) => {
        if (!remainingFilenames.has(audio.filename)) {
          const audioPath = path.join(configDir, 'audios', audio.filename)
          if (fs.existsSync(audioPath)) {
            fs.unlinkSync(audioPath)
          }
        }
      })
    }

    return deletedCount
  }
}

export default new IPCService()
