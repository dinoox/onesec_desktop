import { app, BrowserWindow, screen } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import windowManager from '../main/services/window-manager.ts'
import processManager from '../main/communications/process-manager.ts'

// 禁用HTTPS证书验证（仅用于开发环境或自签名证书）
app.commandLine.appendSwitch('--ignore-certificate-errors')
app.commandLine.appendSwitch('--ignore-ssl-errors')
app.commandLine.appendSwitch('--ignore-certificate-errors-spki-list')
app.commandLine.appendSwitch('--disable-web-security')
app.commandLine.appendSwitch('--allow-running-insecure-content')

const __dirname = path.dirname(fileURLToPath(import.meta.url))
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

let win, statusWin: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  win.webContents.on('did-finish-load', async () => {
    windowManager.register(win!)
    await processManager.initialize()
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL).then()
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html')).then()
  }
}

function createFloatWindow() {
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.bounds

  const floatWidth = 90
  const floatHeight = 30
  const x = Math.floor((width - floatWidth) / 2)
  const y = Math.floor(height - floatHeight - 20) // 距离屏幕真正底部20px

  statusWin = new BrowserWindow({
    // show: false,
    width: floatWidth,
    height: floatHeight,
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
    closable: true, // 可关闭
    transparent: true, // 透明背景
    backgroundColor: '#00000000', // 完全透明的背景色
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  statusWin.webContents.on('did-finish-load', async () => windowManager.register(statusWin!))

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
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(async () => {
  app.setAboutPanelOptions({
    applicationName: '秒言',
    applicationVersion: '1.0.0',
    copyright: '© 2024 秒言团队',
    credits: '秒言是一款基于语音识别的智能输入工具，支持快捷键触发、实时语音转文字等功能。',
    website: 'https://miaoyan.app',
    iconPath: path.join(__dirname, '../../assets/icon.icns'),
  })
  createWindow()
  createFloatWindow()
})
