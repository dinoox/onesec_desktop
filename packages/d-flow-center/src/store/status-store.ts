import { create } from 'zustand'
import { IPCMessage } from '../../main/types/message.ts'

export type Mode = 'command' | 'normal'
export type Status = 'idle' | 'speaking' | 'processing' | 'notification'
export type HotkeySettingStatus =
  | 'idle'
  | 'hotkey_setting'
  | 'hotkey_setting_update'
  | 'hotkey_setting_result'

interface StatusStore {
  mode: Mode
  status: Status
  hotKeySettingStatus: HotkeySettingStatus
  holdIPCMessage: IPCMessage
  audioLevel: number
  actions: {
    setMode: (mode: Mode) => void
    setStatus: (status: Status) => void
    setHotkeySettingStatus: (status: HotkeySettingStatus) => void
    setAudioLevel: (level: number) => void
    setIPCMessage: (message: IPCMessage) => void
    reset: () => void
  }
}

const useStatusStore = create<StatusStore>((set) => ({
  mode: 'normal',
  status: 'idle',
  hotKeySettingStatus: 'idle',
  holdIPCMessage: {
    id: 'id',
    type: 'event',
  },
  audioLevel: 0,
  actions: {
    setMode: (mode) => set({ mode }),
    setStatus: (status) => set({ status }),
    setHotkeySettingStatus: (hotKeySettingStatus) => set({ hotKeySettingStatus }),
    setAudioLevel: (audioLevel) => set({ audioLevel }),
    setIPCMessage: (message) => set({ holdIPCMessage: message }),
    reset: () => set({ mode: 'normal', status: 'idle', audioLevel: 0 }),
  },
}))

export const useStatusActions = () => useStatusStore((state) => state.actions)

export default useStatusStore
