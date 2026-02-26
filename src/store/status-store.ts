import { create } from 'zustand'
import { IPCMessage } from '../../main/types/message.ts'

interface UpdateInfo {
  version: string
  releaseDate: string
}

type HotkeySettingStatus =
  | 'idle'
  | 'hotkey_setting'
  | 'hotkey_setting_update'
  | 'hotkey_setting_result'

interface StatusStore {
  authTokenInvalid: boolean
  updateChecking: boolean
  updateProgress: number | null
  updateDownloaded: boolean
  updateInfo: UpdateInfo | null
  hotKeySettingStatus: HotkeySettingStatus
  holdIPCMessage: IPCMessage | null
  reconvertingId: string | null
  hotkeyDetectKeys: string[]
  hotkeyDetectCompleted: boolean
  actions: {
    setAuthTokenInvalid: (value: boolean) => void
    setUpdateChecking: (value: boolean) => void
    setUpdateProgress: (progress: number | null) => void
    setUpdateInfo: (updateDownloaded: boolean, updateInfo: UpdateInfo | null) => void
    setHotkeySettingStatus: (status: HotkeySettingStatus) => void
    setIPCMessage: (message: IPCMessage | null) => void
    setReconvertingId: (id: string | null) => void
    setHotkeyDetectKeys: (keys: string[], completed?: boolean) => void
  }
}

const useStatusStore = create<StatusStore>((set) => ({
  authTokenInvalid: false,
  updateChecking: false,
  updateProgress: null,
  updateDownloaded: false,
  updateInfo: null,
  hotKeySettingStatus: 'idle',
  holdIPCMessage: null,
  reconvertingId: null,
  hotkeyDetectKeys: [],
  hotkeyDetectCompleted: false,
  actions: {
    setAuthTokenInvalid: (authTokenInvalid) => set({ authTokenInvalid }),
    setUpdateChecking: (updateChecking) => set({ updateChecking }),
    setUpdateProgress: (updateProgress) => set({ updateProgress }),
    setUpdateInfo: (updateDownloaded, updateInfo) =>
      set({ updateDownloaded, updateInfo }),
    setHotkeySettingStatus: (hotKeySettingStatus) => set({ hotKeySettingStatus }),
    setIPCMessage: (holdIPCMessage) => {
      set({ holdIPCMessage })
    },
    setReconvertingId: (reconvertingId) => set({ reconvertingId }),
    setHotkeyDetectKeys: (hotkeyDetectKeys, completed = false) =>
      set({ hotkeyDetectKeys, hotkeyDetectCompleted: completed }),
  },
}))

export const useStatusActions = () => useStatusStore((state) => state.actions)

export default useStatusStore
