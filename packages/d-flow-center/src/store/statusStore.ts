import { create } from 'zustand'

export type Mode = 'command' | 'normal'
export type Status =
  | 'idle'
  | 'speaking'
  | 'command'
  | 'processing'
  | 'command-processing'
  | 'notification'

interface StatusStore {
  status: Status
  audioLevel: number
  actions: {
    setStatus: (status: Status) => void
    setAudioLevel: (level: number) => void
    reset: () => void
  }
}

const useStatusStore = create<StatusStore>((set) => ({
  status: 'idle',
  audioLevel: 0,
  actions: {
    setStatus: (status) => set({ status }),
    setAudioLevel: (level) => set({ audioLevel: level }),
    reset: () => set({ status: 'idle', audioLevel: 0 }),
  },
}))

export const useStatusActions = () => useStatusStore((state) => state.actions)

export default useStatusStore
