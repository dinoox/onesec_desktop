import request from '@/lib/request'

export interface UsageStatistics {
  total_characters: number
  total_sessions: number
  total_duration_minutes: number
  saved_time_minutes: number
  estimated_typing_speed: number
  average_speed: number
}

export interface FeedbackItem {
  id: number
  content: string
  admin_reply: string | null
  created_at: number
  replied_at: number | null
}

export interface FeedbackListResponse {
  items: FeedbackItem[]
  total_count: number
  limit: number
  offset: number
}

export const getUsageStatistics = () => {
  return request.post<UsageStatistics>('/usage/statistics')
}

export const getFeedbackList = (params?: { limit?: number; offset?: number }) => {
  return request.post<FeedbackListResponse>('/feedback/list', { params })
}

export const createFeedback = (content: string) => {
  return request.post<FeedbackItem>('/feedback/create', { params: { content } })
}

export const deleteFeedback = (feedback_id: number) => {
  return request.post('/feedback/delete', { params: { feedback_id } })
}
