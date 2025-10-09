import { create } from 'zustand'

export type Mode = 'command' | 'normal'
export type Status = 'idle' | 'speaking' | 'processing' | 'notification'

interface StatusStore {
  mode: Mode
  status: Status
  audioLevel: number
  actions: {
    setMode: (mode: Mode) => void
    setStatus: (status: Status) => void
    setAudioLevel: (level: number) => void
    reset: () => void
  }
}

const useStatusStore = create<StatusStore>((set) => ({
  mode: 'normal',
  status: 'idle',
  audioLevel: 0,
  actions: {
    setMode: (mode) => set({ mode }),
    setStatus: (status) => set({ status }),
    setAudioLevel: (level) => set({ audioLevel: level }),
    reset: () => set({ mode: 'normal', status: 'idle', audioLevel: 0 }),
  },
}))

export const useStatusActions = () => useStatusStore((state) => state.actions)

export default useStatusStore
