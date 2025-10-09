import {
  DEFAULT_IPC_CHANNEL, IPC_HIDE_STATUS_WINDOW_CHANNEL,
  IPC_RESIZE_STATUS_WINDOW_CHANNEL, IPC_SHOW_STATUS_WINDOW_CHANNEL,
  IPCMessage,
  MessageType,
} from '../../main/types/message.ts'
import useStatusStore, { Status } from '@/store/statusStore'
import SoundService from '@/services/soundService.ts'

class IPCService {
  constructor() {}

  async initialize() {
    if (!window.ipcRenderer) {
      throw new Error('IPC service requires an IPC server')
    }
    window.ipcRenderer.on(DEFAULT_IPC_CHANNEL, (_event, data) => this.handleIPCMessage(data))
    console.log(`[IPCService] Initialized`)
  }

  async handleIPCMessage(data: IPCMessage) {
    console.log(`[IPCService] ${JSON.stringify(data)}`)

    const { setMode, setStatus, setAudioLevel } = useStatusStore.getState().actions

    const action = data.action as MessageType

    if (action === 'volume_data') {
      if (data.data?.data?.volume !== undefined) {
        setAudioLevel(SoundService.normalizeVolumeValue(data.data.data.volume))
      }
      return
    }

    if (action === 'start_recording') {
      setStatus('speaking')
      setMode(data.data?.data?.recognition_mode || 'normal')
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
      await this.resizeStatusWindow(320, 130)
      setStatus('notification')
      await SoundService.playNotification()
      await delay(4000);
      setStatus('idle');
      await delay(2000);
      await this.resizeStatusWindow(90, 30)
      return
    }

    if (action === 'mode_upgrade') {
      setMode('command')
      return
    }

    setStatus('idle')
  }

  async resizeStatusWindow(width: number, height: number) {
    return await window.ipcRenderer.invoke(IPC_RESIZE_STATUS_WINDOW_CHANNEL, width, height)

  }

  async showStatusWindow() {
    return await window.ipcRenderer.invoke(IPC_SHOW_STATUS_WINDOW_CHANNEL)
  }

  async hideStatusWindow() {
    return await window.ipcRenderer.invoke(IPC_HIDE_STATUS_WINDOW_CHANNEL)
  }
}

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
export default new IPCService()
