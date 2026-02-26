import { useMutation } from '@tanstack/react-query'
import { logout } from '@/services/api/auth-api.ts'
import authStore from '@/store/auth-store.ts'
import { toast } from 'sonner'
import useStatusStore from '@/store/status-store.ts'

export const useLogoutQuery = () =>
  useMutation({
    mutationFn: logout,
    onSuccess: async (resp) => {
      authStore.getState().actions.logout().then()
      useStatusStore.getState().actions.setAuthTokenInvalid(true)
      if (resp.code === 200) {
        toast.success('退出成功')
        return
      }
      toast.error(resp.message)
    },
  })
