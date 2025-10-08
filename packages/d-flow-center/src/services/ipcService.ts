import { DEFAULT_IPC_CHANNEL, IPCMessage, MessageType } from '../../main/types/message.ts'
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

    const { setStatus, setAudioLevel } = useStatusStore.getState().actions

    const action = data.action as MessageType

    if (action === 'volume_data') {
      if (data.data?.data?.volume !== undefined) {
        setAudioLevel(SoundService.normalizeVolumeValue(data.data.data.volume))
      }
      return
    }

    if (action === 'start_recording') {
      const recognitionMode = data.data?.recognition_mode || 'normal'
      setStatus(recognitionMode === 'command' ? 'command' : 'speaking')
      await SoundService.playStartRecording()
      return
    }

    if (action === 'stop_recording') {
      setStatus(
        useStatusStore.getState().status === 'command' ? 'command-processing' : 'processing',
      )
      await SoundService.playStopRecording()
      return
    }

    if (action === 'mode_upgrade') {
      setStatus('command')
      return
    }

    setStatus('idle')
  }
}

export default new IPCService()
