import request from '@/lib/request'

interface UploadData {
  id: number
  user_id: number
  created_at: number
}

export const uploadErrorLog = (logBuffer: Uint8Array) => {
  const blob = new Blob([logBuffer as BlobPart], { type: 'text/plain' })
  const formData = new FormData()
  formData.append('file', blob, 'main.log')
  return request.upload<UploadData>('/error-log/upload', formData)
}
