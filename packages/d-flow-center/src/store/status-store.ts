import { create } from 'zustand'
import { IPCMessage } from '../../main/types/message.ts'

interface UpdateInfo {
  version: string
  releaseDate: string
}

interface StatusStore {
  authTokenInvalid: boolean
  updateDownloaded: boolean
  updateInfo: UpdateInfo | null
  actions: {
    setAuthTokenInvalid: (value: boolean) => void
    setUpdateInfo: (info: UpdateInfo) => void
  }
}

const useStatusStore = create<StatusStore>((set) => ({
  authTokenInvalid: false,
  updateDownloaded: false,
  updateInfo: null,
  actions: {
    setAuthTokenInvalid: (authTokenInvalid) => set({ authTokenInvalid }),
    setUpdateInfo: (updateInfo) => set({ updateDownloaded: true, updateInfo }),
  },
}))

export const useStatusActions = () => useStatusStore((state) => state.actions)

export default useStatusStore
