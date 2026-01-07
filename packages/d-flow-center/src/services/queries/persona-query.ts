import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getPersonaList,
  createPersona,
  updatePersona,
  deletePersona,
} from '@/services/api/persona-api'
import { toast } from 'sonner'
import ipcService from '@/services/ipc-service'
import { Persona } from '../../../main/services/database-service'
import { getIconSvg } from '@/utils/icon'

// Helper function to add icon_svg to persona
function addIconSvgToPersona(persona: Persona): Persona {
  return {
    ...persona,
    icon_svg: persona.icon ? getIconSvg(persona.icon) : null,
  }
}

export const usePersonaListQuery = () => {
  return useQuery({
    queryKey: ['personaList'],
    queryFn: async () => {
      const resp = await getPersonaList()
      console.log(resp)
      const personas = resp.data || []
      if (personas.length > 0) {
        // 为每个 persona 添加 icon_svg 后再存入数据库
        const personasWithSvg = personas.map(addIconSvgToPersona)
        ipcService.savePersonas(personasWithSvg).catch(console.error)
      }
      return personas
    },
  })
}

export const useCreatePersonaQuery = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPersona,
    onSuccess: async (resp) => {
      if (resp.success && resp.data) {
        toast.success(resp.message || '输出模式创建成功')
        const personaWithSvg = addIconSvgToPersona(resp.data)
        ipcService.createPersonaInDb(personaWithSvg).catch(console.error)
        await queryClient.invalidateQueries({ queryKey: ['personaList'] })
        return
      }
      toast.error(resp.message || '创建人设失败，请重试')
    },
  })
}

export const useUpdatePersonaQuery = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updatePersona,
    onSuccess: async (resp) => {
      if (resp.success && resp.data) {
        toast.success(resp.message || '输出模式更新成功')
        const personaWithSvg = addIconSvgToPersona(resp.data)
        ipcService.updatePersonaInDb(personaWithSvg).catch(console.error)
        await queryClient.invalidateQueries({ queryKey: ['personaList'] })
        return
      }
      toast.error(resp.message || '更新人设失败，请重试')
    },
  })
}

export const useDeletePersonaQuery = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deletePersona,
    onSuccess: async (resp, promptId) => {
      if (resp.success) {
        toast.success(resp.message || '输出模式删除成功')
        ipcService.deletePersonaInDb(promptId).catch(console.error)
        await queryClient.invalidateQueries({ queryKey: ['personaList'] })
        return
      }
      toast.error(resp.message || '删除人设失败，请重试')
    },
  })
}
