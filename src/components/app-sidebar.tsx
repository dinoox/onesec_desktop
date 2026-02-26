import React from 'react'
import { Link, matchPath, useLocation } from 'react-router'
import { type NavItem, navMain, settingsNav } from '@/configs/navigation'
import useUIStore, { useUIActions } from '@/store/ui-store'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import logo from '@/assets/images/logo.png'

function checkIsActive(href: string, item: NavItem) {
  if (matchPath({ path: item.url, end: true }, href)) return true
  if (item.subUrls) {
    for (let i in item.subUrls) {
      if (matchPath({ path: item.subUrls[i], end: true }, href)) return true
    }
  }
  return false
}

const AppSidebar: React.FC = () => {
  const location = useLocation()
  const { pathname } = location
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed)
  const settingsActive = checkIsActive(pathname, settingsNav)
  const { setSettingsDialogOpen } = useUIActions()

  return (
    <div
      className={`bg-background flex flex-col flex-none overflow-y-auto ${
        sidebarCollapsed ? 'w-15' : 'w-54'
      }`}
    >
      {/* Sidebar Header - Logo */}
      <div
        className={`app-drag-region transition-colors duration-300 ${sidebarCollapsed ? 'p-2 pt-14' : 'p-3 pt-14'}`}
      >
        <div
          className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-2 px-2 py-2'}`}
        >
          <img src={logo} alt="SaySo" className="w-18" />
          {!sidebarCollapsed && (
            <>
              <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                Trial
              </span>
            </>
          )}
        </div>
      </div>

      {/* Sidebar Content - Navigation */}
      <nav className={`${sidebarCollapsed ? 'px-3' : 'px-3'}`}>
        <TooltipProvider>
          {navMain.map((item) => {
            const isActive = checkIsActive(pathname, item)

            if (sidebarCollapsed) {
              return (
                <Tooltip key={item.url} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link
                      to={item.url}
                      className={`flex items-center justify-center p-[10px] rounded-md mb-1 ${
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'hover:bg-sidebar-accent/50'
                      }`}
                    >
                      {item.icon && (
                        <item.icon
                          className={`w-5 h-5 ${isActive && 'text-foreground dark:text-ripple-yellow flash-icon'}`}
                        />
                      )}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{item.title}</p>
                  </TooltipContent>
                </Tooltip>
              )
            }

            return (
              <Link
                key={item.url}
                to={item.url}
                data-theme-transition
                className={`flex items-center gap-3 px-3 py-2 rounded-md mb-1 transition-colors duration-300 ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'hover:bg-sidebar-accent/50'
                }`}
              >
                {item.icon && (
                  <item.icon className={`w-4 h-4 ${isActive && 'flash-icon'}`} />
                )}
                <span className={`text-sm ${isActive && ''}`}>{item.title}</span>
              </Link>
            )
          })}
        </TooltipProvider>
      </nav>

      {/* Sidebar Footer - Trial Card + Settings */}
      <div className="mt-auto px-3 pb-3">
        {/* Trial Card */}
        {!sidebarCollapsed && (
          <div className="mb-2 rounded-lg bg-white px-3 py-4">
            <p className="text-xs text-muted-foreground">Trail Plan</p>
            <p className="mt-1 text-sm font-semibold">已使用 0 / 30 天</p>
            {/* Progress bar */}
            <div className="mt-2">
              <div className="h-1 w-full rounded-full bg-muted">
                <div
                  className="h-1 rounded-full bg-ripple-brand-text"
                  style={{ width: '0%' }}
                />
              </div>
            </div>
            <p className="mt-2.5 text-[11px] leading-relaxed text-muted-foreground">
              在试用期结束前升级到 SaySo Pro
            </p>
            <button className="mt-2 w-full rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-opacity hover:opacity-90">
              升级
            </button>
          </div>
        )}

        {/* Divider */}
        <div className="my-2 border-t" />

        {/* Settings Link */}
        <TooltipProvider>
          {sidebarCollapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setSettingsDialogOpen(true)}
                  className={`flex items-center justify-center p-[10px] rounded-md ${
                    settingsActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'hover:bg-sidebar-accent/50'
                  }`}
                >
                  {settingsNav.icon && (
                    <settingsNav.icon
                      className={`w-5 h-5 ${settingsActive && 'text-foreground dark:text-ripple-yellow flash-icon'}`}
                    />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{settingsNav.title}</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={() => setSettingsDialogOpen(true)}
              data-theme-transition
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-300 ${
                settingsActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'hover:bg-sidebar-accent/50'
              }`}
            >
              {settingsNav.icon && (
                <settingsNav.icon
                  className={`w-4 h-4 ${settingsActive && 'flash-icon'}`}
                />
              )}
              <span className={`text-sm ${settingsActive && ''}`}>
                {settingsNav.title}
              </span>
            </button>
          )}
        </TooltipProvider>
      </div>
    </div>
  )
}

export default AppSidebar
