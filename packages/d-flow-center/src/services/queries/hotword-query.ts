import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getHotWordList,
  createHotWord,
  updateHotWord,
  deleteHotWord,
} from '@/services/api/hotword-api'
import { toast } from 'sonner'

// 获取热词列表
export const useHotWordListQuery = () => {
  return useQuery({
    queryKey: ['hotWordList'],
    queryFn: async () => {
      const resp = await getHotWordList()
      return resp.data || []
    },
  })
}

// 创建热词
export const useCreateHotWordQuery = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createHotWord,
    onSuccess: async (resp) => {
      toast.success(resp.message || '热词创建成功')
      // 刷新列表
      await queryClient.invalidateQueries({ queryKey: ['hotWordList'] })
    },
    onError: (error: any) => {
      toast.error(error?.message || '创建失败，请重试')
    },
  })
}

// 更新热词
export const useUpdateHotWordQuery = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ hotword_id, hotword }: { hotword_id: number; hotword: string }) =>
      updateHotWord(hotword_id, hotword),
    onSuccess: async (resp) => {
      toast.success(resp.message || '热词更新成功')
      // 刷新列表
      await queryClient.invalidateQueries({ queryKey: ['hotWordList'] })
    },
    onError: (error: any) => {
      toast.error(error?.message || '更新失败，请重试')
    },
  })
}

// 删除热词
export const useDeleteHotWordQuery = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteHotWord,
    onSuccess: async (resp) => {
      toast.success(resp.message || '热词删除成功')
      // 刷新列表
      await queryClient.invalidateQueries({ queryKey: ['hotWordList'] })
    },
    onError: (error: any) => {
      toast.error(error?.message || '删除失败，请重试')
    },
  })
}
