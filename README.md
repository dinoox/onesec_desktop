### 秒言 - 智能语音输入工具

> 一款基于语音识别的智能输入桌面应用，支持快捷键触发、实时语音转文字等功能

秒言是一个使用 Electron + React 构建的跨平台桌面应用，专注于提供高效的语音识别和智能输入体验。应用采用多窗口架构，支持主窗口和悬浮状态窗口，通过 Unix Domain Socket 实现进程间通信。

<img width="1136" height="812" alt="截屏2026-01-12 11 45 19" src="https://github.com/user-attachments/assets/b3234b8d-4ae3-443c-abb7-e3eef96fdf11" />

<img width="1136" height="812" alt="截屏2026-01-12 11 46 59" src="https://github.com/user-attachments/assets/061b0217-498e-472d-bfc0-f6449b1b8813" />
<img width="1136" height="812" alt="截屏2026-01-12 11 47 05" src="https://github.com/user-attachments/assets/dd16fece-5be7-46d6-88e7-65ce0a31697d" />
<img width="1136" height="812" alt="截屏2026-01-12 11 47 08" src="https://github.com/user-attachments/assets/9faf713f-35a7-4fa4-91cc-df7a9a39e2cd" />
<img width="1136" height="812" alt="截屏2026-01-12 11 47 36" src="https://github.com/user-attachments/assets/6b26c816-c88f-41b2-8152-7da68ca1fc72" />
<img width="1136" height="812" alt="截屏2026-01-12 11 47 47" src="https://github.com/user-attachments/assets/bf6b2678-991f-4e42-83a0-ebe31c57bb38" />
<img width="1136" height="812" alt="截屏2026-01-12 11 51 38" src="https://github.com/user-attachments/assets/7e97073e-c707-46b3-8b22-400ec4386d55" />


### ✨ 核心功能

- 🎤 **语音识别转文字**：实时将语音转换为文字输入
- ⌨️ **快捷键支持**：自定义快捷键快速触发录音
- 🪟 **多窗口管理**：主窗口 + 悬浮状态窗口
- 🔐 **用户认证**：完整的登录和权限管理系统
- ⚙️ **配置管理**：持久化用户配置和偏好设置
- 🌓 **主题切换**：支持浅色/深色主题
- 📱 **多屏支持**：自动适配多显示器环境



### 🛠️ 技术栈

#### 前端技术

| 技术 | 版本 | 说明 |
|------|------|------|
| **React** | 18.2.0 | UI 框架 |
| **TypeScript** | 5.2.2 | 类型系统 |
| **React Router** | 7.9.3 | 路由管理 |
| **TailwindCSS** | 4.1.14 | 样式框架 |
| **Radix UI** | - | 无障碍 UI 组件库 |
| **Framer Motion** | 12.23.22 | 动画库 |
| **React Hook Form** | 7.64.0 | 表单管理 |
| **Zod** | 4.1.11 | Schema 验证 |
| **TanStack Query** | 5.90.2 | 数据请求和缓存 |
| **Zustand** | 5.0.8 | 状态管理 |
| **Next Themes** | 0.4.6 | 主题管理 |
| **Lucide React** | 0.544.0 | 图标库 |
| **Sonner** | 2.0.7 | Toast 通知 |

#### 桌面端技术

| 技术 | 版本 | 说明 |
|------|------|------|
| **Electron** | 30.0.1 | 桌面应用框架 |
| **Vite** | 5.1.6 | 构建工具 |
| **Electron Builder** | 24.13.3 | 应用打包 |
| **Electron Store** | 11.0.2 | 数据持久化 |
| **Electron Log** | 5.4.3 | 日志管理 |



#### 开发工具

- **pnpm** - 包管理器
- **ESLint** - 代码检查
- **Prettier** - 代码格式化
- **TypeScript** - 类型检查



### 📁 项目结构

```
ddxh-flow/
├── packages/
│   └── d-flow-center/              # 主应用包
│       ├── electron/               # Electron 主进程
│       │   ├── main.ts            # 主进程入口
│       │   └── preload.ts         # 预加载脚本
│       ├── main/                  # 主进程业务逻辑
│       │   ├── communications/    # 进程间通信
│       │   │   ├── process-manager.ts   # 进程管理器
│       │   │   └── uds-service.ts      # Unix Socket 服务
│       │   ├── services/         # 核心服务
│       │   │   ├── window-manager.ts        # 窗口管理
│       │   │   ├── user-config-manager.ts   # 配置管理
│       │   │   └── native-process-manager.ts # 原生进程管理
│       │   └── types/            # 类型定义
│       │       ├── config.ts
│       │       └── message.ts
│       ├── src/                  # 渲染进程源码
│       │   ├── components/       # React 组件
│       │   │   ├── app/         # 应用组件
│       │   │   ├── layout/      # 布局组件
│       │   │   └── ui/          # UI 组件库
│       │   ├── pages/           # 页面组件
│       │   │   ├── content/     # 内容管理页面
│       │   │   ├── dashboard/   # 仪表盘
│       │   │   └── login/       # 登录页面
│       │   ├── routes/          # 路由配置
│       │   ├── services/        # 服务层
│       │   │   ├── api/        # API 接口
│       │   │   ├── queries/    # React Query 配置
│       │   │   └── ipc-service.ts  # IPC 通信服务
│       │   ├── store/          # 状态管理
│       │   ├── hooks/          # 自定义 Hooks
│       │   ├── lib/            # 工具函数
│       │   └── types/          # 类型定义
│       ├── assets/             # 静态资源
│       │   ├── icon.icns       # 应用图标
│       │   └── entitlements.mac.plist  # macOS 权限配置
│       ├── index.html          # 主窗口 HTML
│       ├── status.html         # 状态窗口 HTML
│       ├── package.json
│       ├── vite.config.ts      # Vite 配置
│       └── electron-builder.json5  # 打包配置
├── package.json
└── pnpm-workspace.yaml
```



### 🏗️ 架构设计

#### 多窗口架构

应用采用多窗口设计：

1. **主窗口（Content Window）**
   - 尺寸：1200 x 800
   - 功能：应用主界面，包含设置、内容管理等功能
   - 路由：Dashboard、内容管理、快捷键设置等

2. **状态窗口（Status Window）**
   - 尺寸：90 x 30（可调整）
   - 特性：
     - 无边框透明窗口
     - 始终置顶显示
     - 自动跟随鼠标所在屏幕
     - 居中底部显示
   - 功能：显示录音状态、实时反馈



#### 进程间通信

```
┌─────────────────┐
│  Electron Main  │
│    Process      │
└────────┬────────┘
         │
    ┌────┴────┐
    │   IPC   │
    └────┬────┘
         │
    ┌────┴────────────────┐
    │                     │
┌───▼──────┐    ┌────────▼────┐
│ Renderer │    │   Native    │
│ Process  │    │   Process   │
└──────────┘    └─────────────┘
                      ▲
                      │
                  ┌───┴────┐
                  │  UDS   │
                  └────────┘
```

- **IPC（Inter-Process Communication）**：Electron 主进程与渲染进程通信
- **UDS（Unix Domain Socket）**：主进程与原生进程通信
- **事件转发**：UDS 事件自动转发到渲染进程



#### 核心服务

1. **WindowManager（窗口管理器）**
   - 窗口注册/注销
   - 窗口显示/隐藏
   - 消息广播
   - 多屏适配

2. **ProcessManager（进程管理器）**
   - UDS 服务启动
   - 原生进程管理
   - 事件转发
   - 配置同步

3. **UserConfigManager（配置管理器）**
   - 用户配置持久化
   - 快捷键配置
   - 认证信息管理



### 🚀 快速开始

#### 环境要求

- Node.js >= 18
- pnpm >= 10.11.0
- macOS（当前版本主要支持 macOS）

#### 安装依赖

```bash
# 使用 pnpm 安装依赖
pnpm install
```

#### 开发模式

```bash
cd packages/d-flow-center
pnpm dev
```

#### 构建应用

```bash
cd packages/d-flow-center
pnpm build
```

构建后的应用将在 `dist` 目录生成。

### ⚙️ 配置说明

#### macOS 权限配置

应用需要以下 macOS 权限（在 `entitlements.mac.plist` 中配置）：

- 🎤 **麦克风访问**：用于语音识别和音频录制
- 📷 **摄像头访问**：用于视频录制功能
- 🔧 **辅助功能权限**：用于监听键盘事件和快捷键
- 📧 **Apple Events**：用于应用间自动化

#### 开发环境配置

开发环境默认禁用了证书验证（仅用于开发）：

```typescript
app.commandLine.appendSwitch('--ignore-certificate-errors')
app.commandLine.appendSwitch('--disable-web-security')
```

**⚠️ 生产环境请移除这些配置！**



### 📦 打包配置

使用 Electron Builder 进行打包，支持：

- ✅ macOS (arm64 + x64)
- ✅ 代码签名（需配置证书）
- ✅ 公证（可选）

配置文件：`electron-builder.json5`

### 🎨 UI 组件

项目使用 Radix UI 作为基础组件库，并基于 TailwindCSS 进行样式定制。主要组件包括：

- Button、Input、Select 等表单组件
- Dialog、Sheet、Dropdown Menu 等交互组件
- Sidebar、Breadcrumb 等导航组件
- Toast（Sonner）通知组件
- 主题切换支持



### 📝 开发规范

- TypeScript 严格模式
- ESLint 代码检查
- Prettier 代码格式化
- 组件化开发
- 类型安全

### 🔧 核心依赖说明

#### UI 框架
- **React**：现代化的 UI 构建框架
- **TailwindCSS**：实用优先的 CSS 框架
- **Radix UI**：提供无障碍的底层 UI 组件

#### 状态管理
- **Zustand**：轻量级状态管理（全局状态）
- **React Hook Form**：高性能表单管理
- **TanStack Query**：服务端状态管理和数据缓存

#### 工具库
- **Zod**：TypeScript 优先的 Schema 验证
- **class-variance-authority**：类名变体管理
- **clsx + tailwind-merge**：条件类名合并

### 📄 许可证

未指定许可证



### 👥 团队

© 2024 秒言团队



### 🔗 相关链接

- 官网：https://miaoyan.app
- 版本：1.0.0

---

**注意**：本项目处于开发阶段，部分功能可能还在完善中。

