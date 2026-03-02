import ipcService from '@/services/ipc-service'
import { Audios } from '../../../main/services/database-service'
import request from '@/lib/request'
import authStore from '@/store/auth-store'

export const getAudios = async (): Promise<Audios[]> => {
  return await ipcService.getAudios()
}

function base64ToBlob(base64: string, mimeType = 'audio/wav'): Blob {
  const byteChars = atob(base64)
  const bytes = new Uint8Array(byteChars.length)
  for (let i = 0; i < byteChars.length; i++) {
    bytes[i] = byteChars.charCodeAt(i)
  }
  return new Blob([bytes], { type: mimeType })
}

async function uploadToOss(signResult: any, blob: Blob): Promise<string> {
  const data = signResult.result || signResult
  if (!data.upload_url || !data.form_fields) {
    throw new Error('Invalid upload signature data')
  }

  const formData = new FormData()
  for (const [key, value] of Object.entries(data.form_fields)) {
    formData.append(key, value as string)
  }
  formData.append('file', blob)

  const res = await window.fetch(data.upload_url, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok && res.status !== 204) {
    throw new Error(`OSS upload failed: ${res.status}`)
  }

  return data.access_url
}

export const reconvertAudio = async (audioData: string, filename: string) => {
  const userId = authStore.getState().user?.id || ''
  const blob = base64ToBlob(audioData)

  const signRes = await request.post('/oss/upload-signature', {
    params: {
      directory: `transcribe/${userId}`,
      content_type: 'audio/wav',
      file_name: filename,
      file_size: blob.size,
    },
  })

  if (signRes.code !== 200) {
    return signRes
  }

  console.log('[reconvert] signRes:', JSON.stringify(signRes))
  const accessUrl = await uploadToOss(signRes, blob)
  console.log('[reconvert] accessUrl:', accessUrl)

  return await request.post('/v2/audio-agent', {
    params: { audio_url: accessUrl },
  })
}
