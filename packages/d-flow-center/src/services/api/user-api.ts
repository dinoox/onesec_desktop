import request from '@/lib/request'
import { generateSignature } from '@/services/sign-service.ts'
import type { User } from '@/types/user'

export const updateUserInfo = async (params: {
  user_name?: string
  preferred_linux_distro?: string | null
}) => {
  const signature = await generateSignature(params)
  return request.post<User>('/user/update', {
    params: {
      ...params,
      ...signature,
    },
  })
}

export const getUserInfo = async () => {
  const signature = await generateSignature({})
  return request.post<User>('/user/info', {
    params: {
      ...signature,
    },
  })
}

