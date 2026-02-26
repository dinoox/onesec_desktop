# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## General Rules

- 每次给出最佳最精简的实现
- 用中文回复

## Build & Development Commands

```bash
pnpm dev              # Start Vite dev server with Electron hot reload
pnpm build            # TypeScript check + Vite build + electron-builder (macOS)
pnpm build:x64        # Build for x64 architecture
pnpm build:arm64      # Build for ARM64 (Apple Silicon)
pnpm lint             # ESLint (strict: --max-warnings 0)
pnpm format           # Prettier formatting
```

No test framework is configured.

## Code Style

- Prettier: no semicolons, single quotes, 90 char width, trailing commas
- Path alias: `@/*` maps to `./src/*`
- Provide concise implementations without generating documentation (per cursor rules)

## Architecture Overview

SaySo is an Electron + React desktop app for intelligent speech-to-text input on macOS. It uses a **three-process architecture**:

```
Renderer (React)  <--IPC-->  Electron Main  <--UDS-->  Native Process (macOS)
```

- **Renderer process** (`src/`): React 18 UI with hash-based routing (React Router v7)
- **Electron main process** (`electron/` + `main/`): Window management, IPC handlers, config persistence, SQLite database
- **Native process**: External macOS app for hotkey detection, microphone access, audio recording (managed via `NativeProcessManager`, communicates over Unix Domain Socket at `/tmp/ai.sayso.app.uds`)

### Key Directories

| Directory | Purpose |
|-----------|---------|
| `electron/` | Electron entry points (main.ts, preload.ts, updater.ts) |
| `main/services/` | Main process services: WindowManager, IPCService, DatabaseService, UDSService, UserConfigManager |
| `main/types/` | IPC channel definitions (`message.ts`), config schema (`config.ts`) |
| `src/pages/` | Page components: login, onboarding, dashboard, content |
| `src/store/` | Zustand stores: auth, user-config, status, ui |
| `src/services/api/` | REST API endpoint wrappers |
| `src/services/queries/` | TanStack Query hooks wrapping API calls |
| `src/components/ui/` | Shadcn/Radix UI components |
| `src/lib/request.ts` | Fetch wrapper with auth headers and cryptographic request signing |

### IPC Communication

All IPC channels are defined in `main/types/message.ts`. The pattern is:

- **Renderer → Main**: `window.ipcRenderer.invoke(CHANNEL, ...args)` via wrappers in `src/services/ipc-service.ts`
- **Main → Renderer**: `WindowManager.broadcast()` pushes events to all windows via `DEFAULT_IPC_CHANNEL`
- **Main ↔ Native**: UDS messages forwarded between native process and renderer windows by `ProcessManager`

### State Management

Four Zustand stores, each with an exported `useXxxActions()` hook:

- **authStore**: User auth state. Login/logout syncs to main process config via `UserService.setPartialConfig()`
- **userConfigStore**: Hotkey configurations (4 modes: normal, command, free, persona) and settings. Changes persist to electron-store via IPC
- **statusStore**: Transient state for hotkey setting flow, update progress, auth token validity
- **uiStore**: UI state (sidebar collapse) with localStorage persistence

**Key pattern**: Store actions that change config must sync to main process via IPC, which then syncs to the native process.

### Data Persistence

- **User config**: electron-store at `~/.config/ai.sayso.app/config.json`
- **Database**: SQLite3 (better-sqlite3) at `~/.config/ai.sayso.app/db.sqlite3` with `audios` and `personas` tables
- **Audio files**: `~/.config/ai.sayso.app/audios/*.wav`

### Multi-Window Architecture

- **Content window**: 1024x700, hidden title bar, custom traffic light position — main app UI
- **Status window**: ~90x30, frameless, transparent, always-on-top — floating recording indicator

### API Layer

`src/lib/request.ts` handles all HTTP requests with:
- Bearer token auth header injection
- Cryptographic signature (time + sign) for non-GET requests via crypto-js
- TOKEN_MISMATCH handling that triggers re-auth flow
