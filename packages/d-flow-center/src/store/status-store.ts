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
  actions: {
    setAuthTokenInvalid: (value: boolean) => void
    setUpdateInfo: (info: UpdateInfo) => void
    setHotkeySettingStatus: (status: HotkeySettingStatus) => void
    setIPCMessage: (message: IPCMessage | null) => void
  }
}

const useStatusStore = create<StatusStore>((set) => ({
  authTokenInvalid: false,
  updateDownloaded: false,
  updateInfo: null,
  hotKeySettingStatus: 'idle',
  holdIPCMessage: null,
  actions: {
    setAuthTokenInvalid: (authTokenInvalid) => set({ authTokenInvalid }),
    setUpdateInfo: (updateInfo) => set({ updateDownloaded: true, updateInfo }),
    setHotkeySettingStatus: (hotKeySettingStatus) => set({ hotKeySettingStatus }),
    setIPCMessage: (holdIPCMessage) => {
      set({ holdIPCMessage })
    },
  },
}))

export const useStatusActions = () => useStatusStore((state) => state.actions)

export default useStatusStore
