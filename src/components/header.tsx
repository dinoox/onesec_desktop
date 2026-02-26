import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import { navMain } from '@/configs/navigation'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import useStatusStore, { useStatusActions } from '@/store/status-store'
import { IPC_QUIT_AND_INSTALL_CHANNEL } from '../../main/types/message.ts'
import { Loader2 } from 'lucide-react'
import ipcService from '@/services/ipc-service.ts'

const Header: React.FC = () => {
  const location = useLocation()
  const currentTitle =
    navMain.find((item) => item.url === location.pathname)?.title || '首页'

  const updateChecking = useStatusStore((state) => state.updateChecking)
  const updateProgress = useStatusStore((state) => state.updateProgress)
  const updateDownloaded = useStatusStore((state) => state.updateDownloaded)
  const updateInfo = useStatusStore((state) => state.updateInfo)
  const { setUpdateInfo } = useStatusActions()
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)

  useEffect(() => {
    if (updateDownloaded) {
      setShowUpdateDialog(true)
    }
  }, [updateDownloaded])

  const handleUpdate = () => {
    ipcService.quitAndInstall(updateInfo?.version)
  }

  const handleDialogChange = (open: boolean) => {
    setShowUpdateDialog(open)
    if (!open) {
      setUpdateInfo(false, null)
    }
  }

  return (
    <>
      <header className="flex shrink-0 items-center justify-between py-0 border-b h-[55px] px-[1.15px]">
        <div className="w-22"></div>
        <div className="flex items-center gap-4 justify-center">
          <div className="text-base">{currentTitle}</div>
        </div>
        {/* 更新按钮 */}
        <div className="w-22 app-no-drag flex justify-end pr-5">
          <div className="relative w-5 h-5">
            {/* 检查更新状态 - 旋转加载 */}
            <div
              className={`absolute inset-0 transition-all duration-300 ${
                updateChecking && updateProgress === null
                  ? 'opacity-100 scale-100'
                  : 'opacity-0 scale-75 pointer-events-none'
              }`}
            >
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground/30" />
            </div>
            {/* 下载进度状态 - 圆环进度 */}
            <div
              className={`absolute inset-0 transition-all duration-300 ${
                updateProgress !== null
                  ? 'opacity-100 scale-100'
                  : 'opacity-0 scale-75 pointer-events-none'
              }`}
            >
              <svg width="20" height="20" viewBox="0 0 20 20">
                {/* 背景圆环 */}
                <circle
                  cx="10"
                  cy="10"
                  r="8"
                  fill="none"
                  className="stroke-muted-foreground/20"
                  strokeWidth="2"
                />
                {/* 进度圆环 */}
                <circle
                  cx="10"
                  cy="10"
                  r="8"
                  fill="none"
                  className="stroke-ripple-brand-text transition-[stroke-dashoffset] duration-300 ease-out"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 8}
                  strokeDashoffset={2 * Math.PI * 8 * (1 - (updateProgress ?? 0) / 100)}
                  transform="rotate(-90 10 10)"
                />
              </svg>
            </div>

            {/* 下载完成状态 - 更新图标 */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`absolute inset-0 cursor-pointer transition-all duration-300 ${
                    updateDownloaded && updateProgress === null
                      ? 'opacity-100 scale-100'
                      : 'opacity-0 scale-75 pointer-events-none'
                  }`}
                  style={{ filter: 'drop-shadow(0px 0px 10px rgba(64, 158, 255, 1))' }}
                  onClick={() => setShowUpdateDialog(true)}
                >
                  <svg
                    viewBox="0 0 1024 1024"
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                  >
                    <path
                      d="M512 1024a512 512 0 1 1 512-512 513.536 513.536 0 0 1-512 512z m0-73.1136A438.8864 438.8864 0 1 0 73.1136 512 440.32 440.32 0 0 0 512 950.8864z m36.5568-577.8432l91.4432 91.4432a36.2496 36.2496 0 0 0 51.2-51.2L563.2 285.2864a70.656 70.656 0 0 0-102.4 0l-128 128a36.2496 36.2496 0 0 0 51.2 51.2l91.4432-91.4432v358.4a36.5568 36.5568 0 1 0 73.1136 0z m0 0"
                      className="fill-ripple-brand"
                    />
                  </svg>
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="flex flex-col items-center gap-1.5 px-2 py-3"
              >
                <span className="font-medium">新版本 v{updateInfo?.version}</span>
                <span className="text-xs text-muted-foreground">
                  {updateInfo?.releaseDate &&
                    new Date(updateInfo.releaseDate).toLocaleDateString('zh-CN')}
                </span>
                <Button size="sm" className="h-6 text-xs mt-1" onClick={handleUpdate}>
                  立即更新
                </Button>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </header>

      <AlertDialog open={showUpdateDialog} onOpenChange={handleDialogChange}>
        <AlertDialogContent className="max-w-[400px]!">
          <AlertDialogHeader>
            <AlertDialogTitle>发现新版本</AlertDialogTitle>
            <AlertDialogDescription>
              新版本 {updateInfo?.version} 已下载完成 ，是否立即重启更新？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>稍后</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdate}>立即更新</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default Header
