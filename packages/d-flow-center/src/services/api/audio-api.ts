import request from '@/lib/request'

export interface AudioRecord {
  id: number
  recognized_text: string | null
  model_processed_text: string | null
  created_at: number
}

interface RecentRecordsResponse {
  records: AudioRecord[]
  count: number
}

export const getRecentRecords = () => {
  return request.post<RecentRecordsResponse>('/audio/recent-records')
}
