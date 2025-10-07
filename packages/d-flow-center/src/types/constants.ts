export const StorageKeys = {
  User: 'user',
  AccessToken: 'accessToken',
  RefreshToken: 'refreshToken',
  Authed: 'isAuthed',
  AuthStorage: '__auth_storage',
} as const

export const QueryKeys = {
  GetProfile: 'profile',
  Competitions: 'competitions',
  Inquiries: 'inquires',
  PreSigned: 'preSigned',
} as const

export const USER_AVATAR_URL = '/images/default-avatar.jpg'
