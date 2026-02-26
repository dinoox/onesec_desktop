import request from '@/lib/request'
import type { AccessToken, LoginResp } from '@/types/user'

export const login = (params: any) => {
  return request.post<LoginResp>('/auth/login', { params })
}

export const register = (params: any) => {
  return request.post<LoginResp>('/auth/register', { params })
}

export const sendVerificationCode = (phone: string) => {
  return request.post<{ success: boolean; message: string }>('/auth/send-code', {
    params: { phone },
  })
}

export const logout = () => {
  return request.post('/auth/logout')
}

export const refreshToken = (refreshToken: string) => {
  return request.post<AccessToken>('/auth/refreshToken', {
    params: { refreshToken },
  })
}
