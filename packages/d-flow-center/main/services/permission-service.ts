import { systemPreferences, shell } from 'electron'
import log from 'electron-log'

type PermissionType = 'accessibility' | 'microphone'

class PermissionService {
  constructor() {}

  /**
   * 检查辅助功能权限
   * @returns 是否已授予权限
   */
  public checkAccessibility(): boolean {
    const granted = systemPreferences.isTrustedAccessibilityClient(false)
    log.info(`[PermissionService] Accessibility permission: ${granted}`)
    return granted
  }

  /**
   * 检查麦克风权限
   * @returns 权限状态
   */
  public async checkMicrophone(): Promise<boolean> {
    const status = await systemPreferences.getMediaAccessStatus('microphone')
    log.info(`[PermissionService] Microphone permission: ${status}`)
    return status === 'granted'
  }

  /**
   * 请求辅助功能权限
   * @returns 是否已授予权限
   */
  public requestAccessibility(): boolean {
    const granted = systemPreferences.isTrustedAccessibilityClient(true)
    if (!granted) {
      log.warn(
        '[PermissionService] Accessibility permission not granted, opening system preferences',
      )
      this.openSystemPreferences('accessibility')
    }
    return granted
  }

  /**
   * 请求麦克风权限
   * @returns 权限状态
   */
  public async requestMicrophone(): Promise<boolean> {
    const status = await systemPreferences.askForMediaAccess('microphone')
    log.info(`[PermissionService] Microphone permission request result: ${status}`)
    return status
  }

  /**
   * 检查所有必需权限
   * @returns 所有权限是否都已授予
   */
  public async checkAllPermissions(): Promise<{ accessibility: boolean; microphone: boolean }> {
    const accessibility = this.checkAccessibility()
    const microphone = await this.checkMicrophone()
    return { accessibility, microphone }
  }

  /**
   * 请求所有必需权限
   * @returns 所有权限的授予状态
   */
  public async requestAllPermissions(): Promise<{ accessibility: boolean; microphone: boolean }> {
    const accessibility = this.requestAccessibility()
    const microphone = await this.requestMicrophone()
    log.info('[PermissionService] All permissions requested', { accessibility, microphone })
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
    shell.openExternal(urls[type])
    log.info(`[PermissionService] Opening system preferences for ${type}`)
  }
}

export default new PermissionService()
