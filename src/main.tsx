import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './global.css'
import './i18n'
import IPCService from '@/services/ipc-service.ts'

createRoot(document.getElementById('root')!).render(<App />)
;(async () => {
  await IPCService.initialize()
})()
