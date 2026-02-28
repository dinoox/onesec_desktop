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

export const getEntitlementStatus = () => {
  return request.get<EntitlementStatus>('/v1/stripe/entitlement-status', {
    params: { entitlement_type: 'pro' },
  })
}

export interface EntitlementSnapshot {
  trial_days_used: number
  total_trial_duration_days: number
  subscription_source: 'trial' | 'subscription' | 'free'
  entitlement_type: 'pro' | 'free'
  expire_at: number
  product_name: string
}

export interface EntitlementData {
  snapshots: EntitlementSnapshot[]
  subscriptions: any[]
  message?: string
}

export interface EntitlementStatus {
  data: EntitlementData
}
