import request from '@/lib/request'

export interface HotWord {
  id: number
  hotword: string
  user_id: number
  created_at: string
  updated_at: string
}

export const getHotWordList = () => {
  return request.post<HotWord[]>('/hotword/list')
}

export const createHotWord = (hotword: string) => {
  return request.post<HotWord>('/hotword/create', { params: { hotword } })
}

export const updateHotWord = (hotword_id: number, hotword: string) => {
  return request.post<HotWord>('/hotword/update', { params: { hotword_id, hotword } })
}

export const deleteHotWord = (hotword_id: number) => {
  return request.post<null>('/hotword/delete', { params: { hotword_id } })
}
