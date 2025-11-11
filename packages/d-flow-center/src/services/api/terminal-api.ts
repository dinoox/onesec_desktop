import request from '@/lib/request'
import { generateSignature } from '@/services/sign-service'
import type {
  TerminalBinding,
  TerminalBindingListResponse,
  BindTerminalParams,
  UpdateTerminalParams,
  DeleteTerminalParams,
  ListTerminalParams,
} from '@/types/terminal'

export const bindTerminal = async (params: BindTerminalParams) => {
  const signature = await generateSignature(params)
  return request.post<TerminalBinding>('/terminal/bind', {
    params: {
      ...params,
      ...signature,
    },
  })
}

export const listTerminals = async (params: ListTerminalParams = {}) => {
  const signature = await generateSignature(params)
  return request.post<TerminalBindingListResponse>('/terminal/list', {
    params: {
      ...params,
      ...signature,
    },
  })
}

export const updateTerminal = async (params: UpdateTerminalParams) => {
  const signature = await generateSignature(params)
  return request.post<TerminalBinding>('/terminal/update', {
    params: {
      ...params,
      ...signature,
    },
  })
}

export const deleteTerminal = async (params: DeleteTerminalParams) => {
  const signature = await generateSignature(params)
  return request.post<null>('/terminal/delete', {
    params: {
      ...params,
      ...signature,
    },
  })
}

