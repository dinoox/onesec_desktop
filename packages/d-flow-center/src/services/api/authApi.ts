import request from '@/lib/request'
import type { AccessToken, LoginResp } from '@/types/user'

export const login = (params: any) => {
  return request.post<LoginResp>('/auth/login', {
    params,
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
