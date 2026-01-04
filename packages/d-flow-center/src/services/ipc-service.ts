import {
  DEFAULT_IPC_CHANNEL,
  HotkeyMode,
  IPC_HOT_KEY_SETTING_END_CHANNEL,
  IPC_HOT_KEY_SETTING_START_CHANNEL,
  IPC_HOT_KEY_DETECT_START_CHANNEL,
  IPC_HOT_KEY_DETECT_END_CHANNEL,
  IPC_OPEN_EXTERNAL_URL_CHANNEL,
  IPC_IS_FIRST_LAUNCH_CHANNEL,
  IPC_MARK_AS_LAUNCHED_CHANNEL,
  IPC_GET_AUDIOS_CHANNEL,
  IPC_DOWNLOAD_AUDIO_CHANNEL,
  IPC_DELETE_AUDIO_CHANNEL,
  IPC_READ_AUDIO_FILE_CHANNEL,
  IPC_UPDATE_AUDIO_CHANNEL,
  IPC_DELETE_AUDIOS_BY_RETENTION_CHANNEL,
  IPC_GET_SYSTEM_INFO_CHANNEL,
  IPC_READ_ERROR_LOG_CHANNEL,
  IPC_CHECK_ACCESSIBILITY_CHANNEL,
  IPC_REQUEST_ACCESSIBILITY_CHANNEL,
  IPC_CHECK_MICROPHONE_CHANNEL,
  IPC_REQUEST_MICROPHONE_CHANNEL,
  IPCMessage,
  MessageType,
  IPC_QUIT_AND_INSTALL_CHANNEL,
  IPC_GET_PERSONAS_CHANNEL,
  IPC_SAVE_PERSONAS_CHANNEL,
  IPC_CREATE_PERSONA_CHANNEL,
  IPC_UPDATE_PERSONA_CHANNEL,
  IPC_DELETE_PERSONA_CHANNEL,
} from '../../main/types/message.ts'
import { toast } from 'sonner'
import useStatusStore from '@/store/status-store.ts'
import useUserConfigStore from '@/store/user-config-store.ts'
import useAuthStore from '@/store/auth-store.ts'
import { Audios, Persona } from '../../main/services/database-service'
import router from '@/routes'
import { SystemInfo } from 'electron/system.ts'
import { updateDeviceInfo } from '@/services/api/user-api'
import { log } from 'console'

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
      setAuthTokenInvalid,
      setUpdateChecking,
      setUpdateProgress,
      setUpdateInfo,
      setHotkeySettingStatus,
      setIPCMessage,
    } = useStatusStore.getState().actions
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

    if (action === 'hotkey_detect_update') {
      const { setHotkeyDetectKeys } = useStatusStore.getState().actions
      const keys = message.data?.data?.hotkey_combination ?? []
      const isCompleted = message.data?.data?.is_completed ?? false
      setHotkeyDetectKeys(keys, isCompleted)
      return
    }

    if (action === 'app_update_checking') {
      setUpdateChecking(true)
      return
    }

    if (action === 'app_update_not_available') {
      if (useStatusStore.getState().updateChecking) {
        toast.success('当前已是最新版本')
      }

      setUpdateChecking(false)
      return
    }

    if (action === 'app_update_error') {
      setUpdateChecking(false)
      return
    }

    if (action === 'app_update_progress') {
      setUpdateProgress(message.data?.data?.data ?? 0)
      return
    }

    if (action === 'app_update_downloaded') {
      setUpdateChecking(false)
      setUpdateProgress(null)
      const { version, releaseDate } = message.data?.data || {}
      setUpdateInfo(true, { version, releaseDate })
      return
    }

    if (action === 'recording_interrupted') {
      await router.navigate('/content/history')
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

  // Hotkey Detect
  async startHotkeyDetect() {
    return await window.ipcRenderer.invoke(IPC_HOT_KEY_DETECT_START_CHANNEL)
  }

  async endHotkeyDetect() {
    return await window.ipcRenderer.invoke(IPC_HOT_KEY_DETECT_END_CHANNEL)
  }

  // First Launch
  async isFirstLaunch(): Promise<boolean> {
    return await window.ipcRenderer.invoke(IPC_IS_FIRST_LAUNCH_CHANNEL)
  }

  async markAsLaunched(): Promise<void> {
    return await window.ipcRenderer.invoke(IPC_MARK_AS_LAUNCHED_CHANNEL)
  }

  // Audios
  async getAudios(): Promise<Audios[]> {
    return await window.ipcRenderer.invoke(IPC_GET_AUDIOS_CHANNEL)
  }

  async downloadAudio(filename: string): Promise<boolean> {
    return await window.ipcRenderer.invoke(IPC_DOWNLOAD_AUDIO_CHANNEL, filename)
  }

  async deleteAudio(filename: string): Promise<boolean> {
    return await window.ipcRenderer.invoke(IPC_DELETE_AUDIO_CHANNEL, filename)
  }

  async readAudioFile(filename: string): Promise<string> {
    return await window.ipcRenderer.invoke(IPC_READ_AUDIO_FILE_CHANNEL, filename)
  }

  async updateAudio(
    id: string,
    content: string,
    error: string | null = null,
  ): Promise<boolean> {
    return await window.ipcRenderer.invoke(IPC_UPDATE_AUDIO_CHANNEL, id, content, error)
  }

  async deleteAudiosByRetention(retention: string): Promise<number> {
    return await window.ipcRenderer.invoke(
      IPC_DELETE_AUDIOS_BY_RETENTION_CHANNEL,
      retention,
    )
  }

  // System
  async getSystemInfo(): Promise<SystemInfo> {
    return await window.ipcRenderer.invoke(IPC_GET_SYSTEM_INFO_CHANNEL)
  }

  async quitAndInstall(newVersion: string | undefined) {
    return await window.ipcRenderer.invoke(IPC_QUIT_AND_INSTALL_CHANNEL, newVersion)
  }

  // Error Log
  async readErrorLog(): Promise<Uint8Array> {
    return await window.ipcRenderer.invoke(IPC_READ_ERROR_LOG_CHANNEL)
  }

  // Permissions
  async checkAccessibility(): Promise<boolean> {
    return await window.ipcRenderer.invoke(IPC_CHECK_ACCESSIBILITY_CHANNEL)
  }

  async requestAccessibility(): Promise<boolean> {
    return await window.ipcRenderer.invoke(IPC_REQUEST_ACCESSIBILITY_CHANNEL)
  }

  async checkMicrophone(): Promise<string> {
    return await window.ipcRenderer.invoke(IPC_CHECK_MICROPHONE_CHANNEL)
  }

  async requestMicrophone(): Promise<boolean> {
    return await window.ipcRenderer.invoke(IPC_REQUEST_MICROPHONE_CHANNEL)
  }

  // Personas
  async getPersonas(): Promise<Persona[]> {
    return await window.ipcRenderer.invoke(IPC_GET_PERSONAS_CHANNEL)
  }

  async savePersonas(personas: Persona[]): Promise<boolean> {
    return await window.ipcRenderer.invoke(IPC_SAVE_PERSONAS_CHANNEL, personas)
  }

  async createPersonaInDb(persona: Persona): Promise<boolean> {
    return await window.ipcRenderer.invoke(IPC_CREATE_PERSONA_CHANNEL, persona)
  }

  async updatePersonaInDb(persona: Persona): Promise<boolean> {
    return await window.ipcRenderer.invoke(IPC_UPDATE_PERSONA_CHANNEL, persona)
  }

  async deletePersonaInDb(id: number): Promise<boolean> {
    return await window.ipcRenderer.invoke(IPC_DELETE_PERSONA_CHANNEL, id)
  }
}

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
export default new IPCService()
