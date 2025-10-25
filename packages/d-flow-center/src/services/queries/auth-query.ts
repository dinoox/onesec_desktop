import { useMutation } from '@tanstack/react-query'
import { login, logout, sendVerificationCode, register } from '@/services/api/auth-api.ts'
import authStore from '@/store/auth-store.ts'
import { toast } from 'sonner'
import useStatusStore from '@/store/status-store.ts'

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
      try {
        await handleAuthSuccess(resp)
        toast.success(resp.message)
      } catch (error) {
        toast.error(`${resp.message}`)
      }
    },
  })
}

export const useRegisterQuery = () => {
  return useMutation({
    mutationFn: register,
    onSuccess: async (resp) => {
      try {
        await handleAuthSuccess(resp)
        toast.success(resp.message)
      } catch (error) {
        toast.error('注册失败')
      }
    },
  })
}

export const useVerificationCodeQuery = () => {
  return useMutation({
    mutationFn: ({
      phone,
      invitation_code,
    }: {
      phone: string
      invitation_code?: string
    }) => sendVerificationCode(phone, invitation_code),
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
      await authStore.getState().actions.logout()
      useStatusStore.getState().actions.setAuthTokenInvalid(true)
      toast.success(resp.message)
    },
  })
