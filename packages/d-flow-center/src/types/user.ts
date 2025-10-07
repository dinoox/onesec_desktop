// export type AccessToken = {
//   access_token: string
//   refresh_token: string
//   type: string
//   expiresIn: number
// }

export type LoginReq = {
  credential: string
  password: string
}

export type User = {
  user_id: number
  user_name: string
  phone: string
  is_active: string
}

export type LoginResp = {
  user: User
  access_token: string
}
