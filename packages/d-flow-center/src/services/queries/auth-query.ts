import { useMutation } from '@tanstack/react-query'
import { login, logout, sendVerificationCode } from '@/services/api/auth-api.ts'
import authStore from '@/store/auth-store.ts'
import { useNavigate } from 'react-router'
import { UserService } from '@/services/user-service.ts'
import useStatusStore from '@/store/status-store.ts'

export const useLoginQuery = () => {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: login,
    onSuccess: async (resp) => {
      authStore
        .getState()
        .actions.setAuthed(resp.data.user || {}, resp.data.access_token || 'token')

      useStatusStore.getState().actions.setAuthTokenInvalid(false)
      await UserService.setConfig({
        ...(await UserService.getConfig()),
        auth_token: resp.data.access_token,
      })
      await UserService.claimLogin()
    },
  })
}

export const useVerifyCodeQuery = () => {
  return useMutation({
    mutationFn: ({
      phone,
      invitation_code,
    }: {
      phone: string
      invitation_code?: string
    }) => sendVerificationCode(phone, invitation_code),
  })
}

export const useLogoutQuery = () =>
  useMutation({
    mutationFn: logout,
    onSuccess: async (_) => {
      await authStore.getState().actions.logout()
      useStatusStore.getState().actions.setAuthTokenInvalid(false)
      await UserService.setConfig({
        ...(await UserService.getConfig()),
        auth_token: null,
      })
      await UserService.claimLogout()
    },
  })
