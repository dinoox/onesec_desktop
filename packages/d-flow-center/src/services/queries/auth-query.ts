import { useMutation } from '@tanstack/react-query'
import { login, logout } from '@/services/api/auth-api.ts'
import authStore from '@/store/auth-store.ts'
import { useNavigate } from 'react-router'
import { UserConfigService } from '@/services/user-config-service.ts'
import IpcService from '@/services/ipc-service.ts'

export const useLoginQuery = () => {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: login,
    onSuccess: async (resp) => {
      authStore
        .getState()
        .actions.setAuthed(resp.data.user || {}, resp.data.access_token || 'token')

      const userConf = await UserConfigService.getConfig()
      await UserConfigService.setConfig({ ...userConf, auth_token: resp.data.access_token })
      await IpcService.showStatusWindow()
      navigate('/content')
    },
  })
}

export const useLogoutQuery = () =>
  useMutation({
    mutationFn: logout,
    onSuccess: async (_) => {
      await authStore.getState().actions.logout()

      const userConf = await UserConfigService.getConfig()
      await UserConfigService.setConfig({ ...userConf, auth_token: null })
      await IpcService.hideStatusWindow()
    },
  })
