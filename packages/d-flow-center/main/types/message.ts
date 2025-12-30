import * as net from 'net'
import { User } from '@/types/user.ts'

export const MessageTypes = {
  CONFIG_UPDATED: 'config_updated',
  CONNECTED: 'connected',
  AUTH_TOKEN_FAILED: 'auth_token_failed',
  // App Update
  APP_UPDATE_CHECKING: 'app_update_checking',
  APP_UPDATE_AVAILABLE: 'app_update_available',
  APP_UPDATE_NOT_AVAILABLE: 'app_update_not_available',
  APP_UPDATE_ERROR: 'app_update_error',
  APP_UPDATE_PROGRESS: 'app_update_progress',
  APP_UPDATE_DOWNLOADED: 'app_update_downloaded',
  // Hot Key Setting
  HOTKEY_SETTING_START: 'hotkey_setting_start',
  HOTKEY_SETTING_UPDATE: 'hotkey_setting_update',
  HOTKEY_SETTING_RESULT: 'hotkey_setting_result',
  HOTKEY_SETTING_END: 'hotkey_setting_end',
  // Hot Key Detect
  HOTKEY_DETECT_STARTED: 'hotkey_detect_start',
  HOTKEY_DETECT_ENDED: 'hotkey_detect_end',
  HOTKEY_DETECT_UPDATED: 'hotkey_detect_update',
  //
  USER_AUDIO_SAVED: 'user_audio_saved',
  RECORDING_INTERRUPTED: 'recording_interrupted',
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
  timestamp?: number
  data?: Record<string, any>
}

export interface ServerResultOptions {
  confidence?: number
  status?: string
  errorMessage?: string | null
}
//

export type HotkeyMode = 'normal' | 'command' | 'free'

export interface HotkeyConfig {
  mode: HotkeyMode
  hotkey_combination: string[]
}

export interface IPCMessage {
  id: string
  action?: string
  data?: Message
  error?: string | null
  timestamp?: number
}

export function buildIPCMessage(action: string, data?: Message): IPCMessage {
  return {
    id: `event_${Date.now()}`,
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
const IPC_AUTH_TOKEN_FAILED_CHANNEL = 'auth_token_failed_channel'
const IPC_USER_CONFIG_GET_CHANNEL = 'user_config_get_channel'
const IPC_USER_CONFIG_SET_PARTIAL_CHANNEL = 'user_config_set_partial_channel'
// External URL
const IPC_OPEN_EXTERNAL_URL_CHANNEL = 'open_external_url_channel'
// Update
const IPC_QUIT_AND_INSTALL_CHANNEL = 'quit_and_install_channel'
//
const IPC_HOT_KEY_SETTING_START_CHANNEL = 'hot_key_setting_start_channel'
const IPC_HOT_KEY_SETTING_RESULT_CHANNEL = 'hot_key_setting_result_channel'
const IPC_HOT_KEY_SETTING_END_CHANNEL = 'hot_key_setting_end_channel'
// Hot Key Detect
const IPC_HOT_KEY_DETECT_START_CHANNEL = 'hot_key_detect_start_channel'
const IPC_HOT_KEY_DETECT_END_CHANNEL = 'hot_key_detect_end_channel'
// First Launch
const IPC_IS_FIRST_LAUNCH_CHANNEL = 'is_first_launch_channel'
const IPC_MARK_AS_LAUNCHED_CHANNEL = 'mark_as_launched_channel'
// Audios
const IPC_GET_AUDIOS_CHANNEL = 'get_audios_channel'
const IPC_DOWNLOAD_AUDIO_CHANNEL = 'download_audio_channel'
const IPC_DELETE_AUDIO_CHANNEL = 'delete_audio_channel'
const IPC_READ_AUDIO_FILE_CHANNEL = 'read_audio_file_channel'
const IPC_UPDATE_AUDIO_CHANNEL = 'update_audio_channel'
const IPC_DELETE_AUDIOS_BY_RETENTION_CHANNEL = 'delete_audios_by_retention_channel'
// System
const IPC_GET_SYSTEM_INFO_CHANNEL = 'get_system_info_channel'
// Error Log
const IPC_READ_ERROR_LOG_CHANNEL = 'read_error_log_channel'
// Permissions
const IPC_CHECK_ACCESSIBILITY_CHANNEL = 'check_accessibility_channel'
const IPC_REQUEST_ACCESSIBILITY_CHANNEL = 'request_accessibility_channel'
const IPC_CHECK_MICROPHONE_CHANNEL = 'check_microphone_channel'
const IPC_REQUEST_MICROPHONE_CHANNEL = 'request_microphone_channel'

export {
  DEFAULT_IPC_CHANNEL,
  IPC_USER_LOGIN_CHANNEL,
  IPC_USER_LOGOUT_CHANNEL,
  IPC_AUTH_TOKEN_FAILED_CHANNEL,
  IPC_USER_CONFIG_GET_CHANNEL,
  IPC_USER_CONFIG_SET_PARTIAL_CHANNEL,
  IPC_HOT_KEY_SETTING_START_CHANNEL,
  IPC_HOT_KEY_SETTING_RESULT_CHANNEL,
  IPC_HOT_KEY_SETTING_END_CHANNEL,
  IPC_HOT_KEY_DETECT_START_CHANNEL,
  IPC_HOT_KEY_DETECT_END_CHANNEL,
  IPC_OPEN_EXTERNAL_URL_CHANNEL,
  IPC_QUIT_AND_INSTALL_CHANNEL,
  IPC_IS_FIRST_LAUNCH_CHANNEL,
  IPC_MARK_AS_LAUNCHED_CHANNEL,
  IPC_GET_AUDIOS_CHANNEL,
  IPC_DOWNLOAD_AUDIO_CHANNEL,
  IPC_DELETE_AUDIO_CHANNEL,
  IPC_READ_AUDIO_FILE_CHANNEL,
  IPC_UPDATE_AUDIO_CHANNEL,
  IPC_DELETE_AUDIOS_BY_RETENTION_CHANNEL,
  IPC_GET_SYSTEM_INFO_CHANNEL,
  IPC_READ_ERROR_LOG_CHANNEL,
  IPC_CHECK_ACCESSIBILITY_CHANNEL,
  IPC_REQUEST_ACCESSIBILITY_CHANNEL,
  IPC_CHECK_MICROPHONE_CHANNEL,
  IPC_REQUEST_MICROPHONE_CHANNEL,
}
