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
      if (resp.success) {
        toast.success('热词创建成功')
        await queryClient.invalidateQueries({ queryKey: ['hotWordList'] })
        return
      }

      toast.error(resp.message || '创建热词失败，请重试')
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
      if (resp.success) {
        toast.success(resp.message)
        await queryClient.invalidateQueries({ queryKey: ['hotWordList'] })
        return
      }
      toast.error(resp.message || '更新热词失败，请重试')
    },
  })
}

// 删除热词
export const useDeleteHotWordQuery = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteHotWord,
    onSuccess: async (resp) => {
      if (resp.success) {
        toast.success(resp.message)
        await queryClient.invalidateQueries({ queryKey: ['hotWordList'] })
        return
      }
      toast.error(resp.message || '删除热词失败，请重试')
    },
  })
}
