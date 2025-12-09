import request from '@/lib/request'

export interface UserPoints {
  user_id: number
  points: number
}

export interface Transaction {
  id: number
  points: number
  reason: string
  related_user_id: number | null
  created_at: string
}

export interface TransactionsResponse {
  transactions: Transaction[]
  total_count: number
  limit: number
  offset: number
}

export interface RankingItem {
  rank: number
  phone: string
  points: number
}

export interface RankingResponse {
  ranking: RankingItem[]
  total_count: number
  limit: number
  offset: number
  current_user_rank: number
  current_user_points: number
}

export interface ExchangeResponse {
  user_id: number
  membership_type: string
  points_used: number
  membership_expires_at: string
  remaining_points: number
}

export const getUserPoints = () => {
  return request.post<UserPoints>('/points/user-points')
}

export const getTransactions = (params: { limit?: number; offset?: number }) => {
  return request.post<TransactionsResponse>('/points/transactions', { params })
}

export const getRanking = (params: { limit?: number; offset?: number }) => {
  return request.post<RankingResponse>('/points/ranking', { params })
}

export const exchangeMembership = (membershipType: string) => {
  return request.post<ExchangeResponse>('/points/exchange-membership', {
    params: { membership_type: membershipType },
  })
}
