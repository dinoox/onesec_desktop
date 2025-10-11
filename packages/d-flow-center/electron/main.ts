import { app, BrowserWindow, screen } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import windowManager, {
  WINDOW_CONTENT_ID,
  WINDOW_STATUS_ID,
} from '../main/services/window-manager.ts'
import processManager from '../main/process-manager.ts'
import nativeProcessManager from '../main/services/native-process-manager.ts'
import menuService from '../main/services/menu-service.ts'

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

let win, statusWin: BrowserWindow | null

function createWindow(onWebLoaded: Function = () => {}) {
  win = new BrowserWindow({
    title: '秒言',
    width: 1024,
    height: 730,
    minWidth: 1024,
    minHeight: 730,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 10, y: 10 }, // 设置红绿灯按钮位置（macOS）
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  win.webContents.once('did-finish-load', async () => {
    windowManager.register(win!, WINDOW_CONTENT_ID)
    if (app.isPackaged) menuService.initialize()
    await onWebLoaded()
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL).then()
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html')).then()
  }
}

function createStatusWindow() {
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize
  const { workArea } = primaryDisplay

  const winWidth = 90
  const winHeight = 30
  const x = workArea.x + (screenWidth - winWidth) / 2
  const y = workArea.y + workArea.height - winHeight

  statusWin = new BrowserWindow({
    show: false,
    width: winWidth,
    height: winHeight,
    x,
    y,
    frame: false, // 无边框
    alwaysOnTop: true, // 始终在最上层
    hasShadow: false,
    skipTaskbar: true, // 不在任务栏显示
    resizable: false, // 不可调整大小
    movable: true, // 可移动
    minimizable: false, // 不可最小化
    maximizable: false, // 不可最大化
    closable: true,
    transparent: true,
    backgroundColor: '#00000000',
    opacity: 1.0,
    fullscreenable: false,
    simpleFullscreen: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      backgroundThrottling: false,
    },
  })
  statusWin.webContents.once('did-finish-load', async () => {
    windowManager.register(statusWin!, WINDOW_STATUS_ID)
    await nativeProcessManager.start()
  })

  if (VITE_DEV_SERVER_URL) {
    statusWin.loadURL(`${VITE_DEV_SERVER_URL}status.html`).then()
  } else {
    statusWin.loadFile(path.join(RENDERER_DIST, 'status.html')).then()
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
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

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  const contentWindow = windowManager.getWindow(WINDOW_CONTENT_ID)
  if (!contentWindow || contentWindow.isDestroyed()) {
    createWindow()
  } else {
    contentWindow.show()
  }
})

app.whenReady().then(async () => {
  app.setAboutPanelOptions({
    applicationName: '秒言',
    applicationVersion: '1.0.0',
    copyright: '© 2024 秒言团队',
    credits:
      '秒言是一款基于语音识别的智能输入工具，支持快捷键触发、实时语音转文字等功能。',
    website: 'https://miaoyan.app',
  })
  createWindow()
  createStatusWindow()
  await processManager.initialize()
})

export { createWindow, createStatusWindow }
