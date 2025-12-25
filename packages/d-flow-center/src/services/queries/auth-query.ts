import { useMutation } from '@tanstack/react-query'
import { login, logout, sendVerificationCode, register } from '@/services/api/auth-api.ts'
import authStore from '@/store/auth-store.ts'
import { toast } from 'sonner'
import useStatusStore from '@/store/status-store.ts'
import ipcService from '@/services/ipc-service.ts'

const handleAuthSuccess = async (resp: any) => {
  await authStore
    .getState()
    .actions.setAuthed(resp.data.user || {}, resp.data.token || '')
  useStatusStore.getState().actions.setAuthTokenInvalid(false)
}

export const useLoginQuery = () => {
  return useMutation({
    mutationFn: login,
    onSuccess: async (resp) => {
      if (resp.success) {
        await handleAuthSuccess(resp)
        toast.success(resp.message)
        return
      }

      toast.error(`${resp.message}`)
    },
  })
}

export const useRegisterQuery = () => {
  return useMutation({
    mutationFn: register,
    onSuccess: async (resp) => {
      if (resp.success) {
        await handleAuthSuccess(resp)
        toast.success(resp.message)
        return
      }

      toast.error(`${resp.message}`)
    },
  })
}

export const useVerificationCodeQuery = () => {
  return useMutation({
    mutationFn: (phone: string) => sendVerificationCode(phone),
    onSuccess: async (resp) => {
      if (resp.success) {
        toast.success('获取验证码成功')
        return
      }

      toast.error(resp.message || '获取验证码失败，请重试')
    },
  })
}

export const useLogoutQuery = () =>
  useMutation({
    mutationFn: logout,
    onSuccess: async (resp) => {
      authStore.getState().actions.logout().then()
      useStatusStore.getState().actions.setAuthTokenInvalid(true)
      if (resp.success) {
        toast.success('退出成功')
        return
      }
      toast.error(resp.message)
    },
  })
