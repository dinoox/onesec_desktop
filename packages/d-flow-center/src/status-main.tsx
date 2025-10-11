import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import StatusApp from './StatusApp.tsx'
import './global.css'
import './status.css'
import SoundService from '@/services/sound-service.ts'
import IPCService from '@/services/ipc-service.ts'
import useAuthStore from '@/store/auth-store.ts'

createRoot(document.getElementById('status-root')!).render(
  <StrictMode>
    <StatusApp />
  </StrictMode>,
)

// use async IIFE to avoid top-level await
;(async () => {
  await SoundService.initialize()
  await IPCService.initialize()
  if (useAuthStore.getState().isAuthed) {
    await IPCService.showStatusWindow()
  }
})()
