import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  bindTerminal,
  listTerminals,
  updateTerminal,
  deleteTerminal,
} from '@/services/api/terminal-api'
import { toast } from 'sonner'

export const useListTerminals = () => {
  return useQuery({
    queryKey: ['terminals'],
    queryFn: async () => {
      const res = await listTerminals()
      return res.data
    },
  })
}

export const useBindTerminal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: bindTerminal,
    onSuccess: (resp) => {
      if (resp.success) {
        queryClient.invalidateQueries({ queryKey: ['terminals'] })
        toast.success('添加成功')
        return
      }
      toast.error(resp.message || '添加失败')
    },
  })
}

export const useUpdateTerminal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateTerminal,
    onSuccess: (resp) => {
      if (resp.success) {
        queryClient.invalidateQueries({ queryKey: ['terminals'] })
        toast.success('更新成功')
        return
      }
      toast.error(resp.message || '更新失败')
    },
  })
}

export const useDeleteTerminal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteTerminal,
    onSuccess: (resp) => {
      if (resp.success) {
        queryClient.invalidateQueries({ queryKey: ['terminals'] })
        toast.success('删除成功')
        return
      }
      toast.error(resp.message || '删除失败')
    },
  })
}
