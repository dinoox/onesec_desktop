import {
  DEFAULT_IPC_CHANNEL,
  IPC_OPEN_EXTERNAL_URL_CHANNEL,
  IPCMessage,
  MessageType,
} from '../../main/types/message.ts'
import useStatusStore from '@/store/status-store.ts'
import useUserConfigStore from '@/store/user-config-store.ts'

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

    const { setAuthTokenInvalid } = useStatusStore.getState().actions
    const { loadUserConfig } = useUserConfigStore.getState().actions
    const action = message.action as MessageType

    if (action === 'auth_token_failed') {
      setAuthTokenInvalid(true)
      return
    }

    if (action === 'hotkey_setting_result') {
      await loadUserConfig()
      return
    }
  }

  // External URL
  async openExternalUrl(url: string) {
    return await window.ipcRenderer.invoke(IPC_OPEN_EXTERNAL_URL_CHANNEL, url)
  }
}

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
export default new IPCService()
