import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import StatusApp from './StatusApp.tsx'
import './global.css'
import './status.css'
import SoundService from '@/services/soundService.ts'
import IPCService from '@/services/ipcService.ts'

createRoot(document.getElementById('float-root')!).render(
  <StrictMode>
    <StatusApp />
  </StrictMode>,
)

await SoundService.initialize()
await IPCService.initialize()
