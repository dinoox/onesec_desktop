import {
  DEFAULT_IPC_CHANNEL,
  HotkeyMode,
  IPC_HOT_KEY_SETTING_END_CHANNEL,
  IPC_HOT_KEY_SETTING_START_CHANNEL,
  IPC_OPEN_EXTERNAL_URL_CHANNEL,
  IPC_IS_FIRST_LAUNCH_CHANNEL,
  IPC_MARK_AS_LAUNCHED_CHANNEL,
  IPCMessage,
  MessageType,
} from '../../main/types/message.ts'
import useStatusStore from '@/store/status-store.ts'
import useUserConfigStore from '@/store/user-config-store.ts'
import useAuthStore from '@/store/auth-store.ts'

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

    const { setAuthTokenInvalid, setUpdateInfo, setHotkeySettingStatus, setIPCMessage } =
      useStatusStore.getState().actions
    const { loadUserConfig } = useUserConfigStore.getState().actions
    const action = message.action as MessageType

    setIPCMessage(message)
    if (action === 'auth_token_failed') {
      setAuthTokenInvalid(true)
      return
    }

    if (action === 'config_updated') {
      await useAuthStore.getState().actions.initAuth()
      return
    }

    if (action === 'hotkey_setting_update' || action === 'hotkey_setting_result') {
      setHotkeySettingStatus(action)
      return
    }

    if (action === 'app_update_downloaded') {
      const { version, releaseDate } = message.data?.data || {}
      setUpdateInfo({ version, releaseDate })
      return
    }
  }

  // External URL
  async openExternalUrl(url: string) {
    return await window.ipcRenderer.invoke(IPC_OPEN_EXTERNAL_URL_CHANNEL, url)
  }

  // Hotkey Setting
  async startHotkeySetting(mode: HotkeyMode) {
    return await window.ipcRenderer.invoke(IPC_HOT_KEY_SETTING_START_CHANNEL, mode)
  }

  async endHotkeySetting(mode: HotkeyMode) {
    return await window.ipcRenderer.invoke(IPC_HOT_KEY_SETTING_END_CHANNEL, mode)
  }

  // First Launch
  async isFirstLaunch(): Promise<boolean> {
    return await window.ipcRenderer.invoke(IPC_IS_FIRST_LAUNCH_CHANNEL)
  }

  async markAsLaunched(): Promise<void> {
    return await window.ipcRenderer.invoke(IPC_MARK_AS_LAUNCHED_CHANNEL)
  }
}

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
export default new IPCService()
