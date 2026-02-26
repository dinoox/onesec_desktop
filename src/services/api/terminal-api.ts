import request from '@/lib/request'
import type {
  TerminalBinding,
  TerminalBindingListResponse,
  BindTerminalParams,
  UpdateTerminalParams,
  DeleteTerminalParams,
  ListTerminalParams,
} from '@/types/terminal'

export const bindTerminal = (params: BindTerminalParams) => {
  return request.post<TerminalBinding>('/terminal/bind', { params })
}

export const listTerminals = (params: ListTerminalParams = {}) => {
  return request.post<TerminalBindingListResponse>('/terminal/list', { params })
}

export const updateTerminal = (params: UpdateTerminalParams) => {
  return request.post<TerminalBinding>('/terminal/update', { params })
}

export const deleteTerminal = (params: DeleteTerminalParams) => {
  return request.post<null>('/terminal/delete', { params })
}
