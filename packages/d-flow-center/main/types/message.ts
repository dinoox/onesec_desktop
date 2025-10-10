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
  source?: 'worker' | 'main'
  action?: string
  data?: any
  error?: string | null
  timestamp?: number
}

export interface APIResponse {
  code: number
  message: string
  data?: any
}

export const DEFAULT_IPC_CHANNEL = 'default_ipc_channel'
export const IPC_USER_CONFIG_GET_CHANNEL = 'user_config_get_channel'
export const IPC_USER_CONFIG_SET_CHANNEL = 'user_config_set_channel'
export const IPC_RESIZE_STATUS_WINDOW_CHANNEL = 'resize_status_window_channel'
export const IPC_SHOW_STATUS_WINDOW_CHANNEL = 'show_status_window_channel'
export const IPC_HIDE_STATUS_WINDOW_CHANNEL = 'hide_status_window_channel'
//
export const IPC_HOT_KEY_SETTING_START_CHANNEL = 'hot_key_setting_start_channel'
export const IPC_HOT_KEY_SETTING_END_CHANNEL = 'hot_key_setting_end_channel'
