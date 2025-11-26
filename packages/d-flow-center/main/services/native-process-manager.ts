import { app } from 'electron'
import log from 'electron-log'
import { spawn, ChildProcess } from 'child_process'
import path from 'path'
import fs from 'fs'
import chalk from 'chalk'
import userConfigManager from './user-config-manager.ts'
import udsService from './uds-service.ts'
import { MessageTypes } from '../types/message.ts'

class NativeProcessManager {
  constructor() {}
  private nativeProcess: ChildProcess | null = null

  async start() {
    log.info(chalk.green('Starting native process'))
    if (this.nativeProcess) {
      return
    }

    try {
      const appPath = this.getNativeAppPath()
      if (!fs.existsSync(appPath)) {
        const err = `NativeProcess 文件不存在: ${appPath}`
        log.error(err)
        throw new Error(err)
      }

      try {
        fs.chmodSync(appPath, '755')
      } catch (chmodError) {
        console.warn(
          '[MiaoyanSwiftManager] Failed to set executable permission:',
          chmodError,
        )
      }

      const args = this.buildNativeProcessArgs()
      log.info('[NativeProcess] Starting with args:', args)

      this.nativeProcess = spawn(appPath, args, {
        detached: false,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: {
          ...process.env,
          LANG: process.env.LANG || 'zh_CN.UTF-8',
          // 禁用输出缓冲，确保日志能实时输出
          NSUnbufferedIO: 'YES',
          PYTHONUNBUFFERED: '1',
        } as unknown as NodeJS.ProcessEnv,
      })

      const childProcess = this.nativeProcess

      childProcess.on('error', (error: Error) => {
        log.error('[NativeProcess] Process error:', error)
        this.nativeProcess = null
      })

      childProcess.on('exit', (code: number | null, signal: string | null) => {
        log.info(`[NativeProcess] Process exited with code: ${code}, signal: ${signal}`)
        this.nativeProcess = null
      })

      if (childProcess.stdout) {
        childProcess.stdout.on('data', (data: Buffer) => {
          const output = data.toString().trim()
          if (output) {
            log.info(`[NativeProcess] ${output}`)
          }
        })
      }

      if (childProcess.stderr) {
        childProcess.stderr.on('data', (data: Buffer) => {
          const output = data.toString().trim()
          if (output) {
            log.error(`[NativeProcess] ${output}`)
          }
        })
      }

      process.on('exit', () => childProcess.kill())
      log.log('[NativeProcess] Started successfully', {
        pid: childProcess.pid,
        path: appPath,
      })
    } catch (err) {
      log.error('[NativeProcess] Failed to start:', err)
      throw err
    }
  }

  async stop(): Promise<void> {
    log.info(chalk.red('Native process stop'))
    if (!this.nativeProcess) {
      return
    }

    return new Promise((resolve) => {
      if (!this.nativeProcess) {
        resolve()
        return
      }

      this.nativeProcess.once('exit', () => {
        log.info(chalk.red('Native process once exit'))
        this.nativeProcess = null
        resolve()
      })

      this.nativeProcess.kill('SIGTERM')
    })
  }

  public async restart(): Promise<void> {
    await this.stop()
    await this.start()
  }

  public isRunning(): boolean {
    return this.nativeProcess !== null && !this.nativeProcess.killed
  }

  private getNativeAppPath(): string {
    if (!app.isPackaged) {
      return path.join(
        app.getAppPath(),
        'assets/OnesecCore.app/Contents/MacOS/OnesecCore',
      )
    }

    return path.join(
      process.resourcesPath,
      'Helpers/OnesecCore.app/Contents/MacOS/OnesecCore',
    )
  }

  /**
   * 构建 Native 进程的启动参数
   */
  private buildNativeProcessArgs(): string[] {
    const config = userConfigManager.getConfig()

    // 1. 获取 Auth token
    const authToken = config.auth_token

    // 2. 获取 UDS channel 路径
    const udsChannel = udsService.socketPath

    // 3. 获取服务器地址
    const url = new URL(import.meta.env.VITE_API_BASEURL || 'https://114.55.98.75:443')
    const server = url.host

    return [
      '--uds-channel',
      udsChannel,
      '--server',
      server,
      '--auth-token',
      authToken,
    ]
  }

  async sendAuthTokenFailed() {
    udsService.broadcast({
      type: MessageTypes.AUTH_TOKEN_FAILED,
      timestamp: Date.now(),
      data: {}
    })
  }

  async syncUserConfigToNativeProcess() {
    const config = userConfigManager.getConfig()
    udsService.broadcast({
      type: MessageTypes.UPDATE_CONFIG,
      timestamp: Date.now(),
      data: {}
    })

    log.info(`Update Native Config: ${JSON.stringify(config)}`)
  }
}

export default new NativeProcessManager()
