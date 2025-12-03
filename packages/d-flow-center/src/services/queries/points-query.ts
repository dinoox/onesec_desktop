import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getUserPoints,
  getTransactions,
  getRanking,
  exchangeMembership,
} from '@/services/api/points-api'
import { toast } from 'sonner'

export const useGetUserPoints = () => {
  return useQuery({
    queryKey: ['userPoints'],
    queryFn: async () => {
      const resp = await getUserPoints()
      if (!resp.success) throw new Error(resp.message)
      return resp.data
    },
  })
}

export const useGetTransactions = (limit = 20, offset = 0) => {
  return useQuery({
    queryKey: ['transactions', limit, offset],
    queryFn: async () => {
      const resp = await getTransactions({ limit, offset })
      if (!resp.success) throw new Error(resp.message)
      return resp.data
    },
  })
}

export const useGetRanking = (limit = 10, offset = 0) => {
  return useQuery({
    queryKey: ['ranking', limit, offset],
    queryFn: async () => {
      const resp = await getRanking({ limit, offset })
      if (!resp.success) throw new Error(resp.message)
      return resp.data
    },
  })
}

export const useExchangeMembership = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (membershipType: string) => exchangeMembership(membershipType),
    onSuccess: async (resp) => {
      if (resp.success) {
        toast.success('兑换成功')
        await queryClient.invalidateQueries({ queryKey: ['userPoints'] })
        return
      }
      toast.error(resp.message)
    },
  })
}
