import { create } from 'zustand'
import { IPCMessage } from '../../main/types/message.ts'

export type Mode = 'command' | 'normal'
export type Status = 'idle' | 'speaking' | 'processing' | 'notification'
export type HotkeySettingStatus =
  | 'idle'
  | 'hotkey_setting'
  | 'hotkey_setting_update'
  | 'hotkey_setting_result'

export type PermissionStatus = {
  microphone: boolean
  accessibility: boolean
}

interface StatusStore {
  mode: Mode
  status: Status
  hotKeySettingStatus: HotkeySettingStatus
  permissionStatus: PermissionStatus
  holdIPCMessage: IPCMessage
  audioLevel: number
  //
  authTokenInvalid: boolean
  actions: {
    setMode: (mode: Mode) => void
    setStatus: (status: Status) => void
    setPermissionStatus: (status: PermissionStatus) => void
    setHotkeySettingStatus: (status: HotkeySettingStatus) => void
    setAudioLevel: (level: number) => void
    setIPCMessage: (message: IPCMessage) => void
    setAuthTokenInvalid: (value: boolean) => void
    reset: () => void
  }
}

const useStatusStore = create<StatusStore>((set) => ({
  mode: 'normal',
  status: 'idle',
  permissionStatus: { microphone: true, accessibility: true },
  hotKeySettingStatus: 'idle',
  holdIPCMessage: {
    id: 'id',
    type: 'event',
  },
  audioLevel: 0,
  authTokenInvalid: false,
  actions: {
    setMode: (mode) => set({ mode }),
    setStatus: (status) => set({ status }),
    setPermissionStatus: (permissionStatus) => set({ permissionStatus }),
    setHotkeySettingStatus: (hotKeySettingStatus) => set({ hotKeySettingStatus }),
    setAudioLevel: (audioLevel) => set({ audioLevel }),
    setIPCMessage: (message) => set({ holdIPCMessage: message }),
    setAuthTokenInvalid: (authTokenInvalid) => set({ authTokenInvalid }),
    reset: () => set({ mode: 'normal', status: 'idle', audioLevel: 0 }),
  },
}))

export const useStatusActions = () => useStatusStore((state) => state.actions)

export default useStatusStore
