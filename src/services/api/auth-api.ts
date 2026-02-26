import request from '@/lib/request'

export const logout = () => {
  return request.post('/auth/logout')
}
