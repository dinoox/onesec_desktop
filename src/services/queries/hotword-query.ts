import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getDictionaryEntries,
  createDictionaryEntry,
  updateDictionaryEntry,
  deleteDictionaryEntry,
} from '@/services/api/hotword-api'
import { toast } from 'sonner'

export const useHotWordListQuery = () => {
  return useQuery({
    queryKey: ['hotWordList'],
    queryFn: async () => {
      const resp = await getDictionaryEntries()
      return resp.result?.entries || []
    },
  })
}

export const useCreateHotWordQuery = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (content: string) => createDictionaryEntry(content),
    onSuccess: async (resp) => {
      if (resp.code === 200) {
        toast.success('条目创建成功')
        await queryClient.invalidateQueries({ queryKey: ['hotWordList'] })
        return
      }
      toast.error(resp.message || '创建条目失败，请重试')
    },
  })
}

export const useUpdateHotWordQuery = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, content }: { id: number; content: string }) =>
      updateDictionaryEntry(id, content),
    onSuccess: async (resp) => {
      if (resp.code === 200) {
        toast.success(resp.message || '条目更新成功')
        await queryClient.invalidateQueries({ queryKey: ['hotWordList'] })
        return
      }
      toast.error(resp.message || '更新条目失败，请重试')
    },
  })
}

export const useDeleteHotWordQuery = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteDictionaryEntry(id),
    onSuccess: async (resp) => {
      if (resp.code === 200) {
        toast.success(resp.message || '条目删除成功')
        await queryClient.invalidateQueries({ queryKey: ['hotWordList'] })
        return
      }
      toast.error(resp.message || '删除条目失败，请重试')
    },
  })
}
