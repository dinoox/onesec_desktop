import { useMutation } from '@tanstack/react-query'
import { login, logout, refreshToken } from '@/services/api/authApi'
import authStore from '@/store/authStore'
import { redirect } from 'react-router'

export const useLoginQuery = () =>
  useMutation({
    mutationFn: login,
    onSuccess: (resp) => {
      authStore
        .getState()
        .actions.setAuthed(resp.data.user || {}, resp.data.access_token || 'token')
      redirect('/')

      //resp.success
      // if (resp.success) {
      //   authStore
      //     .getState()
      //     .actions.setAuthed(
      //       resp.data.user,
      //       resp.data.token.access_token,
      //       resp.data.token.refresh_token,
      //     )
      //   redirect('/')
      // } else {
      //   toast.error(resp.message)
      // }
    },
  })

export const useLogoutQuery = () =>
  useMutation({
    mutationFn: logout,
  })

export const useRefreshTokenQuery = () =>
  useMutation({
    mutationFn: refreshToken,
  })
