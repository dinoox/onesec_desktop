import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { updateUserInfo, getUserInfo } from '@/services/api/user-api'
import useAuthStore from '@/store/auth-store'
import { toast } from 'sonner'

export const useGetUserInfo = () => {
  const updateUser = useAuthStore((state) => state.actions.updateUser)

  return useQuery({
    queryKey: ['user-info'],
    queryFn: async () => {
      const resp = await getUserInfo()
      if (resp.success) {
        await updateUser(resp.data)
      }
      return resp
    },
    staleTime: 0,
    gcTime: 0,
  })
}

export const useUpdateUserInfo = () => {
  const queryClient = useQueryClient()
  const updateUser = useAuthStore((state) => state.actions.updateUser)

  return useMutation({
    mutationFn: updateUserInfo,
    onSuccess: async (resp) => {
      if (resp.success) {
        await updateUser(resp.data)
        queryClient.invalidateQueries({ queryKey: ['user'] })
        toast.success('更新成功')
        return
      }
      toast.error(resp?.message || '更新失败')
    },
  })
}
