import { ThemeProvider } from '@/components/theme-provider'
import { Spinner } from '@/components/ui/spinner'
import { BadgeCheckIcon, ChevronRightIcon, OctagonAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

function StatusApp() {
  const mode = useStatusStore((state) => state.mode)
  const status = useStatusStore((state) => state.status)
  const audioLevel = useStatusStore((state) => state.audioLevel)

  const innerSize = 20 + audioLevel * 50

  return (
    <ThemeProvider defaultTheme="system" storageKey="app-ui-theme">
      <div
        className="h-screen flex flex-col items-center justify-between relative"
        // onClick={() => ipcService.resizeStatusWindow(320, 130)}
      >
        <div className="relative flex flex-col items-center mt-auto">
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[300px] ">
            {status === 'notification' && (
              <Item variant="outline" size="sm" asChild className="cursor-pointer bg-background">
                <a href="#">
                  <ItemMedia>
                    <OctagonAlert className="size-5" />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>服务器响应超时</ItemTitle>
                  </ItemContent>
                  <ItemActions></ItemActions>
                </a>
              </Item>
            )}
          </div>
          <div
            className={`status relative shrink-0 transition-all duration-300 ${status === 'idle' ? 'w-5 h-5' : 'w-7 h-7'}`}
          >
            {/* 外圈 */}
            <div
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
