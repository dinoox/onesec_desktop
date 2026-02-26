import request from '@/lib/request'

export interface UsageStatistics {
  total_characters: number
  total_sessions: number
  total_duration_minutes: number
  saved_time_minutes: number
  estimated_typing_speed: number
  average_speed: number
}

export interface OssUploadSignature {
  upload_url: string
  form_fields: Record<string, string>
  access_url: string
}

export const getUsageStatistics = () => {
  return request.post<UsageStatistics>('/usage/statistics')
}

export const getOssUploadSignature = (params: {
  directory: string
  content_type: string
  file_name: string
  file_size: number
}) => {
  return request.post<OssUploadSignature>('/oss/upload-signature', { params })
}

export const createFeedback = (params: {
  content: string
  app_version: string
  os: string
  image_urls?: string[]
  video_urls?: string[]
  audio_urls?: string[]
}) => {
  return request.post('/api/v1/users-feedbacks', { params })
}
