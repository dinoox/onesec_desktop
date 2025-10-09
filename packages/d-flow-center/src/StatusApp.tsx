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
import useStatusStore from '@/store/statusStore'
import ipcService from '@/services/ipcService.ts'

function StatusApp() {
  const mode = useStatusStore((state) => state.mode)
  const status = useStatusStore((state) => state.status)
  const audioLevel = useStatusStore((state) => state.audioLevel)

  const innerSize = 20 + audioLevel * 50

  return (
    <ThemeProvider defaultTheme="system" storageKey="app-ui-theme">
      <div
        className="h-screen flex flex-col items-center relative"
        onClick={() => ipcService.resizeStatusWindow(320, 130)}
      >
        <div className="relative mt-auto flex flex-col items-center gap-2 ">
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[300px] ">
            {true && (
              <Item variant="outline" size="sm" asChild className="cursor-pointer bg-background">
                <a href="#">
                  <ItemMedia>
                    <OctagonAlert className="size-5" />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>服务器响应超时 {status}</ItemTitle>
                  </ItemContent>
                  <ItemActions></ItemActions>
                </a>
              </Item>
            )}
          </div>
          <div className="status relative w-7 h-7 shrink-0">
            {/* 外圈 */}
            <div className="absolute inset-0 rounded-full bg-gray-700  border border-gray-200"></div>
            {/* 内圈 */}
            {status === 'processing' ? (
              <Spinner
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-5 text-white`}
              />
            ) : (
              <div
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ${mode === 'normal' ? 'bg-emerald-500' : 'bg-yellow-300'} transition-all duration-100`}
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
