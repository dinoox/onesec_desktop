import ipcService from '@/services/ipc-service'
import { Audios } from '../../../main/services/database-service'
import request from '@/lib/request'

export const getAudios = async (): Promise<Audios[]> => {
  return await ipcService.getAudios()
}

export const reconvertAudio = async (audioData: string) => {
  return await request.post(`/audio/recognize-file`, {
    params: {
      audioData: audioData,
    },
  })
}
