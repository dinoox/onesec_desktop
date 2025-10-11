import { systemPreferences, shell } from 'electron'
import log from 'electron-log'
import { PermissionStatus } from '@/store/status-store.ts'
import { DEFAULT_IPC_CHANNEL, IPCMessage, MessageTypes } from '../types/message.ts'
import windowManager from './window-manager.ts'
import nativeProcessManager from './native-process-manager.ts'
import chalk from 'chalk'

type PermissionType = 'accessibility' | 'microphone'

class PermissionService {
  constructor() {}
  private ps: PermissionStatus | null = null
  private timeout: NodeJS.Timeout | null = null

  async initialize(ps: PermissionStatus) {
    log.info(chalk.green('✓', `PermissionService initialize ${JSON.stringify(ps)}`))

    this.ps = ps
    if (this.timeout) clearInterval(this.timeout)
    this.timeout = setInterval(async () => {
      const newPS = await this.checkAllPermissions()
      if (newPS.microphone === ps.microphone && newPS.accessibility === ps.accessibility) {
        return
      }

      if (newPS.microphone && ps.microphone) {
        await nativeProcessManager.restart()
        log.info(chalk.green('✓', 'PermissionService restart native process'))
      } else {
        await nativeProcessManager.stop()
        log.info(chalk.red('✗', 'PermissionService stop native process'))
      }

      const timestamp = Date.now()
      const eventMessage: IPCMessage = {
        id: `event_${timestamp}`,
        type: 'event',
        source: 'main',
        timestamp,
        action: MessageTypes.PERMISSION_STATUS,
        data: {
          type: MessageTypes.PERMISSION_STATUS,
          data: ps,
          timestamp,
        },
      }

      windowManager.broadcast(DEFAULT_IPC_CHANNEL, eventMessage)
      this.ps = newPS
    }, 3000)
  }

  /**
   * 检查辅助功能权限
   * @returns 是否已授予权限
   */
  public checkAccessibility(): boolean {
    return systemPreferences.isTrustedAccessibilityClient(false)
  }

  /**
   * 检查麦克风权限
   * @returns 权限状态
   */
  public async checkMicrophone() {
    const status = systemPreferences.getMediaAccessStatus('microphone')
    return status === 'granted'
  }

  /**
   * 请求辅助功能权限
   * @returns 是否已授予权限
   */
  public requestAccessibility(): boolean {
    const granted = systemPreferences.isTrustedAccessibilityClient(true)
    if (!granted) {
      this.openSystemPreferences('accessibility')
    }
    return granted
  }

  /**
   * 请求麦克风权限
   * @returns 权限状态
   */
  public async requestMicrophone(): Promise<boolean> {
    return await systemPreferences.askForMediaAccess('microphone')
  }

  /**
   * 检查所有必需权限
   * @returns 所有权限是否都已授予
   */
  public async checkAllPermissions(): Promise<PermissionStatus> {
    const accessibility = this.checkAccessibility()
    const microphone = await this.checkMicrophone()
    return { accessibility, microphone }
  }

  /**
   * 打开系统偏好设置
   * @param type - 要打开的权限类型
   */
  public openSystemPreferences(type: PermissionType): void {
    const urls: Record<PermissionType, string> = {
      accessibility:
        'x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility',
      microphone: 'x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone',
    }
    shell.openExternal(urls[type]).then()
  }

  /**
   * 根据权限状态跳转到对应的系统设置页面
   * @param permissionStatus - 权限状态对象
   */
  openSettingsForPermission(permissionStatus: { microphone: boolean; accessibility: boolean }) {
    if (!permissionStatus.microphone) {
      this.openSystemPreferences('microphone')
      return
    }

    if (!permissionStatus.accessibility) {
      this.openSystemPreferences('accessibility')
      return
    }
  }
}

export default new PermissionService()
