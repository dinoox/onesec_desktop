import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getTransactions,
  getRanking,
  exchangeMembership,
} from '@/services/api/points-api'
import { toast } from 'sonner'

export const useGetTransactions = (limit = 20, offset = 0) => {
  return useQuery({
    queryKey: ['transactions', limit, offset],
    staleTime: 0,
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
    staleTime: 0,
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
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['user-info'] }),
          queryClient.invalidateQueries({ queryKey: ['transactions'] }),
        ])
        return
      }
      toast.error(resp.message)
    },
  })
}
