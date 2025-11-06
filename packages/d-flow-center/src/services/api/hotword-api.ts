import request from '@/lib/request'
import { generateSignature } from '@/services/sign-service.ts'

// 热词数据类型
export interface HotWord {
  id: number
  hotword: string
  user_id: number
  created_at: string
  updated_at: string
}

// 获取热词列表
export const getHotWordList = async () => {
  const params = {}
  const signature = await generateSignature(params)
  return request.post<HotWord[]>('/hotword/list', {
    params: {
      ...params,
      ...signature,
    },
  })
}

// 创建热词
export const createHotWord = async (hotword: string) => {
  const params = { hotword }
  const signature = await generateSignature(params)
  return request.post<HotWord>('/hotword/create', {
    params: {
      ...params,
      ...signature,
    },
  })
}

// 更新热词
export const updateHotWord = async (hotword_id: number, hotword: string) => {
  const params = { hotword_id, hotword }
  const signature = await generateSignature(params)
  return request.post<HotWord>('/hotword/update', {
    params: {
      ...params,
      ...signature,
    },
  })
}

// 删除热词
export const deleteHotWord = async (hotword_id: number) => {
  const params = { hotword_id }
  const signature = await generateSignature(params)
  return request.post<null>('/hotword/delete', {
    params: {
      ...params,
      ...signature,
    },
  })
}
