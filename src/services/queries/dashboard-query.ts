import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getUsageStatistics,
  getFeedbackList,
  createFeedback,
  deleteFeedback,
} from '@/services/api/dashboard-api'
import { toast } from 'sonner'

const STATS_CACHE_KEY = 'usage-statistics-cache'

// 从 localStorage 读取缓存的统计数据
const getCachedStats = () => {
  try {
    const cached = localStorage.getItem(STATS_CACHE_KEY)
    return cached ? JSON.parse(cached) : null
  } catch {
    return null
  }
}

// 保存统计数据到 localStorage
const setCachedStats = (data: any) => {
  try {
    localStorage.setItem(STATS_CACHE_KEY, JSON.stringify(data))
  } catch {
    // 忽略存储错误
  }
}

export const useUsageStatistics = () => {
  return useQuery({
    queryKey: ['usage-statistics'],
    staleTime: 0,
    placeholderData: getCachedStats(), // 使用缓存数据作为占位
    queryFn: async () => {
      const resp = await getUsageStatistics()
      if (resp.success && resp.data) {
        setCachedStats(resp.data) // 成功后更新缓存
        return resp.data
      }
      return null
    },
  })
}

export const useFeedbackList = () => {
  return useQuery({
    queryKey: ['feedback-list'],
    staleTime: 0,
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
