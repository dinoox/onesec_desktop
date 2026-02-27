import { app, BrowserWindow, ipcMain, nativeTheme } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import windowManager, { WINDOW_CONTENT_ID } from '../main/services/window-manager.ts'
import processManager from '../main/process-manager.ts'
import menuService from '../main/services/menu-service.ts'
import userConfigManager from '../main/services/user-config-manager.ts'
import { checkForUpdates, startPeriodicUpdateCheck } from './updater.ts'
import { throttle } from '../main/utils/throttle.ts'
import {
  DEFAULT_IPC_CHANNEL,
  MessageTypes,
  buildIPCMessage,
} from '../main/types/message.ts'

import { version } from '../package.json'
import { log } from 'electron-log'

// Disable HTTPS Cert Verification（only dev）
app.commandLine.appendSwitch('--ignore-certificate-errors')
app.commandLine.appendSwitch('--ignore-ssl-errors')
app.commandLine.appendSwitch('--ignore-certificate-errors-spki-list')
app.commandLine.appendSwitch('--disable-web-security')
app.commandLine.appendSwitch('--allow-running-insecure-content')

const __dirname = path.dirname(fileURLToPath(import.meta.url))
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

let win: BrowserWindow | null = null
let pendingLoginData: Record<string, any> | null = null

log('[protocol] registering sayso://, defaultApp:', process.defaultApp)
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('sayso', process.execPath, [
      path.resolve(process.argv[1]),
    ])
  }
} else {
  app.setAsDefaultProtocolClient('sayso')
}

function handleDeepLink(url: string) {
  log('[deep-link] received:', url)
  try {
    const parsed = new URL(url)
    log('[deep-link] hostname:', parsed.hostname)
    if (parsed.hostname === 'login') {
      const info = parsed.searchParams.get('info')
      if (!info) {
        log('[deep-link] no info param, ignoring')
        return
      }

      const data = JSON.parse(decodeURIComponent(info))
      log('[deep-link] parsed login data, keys:', Object.keys(data))
      const contentWindow = windowManager.getWindow(WINDOW_CONTENT_ID)
      log('[deep-link] contentWindow exists:', !!contentWindow)

      if (contentWindow && !contentWindow.isDestroyed()) {
        contentWindow.show()
        windowManager.broadcast(
          DEFAULT_IPC_CHANNEL,
          buildIPCMessage(MessageTypes.LOGIN_DATA_RECEIVED, {
            type: MessageTypes.LOGIN_DATA_RECEIVED,
            data,
          }),
        )
        log('[deep-link] broadcast LOGIN_DATA_RECEIVED to renderer')
      } else {
        pendingLoginData = data
        log('[deep-link] window not ready, stored as pendingLoginData')
      }
    }
  } catch (e) {
    log('[deep-link] failed to handle:', e)
  }
}

const gotTheLock = app.requestSingleInstanceLock()
log('[single-instance] lock acquired:', gotTheLock)

if (!gotTheLock) {
  log('[single-instance] another instance running, quitting')
  app.quit()
} else {
  app.on('second-instance', (_event, argv) => {
    log('[second-instance] argv:', argv)
    const url = argv.find((arg) => arg.startsWith('sayso://'))
    if (url) {
      log('[second-instance] found deep link:', url)
      handleDeepLink(url)
    }
    const contentWindow = windowManager.getWindow(WINDOW_CONTENT_ID)
    log('[second-instance] contentWindow exists:', !!contentWindow)
    if (contentWindow && !contentWindow.isDestroyed()) {
      if (contentWindow.isMinimized()) contentWindow.restore()
      contentWindow.show()
      contentWindow.focus()
    }
  })

  app.on('open-url', (event, url) => {
    log('[open-url] received:', url)
    event.preventDefault()
    handleDeepLink(url)
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
      win = null
    }
  })

  app.on('before-quit', async (_) => {
    await processManager.destroy()
    app.quit()
  })

  app.on('browser-window-focus', () => {
    throttle(checkForUpdates, 5 * 60 * 1000)
  })

  app.on('activate', () => {
    const contentWindow = windowManager.getWindow(WINDOW_CONTENT_ID)
    if (!contentWindow || contentWindow.isDestroyed()) {
      createWindow()
    } else {
      contentWindow.show()
    }
  })

  app.whenReady().then(async () => {
    app.setAboutPanelOptions({
      applicationName: 'SaySo',
      applicationVersion: version,
      copyright: `© Lunalabs`,
      credits:
        'SaySo 是一款基于语音识别的智能输入工具，支持快捷键触发、实时语音转文字等功能。',
      website: 'https://sayso.ai',
    })

    createWindow()
    await processManager.initialize()
    await startPeriodicUpdateCheck()
  })
}

function createWindow(onWebLoaded: Function = () => {}) {
  const theme = userConfigManager.getConfig().theme
  const isDarkMode =
    theme === 'system' ? nativeTheme.shouldUseDarkColors : theme === 'dark'

  win = new BrowserWindow({
    title: 'SaySo',
    width: 1024,
    height: 700,
    minWidth: 1024,
    minHeight: 700,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 10, y: 10 },
    backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  win.once('ready-to-show', () => {
    win?.show()
  })

  win.webContents.once('did-finish-load', async () => {
    windowManager.register(win!, WINDOW_CONTENT_ID)
    menuService.initialize()
    await onWebLoaded()

    if (pendingLoginData) {
      log('[deep-link] sending pendingLoginData to renderer')
      windowManager.broadcast(
        DEFAULT_IPC_CHANNEL,
        buildIPCMessage(MessageTypes.LOGIN_DATA_RECEIVED, {
          type: MessageTypes.LOGIN_DATA_RECEIVED,
          data: pendingLoginData,
        }),
      )
      pendingLoginData = null
    }
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL).then()
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html')).then()
  }
}

export { createWindow }
