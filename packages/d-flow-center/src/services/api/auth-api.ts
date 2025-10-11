import request from '@/lib/request'
import type { AccessToken, LoginResp } from '@/types/user'
import { generateSignature } from '@/services/sign-service.ts'

export const login = (params: any) => {
  return request.post<LoginResp>('/auth/login', {
    params,
  })
}

export const sendVerificationCode = async (phone: string, invitation_code?: string) => {
  const params = invitation_code ? { phone, invitation_code } : { phone }
  const signature = await generateSignature(params)

  return request.post<{
    success: boolean
    message: string
  }>('/auth/send-code', {
    params: {
      ...params,
      ...signature,
    },
  })
}

export const logout = () => {
  return request.post('/user/logout')
}

export const refreshToken = async (refreshToken: string) => {
  return request.post<AccessToken>('/auth/refreshToken', {
    params: { refreshToken },
  })
}
