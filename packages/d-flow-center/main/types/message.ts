import * as net from 'net'

export const MessageTypes = {
  START_RECORDING: 'start_recording',
  STOP_RECORDING: 'stop_recording',
  VOLUME_DATA: 'volume_data',
  MODE_UPGRADE: 'mode_upgrade',
  SERVER_RESULT: 'server_result',
  HOTKEY_SETTING: 'hotkey_setting',
  HOTKEY_SETTING_UPDATE: 'hotkey_setting_update',
  HOTKEY_SETTING_RESULT: 'hotkey_setting_result',
  HOTKEY_SETTING_END: 'hotkey_setting_end',
  INIT_CONFIG: 'init_config',
  SCREEN_CHANGE: 'screen_change',
  CONNECTION_SUCCESS: 'connection_success',
  PERMISSION_STATUS: 'permission_status',
  AUTH_TOKEN_FAILED: 'auth_token_failed',
  RECORDING_TIMEOUT: 'recording_timeout',
} as const

export type MessageType = (typeof MessageTypes)[keyof typeof MessageTypes]

export interface UdsServiceOptions {
  socketPath?: string
}

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
  auth_token: string | null
  hotkey_configs: HotkeyConfig[]
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
// Status Window
const IPC_RESIZE_STATUS_WINDOW_CHANNEL = 'resize_status_window_channel'
const IPC_SHOW_STATUS_WINDOW_CHANNEL = 'show_status_window_channel'
const IPC_HIDE_STATUS_WINDOW_CHANNEL = 'hide_status_window_channel'
//Permission
const IPC_PERMISSION_GET_CHANNEL = 'permission_get_channel'
const IPC_PERMISSION_SET_CHANNEL = 'permission_set_channel'
//
const IPC_HOT_KEY_SETTING_START_CHANNEL = 'hot_key_setting_start_channel'
const IPC_HOT_KEY_SETTING_END_CHANNEL = 'hot_key_setting_end_channel'

export {
  DEFAULT_IPC_CHANNEL,
  IPC_USER_LOGIN_CHANNEL,
  IPC_USER_LOGOUT_CHANNEL,
  IPC_USER_CONFIG_GET_CHANNEL,
  IPC_USER_CONFIG_SET_CHANNEL,
  IPC_RESIZE_STATUS_WINDOW_CHANNEL,
  IPC_SHOW_STATUS_WINDOW_CHANNEL,
  IPC_HIDE_STATUS_WINDOW_CHANNEL,
  IPC_HOT_KEY_SETTING_START_CHANNEL,
  IPC_HOT_KEY_SETTING_END_CHANNEL,
  IPC_PERMISSION_SET_CHANNEL,
  IPC_PERMISSION_GET_CHANNEL,
}
