import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getUsageStatistics,
  getFeedbackList,
  createFeedback,
  deleteFeedback,
} from '@/services/api/dashboard-api'
import { toast } from 'sonner'

export const useUsageStatistics = () => {
  return useQuery({
    queryKey: ['usage-statistics'],
    refetchInterval: 10000,
    queryFn: async () => {
      const resp = await getUsageStatistics()
      return resp.success ? resp.data : null
    },
  })
}

export const useFeedbackList = () => {
  return useQuery({
    queryKey: ['feedback-list'],
    staleTime: 0,
    refetchInterval: 10000,
    queryFn: async () => {
      const resp = await getFeedbackList({ limit: 50 })
      return resp.success ? resp.data : null
    },
  })
}

export const useCreateFeedback = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createFeedback,
    onSuccess: (resp) => {
      if (resp.success) {
        queryClient.invalidateQueries({ queryKey: ['feedback-list'] })
        toast.success('反馈提交成功')
      } else {
        toast.error(resp.message || '提交失败')
      }
    },
  })
}

export const useDeleteFeedback = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteFeedback,
    onSuccess: (resp) => {
      if (resp.success) {
        queryClient.invalidateQueries({ queryKey: ['feedback-list'] })
        toast.success('删除成功')
      } else {
        toast.error(resp.message || '删除失败')
      }
    },
  })
}
