import * as net from 'net'
import { User } from '@/types/user.ts'

export const MessageTypes = {
  HOTKEY_SETTING_RESULT: 'hotkey_setting_result',
  UPDATE_CONFIG: 'config_updated',
  CONNECTED: 'connected',
  AUTH_TOKEN_FAILED: 'auth_token_failed',
} as const

export type MessageType = (typeof MessageTypes)[keyof typeof MessageTypes]

export interface ClientInfo {
  id: string
  socket: net.Socket
  connectedAt: Date
  lastActivity: Date
}

export interface Message {
  type: MessageType
  timestamp: number
  data?: Record<string, any>
}

export interface ServerResultOptions {
  confidence?: number
  status?: string
  errorMessage?: string | null
}
//

export type HotkeyMode = 'normal' | 'command'

export interface HotkeyConfig {
  mode: HotkeyMode
  hotkey_combination: string[]
}

export interface GlobalConfig {
  auth_token: string
  hotkey_configs: HotkeyConfig[]
  user: User | null
}

export interface IPCMessage {
  id: string
  type: 'request' | 'response' | 'event' | 'ready'
  action?: string
  data?: Message
  error?: string | null
  timestamp?: number
}

export function buildIPCMessage(
  action: string,
  data?: Message,
  type: 'request' | 'response' | 'event' | 'ready' = 'event',
): IPCMessage {
  return {
    id: `event_${Date.now()}`,
    type,
    action,
    data,
    error: null,
    timestamp: Date.now(),
  }
}

const DEFAULT_IPC_CHANNEL = 'default_ipc_channel'
// User
const IPC_USER_LOGIN_CHANNEL = 'user_login_channel'
const IPC_USER_LOGOUT_CHANNEL = 'user_logout_channel'
const IPC_USER_CONFIG_GET_CHANNEL = 'user_config_get_channel'
const IPC_USER_CONFIG_SET_CHANNEL = 'user_config_set_channel'
// External URL
const IPC_OPEN_EXTERNAL_URL_CHANNEL = 'open_external_url_channel'

export {
  DEFAULT_IPC_CHANNEL,
  IPC_USER_LOGIN_CHANNEL,
  IPC_USER_LOGOUT_CHANNEL,
  IPC_USER_CONFIG_GET_CHANNEL,
  IPC_USER_CONFIG_SET_CHANNEL,
  IPC_OPEN_EXTERNAL_URL_CHANNEL,
}
