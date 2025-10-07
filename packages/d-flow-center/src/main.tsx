import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './global.css'
import { DEFAULT_IPC_CHANNEL } from '../main/types/message.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if (window.ipcRenderer) {
  window.ipcRenderer.on(DEFAULT_IPC_CHANNEL, (_event, data) => {
    console.log('[Renderer] Received broadcast: ', data)
  })
}
