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
  updateDownloaded: boolean
  updateInfo: UpdateInfo | null
  hotKeySettingStatus: HotkeySettingStatus
  holdIPCMessage: IPCMessage | null
  reconvertingId: string | null
  actions: {
    setAuthTokenInvalid: (value: boolean) => void
    setUpdateInfo: (updateDownloaded: boolean, updateInfo: UpdateInfo | null) => void
    setHotkeySettingStatus: (status: HotkeySettingStatus) => void
    setIPCMessage: (message: IPCMessage | null) => void
    setReconvertingId: (id: string | null) => void
  }
}

const useStatusStore = create<StatusStore>((set) => ({
  authTokenInvalid: false,
  updateDownloaded: false,
  updateInfo: null,
  hotKeySettingStatus: 'idle',
  holdIPCMessage: null,
  reconvertingId: null,
  actions: {
    setAuthTokenInvalid: (authTokenInvalid) => set({ authTokenInvalid }),
    setUpdateInfo: (updateDownloaded, updateInfo) =>
      set({ updateDownloaded, updateInfo }),
    setHotkeySettingStatus: (hotKeySettingStatus) => set({ hotKeySettingStatus }),
    setIPCMessage: (holdIPCMessage) => {
      set({ holdIPCMessage })
    },
    setReconvertingId: (reconvertingId) => set({ reconvertingId }),
  },
}))

export const useStatusActions = () => useStatusStore((state) => state.actions)

export default useStatusStore
