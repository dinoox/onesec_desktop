export type AccessToken = {
  access_token: string
  refresh_token: string
  type: string
  expiresIn: number
}

export type User = {
  user_id: number
  user_name: string
  phone: string
  is_active: string
  preferred_linux_distro?: string | null
  share_code: string
  points: number
  membership_type: string
  membership_expires_at: string | null
}

export type LoginResp = {
  user: User
  access_token: string
}
