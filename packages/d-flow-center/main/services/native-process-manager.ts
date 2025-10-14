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

      this.nativeProcess = spawn(appPath, ['--disable-text-insertion'], {
        detached: false,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: {
          PATH: process.env.PATH,
          HOME: process.env.HOME,
          USER: process.env.USER,
          TMPDIR: process.env.TMPDIR,
          LANG: process.env.LANG || 'zh_CN.UTF-8',
          // 告诉 MiaoyanSwift 禁用文本插入，由 Electron 负责
          DISABLE_TEXT_INSERTION: 'true',
          LAUNCHED_FROM_ELECTRON: 'true',
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

      // setTimeout(() => {
      //
      //   if (this.nativeProcess) {
      //     log.info(chalk.red('Native process SIGKILL'))
      //     this.nativeProcess.kill('SIGKILL')
      //     this.nativeProcess = null
      //     resolve()
      //   }
      // }, 5000)
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
        'assets/MiaoyanSwift.app/Contents/MacOS/MiaoyanSwift',
      )
    }

    return path.join(
      process.resourcesPath,
      'Helpers/MiaoyanSwift.app/Contents/MacOS/MiaoyanSwift',
    )
  }

  async syncUserConfigToNativeProcess() {
    const config = userConfigManager.getConfig()

    udsService.broadcast({
      type: MessageTypes.INIT_CONFIG,
      timestamp: Date.now(),
      data: {
        auth_token: config.auth_token,
        hotkey_configs: config.hotkey_configs,
      },
    })

    log.info(`Init Native Config: ${JSON.stringify(config)}`)
  }
}

export default new NativeProcessManager()
