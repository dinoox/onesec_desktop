import log from 'electron-log'
import { BrowserWindow, screen } from 'electron'
import chalk from 'chalk'

const WINDOW_CONTENT_ID = 'content'

class WindowManager {
  private windows: Map<string, BrowserWindow> = new Map()

  constructor() {}

  /**
   * 注册一个窗口
   * @param identifier
   * @param window - 要注册的 BrowserWindow 实例
   * @returns 窗口的 ID
   */
  public register(window: BrowserWindow, identifier: string = ''): string {
    if (!identifier) {
      identifier = String(window.id)
    }

    if (this.windows.has(identifier)) {
      return identifier
    }

    this.windows.set(identifier, window)
    window.on('closed', () => this.unregister(identifier))

    log.info(
      `[WindowManager] Window ${identifier} registered. Total windows: ${this.windows.size}`,
    )
    return identifier
  }

  /**
   * 注销一个窗口
   * @param windowId - 要注销的窗口 ID
   * @returns 是否注销成功
   */
  public unregister(windowId: string): boolean {
    if (!this.windows.has(windowId)) {
      return false
    }

    return this.windows.delete(windowId)
  }

  /**
   * 根据 ID 获取窗口
   * @param windowId - 窗口 ID
   * @returns BrowserWindow 实例或 undefined
   */
  public getWindow(windowId: string): BrowserWindow | undefined {
    return this.windows.get(windowId)
  }

  /**
   * 获取主 Content 窗口
   * @returns Content Window 实例或
   */
  public getContentWindow(): BrowserWindow | undefined {
    return this.windows.get(WINDOW_CONTENT_ID)
  }

  /**
   * 获取所有已注册的窗口
   * @returns 所有窗口的数组
   */
  public getAllWindows(): BrowserWindow[] {
    return Array.from(this.windows.values())
  }

  /**
   * 根据 ID 显示窗口
   * @param windowId - 窗口 ID
   * @returns 窗口是否显示成功
   */
  public showWindow(windowId: string): boolean {
    const window = this.windows.get(windowId)
    if (!window || window.isDestroyed()) {
      return false
    }

    window.show()
    return true
  }

  /**
   * 根据 ID 隐藏窗口
   * @param windowId - 窗口 ID
   * @returns 窗口是否隐藏成功
   */
  public hideWindow(windowId: string): boolean {
    const window = this.windows.get(windowId)
    if (!window || window.isDestroyed()) {
      return false
    }

    window.hide()
    return true
  }

  /**
   * 向指定窗口发送消息
   * @param windowId - 窗口 ID
   * @param channel - 消息通道
   * @param data - 要发送的数据
   * @returns 是否发送成功
   */
  public sendToWindow(windowId: string, channel: string, ...data: any[]): boolean {
    const window = this.windows.get(windowId)
    if (!window || window.isDestroyed()) {
      return false
    }

    window.webContents.send(channel, ...data)
    return true
  }

  /**
   * 向所有窗口广播消息
   * @param channel - 消息通道
   * @param data - 要发送的数据
   * @returns 成功发送的窗口数量
   */
  public broadcast(channel: string, ...data: any[]): number {
    let successCount = 0

    this.windows.forEach((_, windowId) => {
      if (this.sendToWindow(windowId, channel, ...data)) successCount++
    })

    return successCount
  }
}

export default new WindowManager()
export { WINDOW_CONTENT_ID }
