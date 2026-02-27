import request from '@/lib/request'

export interface DictionaryEntry {
  id: number
  dictionary_id: number
  entry_type: string
  content: string
  token_count: number
  weight: number
  usage_count: number
  created_at: string
  updated_at: string
}

export interface DictionaryListResult {
  entries: DictionaryEntry[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export const getDictionaryEntries = (page = 1, page_size = 200) => {
  return request.get<DictionaryListResult>('/v1/asr-dictionary/entries', {
    params: { page, page_size },
  })
}

export const createDictionaryEntry = (content: string, weight = 10) => {
  return request.post<DictionaryEntry>('/v1/asr-dictionary/entries', {
    params: { content, entry_type: 'keyword', weight },
  })
}

export const updateDictionaryEntry = (id: number, content: string, weight = 10) => {
  return request.put<DictionaryEntry>(`/v1/asr-dictionary/entries/${id}`, {
    params: { content, entry_type: 'keyword', weight },
  })
}

export const deleteDictionaryEntry = (id: number) => {
  return request.delete<null>(`/v1/asr-dictionary/entries/${id}`)
}
