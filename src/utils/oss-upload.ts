import { getOssUploadSignature } from '@/services/api/dashboard-api'

export type AttachmentKind = 'image' | 'video' | 'audio'

export interface AttachmentItem {
  id: string
  file: File
  kind: AttachmentKind
}

export function getAttachmentKind(file: File): AttachmentKind | null {
  const mime = file.type.toLowerCase()
  if (mime.startsWith('image/')) return 'image'
  if (mime.startsWith('video/')) return 'video'
  if (mime.startsWith('audio/')) return 'audio'
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) return 'image'
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) return 'video'
  if (['mp3', 'wav', 'm4a', 'aac', 'flac', 'ogg'].includes(ext)) return 'audio'
  return null
}

export async function uploadToOss(directory: string, file: File): Promise<string> {
  const ext = file.name.includes('.') ? `.${file.name.split('.').pop()}` : ''
  const file_name = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}${ext}`

  const resp = await getOssUploadSignature({
    directory,
    content_type: file.type || 'application/octet-stream',
    file_name,
    file_size: file.size,
  })

  console.log(resp)

  if (resp.code !== 200 || !resp.result) throw new Error('获取上传签名失败')

  const { upload_url, form_fields, access_url } = resp.result
  const formData = new FormData()
  Object.entries(form_fields).forEach(([k, v]) => formData.append(k, v))
  formData.append('file', file)

  const res = await fetch(upload_url, { method: 'POST', body: formData })
  if (!res.ok && res.status !== 204) throw new Error(`OSS 上传失败: ${res.status}`)

  return access_url.split('?')[0]
}
