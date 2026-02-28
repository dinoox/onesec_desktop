import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  updateUserInfo,
  getUserInfo,
  getEntitlementStatus,
} from '@/services/api/user-api'
import useAuthStore from '@/store/auth-store'
import { toast } from 'sonner'

export const useGetUserInfo = () => {
  const updateUser = useAuthStore((state) => state.actions.updateUser)

  return useQuery({
    staleTime: 0,
    queryKey: ['user-info'],
    queryFn: async () => {
      const resp = await getUserInfo()
      if (resp.code === 200) {
        await updateUser(resp.result)
      }
      return resp
    },
  })
}

export const useEntitlementStatus = () => {
  return useQuery({
    queryKey: ['entitlement-status'],
    queryFn: async () => {
      const resp = await getEntitlementStatus()
      if (resp.code === 200) return resp.result?.data ?? null
      return null
    },
  })
}

export const useUpdateUserInfo = () => {
  const queryClient = useQueryClient()
  const updateUser = useAuthStore((state) => state.actions.updateUser)

  return useMutation({
    mutationFn: updateUserInfo,
    onSuccess: async (resp) => {
      if (resp.code === 200) {
        await updateUser(resp.result)
        queryClient.invalidateQueries({ queryKey: ['user'] })
        toast.success('更新成功')
        return
      }
      toast.error(resp?.message || '更新失败')
    },
  })
}
