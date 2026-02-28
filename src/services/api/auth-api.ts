import request from '@/lib/request'
import type { LoginData, User } from '@/types/user'

export const logout = () => {
  return request.post('/auth/logout', { params: { all_devices: false } })
}

export const sendCode = (phone: string) => {
  return request.post('/auth/send-code', { params: { phone } })
}

export const phoneLogin = (phone: string, code: string) => {
  return request.post<LoginData & { user: User }>('/auth/login', {
    params: { phone, code },
  })
}
