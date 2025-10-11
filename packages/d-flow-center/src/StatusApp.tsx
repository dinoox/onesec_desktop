import { ThemeProvider } from '@/components/theme-provider'
import { Spinner } from '@/components/ui/spinner'
import { BadgeCheckIcon, ChevronRightIcon, OctagonAlert, PopcornIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import useStatusStore from '@/store/status-store.ts'
import ipcService from '@/services/ipc-service.ts'
import { useEffect } from 'react'

function StatusApp() {
  const mode = useStatusStore((state) => state.mode)
  const status = useStatusStore((state) => state.status)
  const audioLevel = useStatusStore((state) => state.audioLevel)
  const pmStatus = useStatusStore((state) => state.permissionStatus)

  const innerSize = 20 + audioLevel * 50

  useEffect(() => {}, [pmStatus])

  const testFn = () => {
    ipcService
      .showStatusWindowNotification(
        () => {
          console.log(1)
        },
        async () => {},
        false,
        30000,
      )
      .then()
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="app-ui-theme">
      <div className="h-screen flex flex-col items-center justify-between relative">
        <div className="relative flex flex-col items-center mt-auto">
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-max max-w-[300px] ">
            {status === 'processing' && (
              <Alert className="dark">
                <OctagonAlert />
                <AlertTitle>服务器响应超时</AlertTitle>
              </Alert>
            )}

            {(!pmStatus.microphone || !pmStatus.accessibility) && (
              <Alert
                className="dark hover:bg-[#000000] transition-colors duration-200"
                onClick={() => {
                  ipcService.askForPermissionSetting(pmStatus)
                }}
              >
                <PopcornIcon />
                <AlertTitle>
                  缺少权限：{!pmStatus.accessibility && '辅助功能'}{' '}
                  {!pmStatus.microphone && '麦克风'}
                </AlertTitle>
                <AlertDescription>
                  点击此提示框跳转到
                  {!pmStatus.microphone && !pmStatus.accessibility
                    ? '权限'
                    : !pmStatus.microphone
                      ? '麦克风'
                      : '辅助功能'}
                  设置页面
                </AlertDescription>
                <button
                  className="absolute top-3 right-3"
                  onClick={(e) => {
                    e.stopPropagation()
                    ipcService.resizeStatusWindow(90, 30)
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
              </Alert>
            )}
          </div>
          <div
            className={`status relative shrink-0 transition-all duration-300 ${status === 'idle' ? 'w-5 h-5' : 'w-7 h-7'}`}
          >
            {/* 外圈 */}
            <div
              // onClick={testFn}
              className={`absolute inset-0 rounded-full ${status === 'idle' ? 'bg-transparent' : 'bg-black'} border ${status === 'speaking' ? 'border-[#888888B2]' : 'border-[#FFFFFF4C]'} transition-all duration-100`}
            ></div>
            {/* 内圈 */}
            {status === 'processing' ? (
              <Spinner
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-5  ${mode === 'normal' ? 'text-ripple-green' : 'text-ripple-yellow'} transition-all duration-100`}
              />
            ) : (
              <div
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ${status === 'idle' ? 'bg-[#ccc]' : mode === 'normal' ? 'bg-ripple-green' : 'bg-ripple-yellow'} transition-all duration-100`}
                style={{
                  width: `${innerSize}%`,
                  height: `${innerSize}%`,
                }}
              ></div>
            )}
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}

export default StatusApp
