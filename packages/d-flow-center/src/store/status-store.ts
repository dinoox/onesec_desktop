import { create } from 'zustand'
import { IPCMessage } from '../../main/types/message.ts'

interface StatusStore {
  authTokenInvalid: boolean
  actions: {
    setAuthTokenInvalid: (value: boolean) => void
  }
}

const useStatusStore = create<StatusStore>((set) => ({
  authTokenInvalid: false,
  actions: {
    setAuthTokenInvalid: (authTokenInvalid) => set({ authTokenInvalid }),
  },
}))

export const useStatusActions = () => useStatusStore((state) => state.actions)

export default useStatusStore
