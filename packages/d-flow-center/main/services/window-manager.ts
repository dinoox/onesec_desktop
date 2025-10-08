import log from 'electron-log'
import { BrowserWindow } from 'electron'

export class WindowManager {
  private static instance: WindowManager | null = null
  private windows: Map<number, BrowserWindow> = new Map()

  private constructor() {}

  static getInstance(): WindowManager {
    if (!WindowManager.instance) {
      WindowManager.instance = new WindowManager()
    }
    return WindowManager.instance
  }

  /**
   * 注册一个窗口
   * @param window - 要注册的 BrowserWindow 实例
   * @returns 窗口的 ID
   */
  public register(window: BrowserWindow): number {
    const windowId = window.id

    if (this.windows.has(windowId)) {
      return windowId
    }

    this.windows.set(windowId, window)
    window.on('closed', () => this.unregister(windowId))

    log.info(`[WindowManager] Window ${windowId} registered. Total windows: ${this.windows.size}`)
    return windowId
  }

  /**
   * 注销一个窗口
   * @param windowId - 要注销的窗口 ID
   * @returns 是否注销成功
   */
  public unregister(windowId: number): boolean {
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
  public getWindow(windowId: number): BrowserWindow | undefined {
    return this.windows.get(windowId)
  }

  /**
   * 获取所有已注册的窗口
   * @returns 所有窗口的数组
   */
  public getAllWindows(): BrowserWindow[] {
    return Array.from(this.windows.values())
  }

  /**
   * 向指定窗口发送消息
   * @param windowId - 窗口 ID
   * @param channel - 消息通道
   * @param data - 要发送的数据
   * @returns 是否发送成功
   */
  public sendToWindow(windowId: number, channel: string, ...data: any[]): boolean {
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

export const windowManager = WindowManager.getInstance()
