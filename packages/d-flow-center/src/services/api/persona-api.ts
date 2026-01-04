import request from '@/lib/request'
import { Persona } from '../../../main/services/database-service'

export const getPersonaList = () => {
  return request.post<Persona[]>('/custom-prompt/list')
}

export const createPersona = (data: { name: string; icon: string; content: string }) => {
  return request.post<Persona>('/custom-prompt/create', { params: data })
}

export const updatePersona = (data: {
  prompt_id: number
  name?: string
  icon?: string
  content?: string
}) => {
  return request.post<Persona>('/custom-prompt/update', { params: data })
}

export const deletePersona = (prompt_id: number) => {
  return request.post<null>('/custom-prompt/delete', { params: { prompt_id } })
}
