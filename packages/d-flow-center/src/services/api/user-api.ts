import request from '@/lib/request'
import type { User } from '@/types/user'
import type { SystemInfo } from 'electron/system'

export const updateUserInfo = (params: {
  user_name?: string
  preferred_linux_distro?: string | null
}) => {
  return request.post<User>('/user/update', { params })
}

export const getUserInfo = () => {
  return request.post<User>('/user/info')
}

export const updateDeviceInfo = (systemInfo: SystemInfo) => {
  return request.post('/user/device', { params: systemInfo })
}
