import { useMutation } from '@tanstack/react-query'
import { login, logout } from '@/services/api/authApi'
import authStore from '@/store/authStore'
import { useNavigate } from 'react-router'
import { UserConfigService } from '@/services/userConfigService.ts'
import IpcService from "@/services/ipcService.ts";

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
