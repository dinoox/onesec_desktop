import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateUserInfo } from '@/services/api/user-api'
import useAuthStore from '@/store/auth-store'
import { toast } from 'sonner'

export const useUpdateUserInfo = () => {
  const queryClient = useQueryClient()
  const updateUser = useAuthStore((state) => state.actions.updateUser)

  return useMutation({
    mutationFn: updateUserInfo,
    onSuccess: async (data) => {
      await updateUser(data.data)
      queryClient.invalidateQueries({ queryKey: ['user'] })
      toast.success('更新成功')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || '更新失败')
    },
  })
}

