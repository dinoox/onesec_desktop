export type User = {
  id: string
  email: string
  display_name: string
}

export type LoginData = {
  access_token: string
  refresh_token: string
  tokenExpirationTime: string
}
