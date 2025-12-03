import request from '@/lib/request'
import type { User } from '@/types/user'

export const updateUserInfo = (params: {
  user_name?: string
  preferred_linux_distro?: string | null
}) => {
  return request.post<User>('/user/update', { params })
}

export const getUserInfo = () => {
  return request.post<User>('/user/info')
}
