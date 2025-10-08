import { ThemeProvider } from '@/components/theme-provider'
import useStatusStore from '@/store/statusStore'

function StatusApp() {
  const status = useStatusStore((state) => state.status)
  const audioLevel = useStatusStore((state) => state.audioLevel)

  console.log("audioLevel: ",audioLevel)
  const innerSize = 20 + audioLevel * 50

  return (
    <ThemeProvider defaultTheme="system" storageKey="float-ui-theme">
      <div className="flex items-center justify-center">
        <div className="relative w-7 h-7">
          {/* 外圈 */}
          <div className="absolute inset-0 rounded-full bg-gray-200"></div>
          {/* 内圈 */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500 transition-all duration-100"
            style={{
              width: `${innerSize}%`,
              height: `${innerSize}%`,
            }}
          ></div>
        </div>
      </div>
    </ThemeProvider>
  )
}

export default StatusApp
