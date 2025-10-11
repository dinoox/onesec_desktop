import { app, Menu, MenuItemConstructorOptions } from 'electron'
import windowManager from './window-manager'

class MenuService {
  constructor() {}

  initialize() {
    const menu = Menu.buildFromTemplate(this.buildTemplate())
    Menu.setApplicationMenu(menu)
  }

  private buildTemplate(): MenuItemConstructorOptions[] {
    return [
      {
        label: '秒言',
        submenu: [
          {
            label: '关于秒言',
            click: app.showAboutPanel,
          },
          {
            label: '退出秒言',
            accelerator: 'Command+Q',
            click: app.quit,
          },
        ],
      },
      {
        label: '编辑',
        submenu: [
          {
            label: '撤销',
            accelerator: process.platform === 'darwin' ? 'Command+Z' : 'Ctrl+Z',
            role: 'undo',
          },
          {
            label: '重做',
            accelerator: process.platform === 'darwin' ? 'Command+Shift+Z' : 'Ctrl+Y',
            role: 'redo',
          },
          { type: 'separator' },
          {
            label: '剪切',
            accelerator: process.platform === 'darwin' ? 'Command+X' : 'Ctrl+X',
            role: 'cut',
          },
          {
            label: '复制',
            accelerator: process.platform === 'darwin' ? 'Command+C' : 'Ctrl+C',
            role: 'copy',
          },
          {
            label: '粘贴',
            accelerator: process.platform === 'darwin' ? 'Command+V' : 'Ctrl+V',
            role: 'paste',
          },
          {
            label: '全选',
            accelerator: process.platform === 'darwin' ? 'Command+A' : 'Ctrl+A',
            role: 'selectAll',
          },
        ],
      },
      {
        label: '开发',
        submenu: [
          {
            label: '切换开发者工具',
            accelerator: process.platform === 'darwin' ? 'Command+I' : 'Alt+Ctrl+I',
            click: () => windowManager.getContentWindow()?.webContents.toggleDevTools(),
          },
          {
            label: '重新加载',
            accelerator: process.platform === 'darwin' ? 'Command+R' : 'Ctrl+R',
            click: () => windowManager.getContentWindow()?.webContents.reload(),
          },
        ],
      },
      {
        label: '帮助',
        submenu: [
          {
            label: '打开秒言介绍',
            click: () => {
              // TODO: Send IPC message to renderer
            },
          },
        ],
      },
      {
        label: '窗口',
        submenu: [
          {
            label: '最小化',
            click: () => windowManager.getContentWindow()?.minimize(),
          },
          {
            label: '关闭窗口',
            accelerator: process.platform === 'darwin' ? 'Command+W' : 'Ctrl+W',
            click: () => windowManager.getContentWindow()?.close(),
          },
        ],
      },
    ]
  }
}

export default new MenuService()
