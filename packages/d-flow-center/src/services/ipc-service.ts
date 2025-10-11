import {
  DEFAULT_IPC_CHANNEL,
  IPC_HIDE_STATUS_WINDOW_CHANNEL,
  IPC_RESIZE_STATUS_WINDOW_CHANNEL,
  IPC_SHOW_STATUS_WINDOW_CHANNEL,
  IPC_HOT_KEY_SETTING_START_CHANNEL,
  IPCMessage,
  MessageType,
  IPC_HOT_KEY_SETTING_END_CHANNEL,
  IPC_PERMISSION_SET_CHANNEL,
  IPC_PERMISSION_GET_CHANNEL,
  IPC_OPEN_EXTERNAL_URL_CHANNEL,
} from '../../main/types/message.ts'
import useStatusStore, { PermissionStatus, Status } from '@/store/status-store.ts'
import SoundService from '@/services/sound-service.ts'

class IPCService {
  constructor() {}

  async initialize() {
    if (!window.ipcRenderer) {
      throw new Error('IPC service requires an IPC server')
    }

    window.ipcRenderer.on(DEFAULT_IPC_CHANNEL, (_event, data) =>
      this.handleIPCMessage(data),
    )
    console.log(`[IPCService] Initialized`)
  }

  async handleIPCMessage(message: IPCMessage) {
    console.log(`[IPCService] ${JSON.stringify(message)}`)

    const {
      setMode,
      setStatus,
      setPermissionStatus,
      setHotkeySettingStatus,
      setAudioLevel,
      setIPCMessage,
      setAuthTokenInvalid,
    } = useStatusStore.getState().actions

    setIPCMessage(message)

    const action = message.action as MessageType

    if (action === 'volume_data') {
      if (message.data?.data?.volume !== undefined) {
        setAudioLevel(SoundService.normalizeVolumeValue(message.data.data.volume))
      }
      return
    }

    if (action === 'permission_status') {
      const pmStatus = message.data?.data as PermissionStatus
      const preStatus = useStatusStore.getState().permissionStatus
      if (
        pmStatus.accessibility === preStatus.accessibility &&
        pmStatus.microphone === preStatus.microphone
      ) {
        return
      }
      if (!pmStatus.accessibility || !pmStatus.microphone) {
        await this.resizeStatusWindow(320, 130)
      } else if (pmStatus.accessibility && pmStatus.microphone) {
        await this.resizeStatusWindow(90, 40)
      }
      setPermissionStatus(pmStatus)
      return
    }

    if (action === 'auth_token_failed') {
      setAuthTokenInvalid(true)
      return
    }

    if (action === 'start_recording') {
      setStatus('speaking')
      setMode(message.data?.data?.recognition_mode || 'normal')
      await SoundService.playStartRecording()
      return
    }

    if (action === 'stop_recording') {
      setStatus('processing')
      setAudioLevel(0)
      await SoundService.playStopRecording()
      return
    }

    if (action === 'recording_timeout') {
      await this.showStatusWindowNotification(async () => {
        setStatus('notification')
        await SoundService.playNotification()
        await delay(4000)
        setStatus('idle')
      })

      return
    }

    if (action === 'hotkey_setting_update' || action === 'hotkey_setting_result') {
      setHotkeySettingStatus(action)
      return
    }

    if (action === 'mode_upgrade') {
      setMode('command')
      return
    }

    setStatus('idle')
  }

  async resizeStatusWindow(width: number, height: number) {
    return await window.ipcRenderer.invoke(
      IPC_RESIZE_STATUS_WINDOW_CHANNEL,
      width,
      height,
    )
  }

  async showStatusWindow() {
    return await window.ipcRenderer.invoke(IPC_SHOW_STATUS_WINDOW_CHANNEL)
  }

  async hideStatusWindow() {
    return await window.ipcRenderer.invoke(IPC_HIDE_STATUS_WINDOW_CHANNEL)
  }

  // Permission
  async getPermissionStatus(): Promise<PermissionStatus> {
    return await window.ipcRenderer.invoke(IPC_PERMISSION_GET_CHANNEL)
  }

  async askForPermissionSetting(ps: PermissionStatus) {
    return await window.ipcRenderer.invoke(IPC_PERMISSION_SET_CHANNEL, ps)
  }

  // Hotkey Channel
  async startHotkeySetting(mode: 'normal' | 'command') {
    return await window.ipcRenderer.invoke(IPC_HOT_KEY_SETTING_START_CHANNEL, mode)
  }

  async endHotkeySetting(mode: 'normal' | 'command', hotkey_combination: any[]) {
    return await window.ipcRenderer.invoke(
      IPC_HOT_KEY_SETTING_END_CHANNEL,
      mode,
      hotkey_combination,
    )
  }

  // External URL
  async openExternalUrl(url: string) {
    return await window.ipcRenderer.invoke(IPC_OPEN_EXTERNAL_URL_CHANNEL, url)
  }

  /**
   * 向所有窗口广播消息
   * @param handleFn - 处理函数
   * @param completeFn - 后置处理函数
   * @param autoClose - 是否默认关闭
   * @param closeDelay - 消息通道
   * @returns 成功发送的窗口数量
   */
  async showStatusWindowNotification(
    handleFn: Function,
    completeFn: Function = () => {},
    autoClose: boolean = true,
    closeDelay: number = 0,
  ) {
    await this.resizeStatusWindow(320, 130)

    await handleFn()

    if (autoClose) {
      await delay(closeDelay)
      await this.resizeStatusWindow(90, 40)
    }
    await completeFn()
  }
}

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
export default new IPCService()
