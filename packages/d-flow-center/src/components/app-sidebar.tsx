import React from 'react'
import { Link, useLocation, matchPath } from 'react-router'
import { navMain, type NavItem } from '@/configs/navigation'
import { Badge } from '@/components/ui/badge'
import { Home } from 'iconsax-reactjs'
import { useTheme } from '@/components/theme-provider'
import useUIStore from '@/store/ui-store'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

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
  const { theme } = useTheme()
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed)

  const getActualTheme = () => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return theme
  }

  const actualTheme = getActualTheme()
  const accentColor = actualTheme === 'light' ? 'text-[#FFC700]' : 'text-ripple-green'
  const badgeBgColor = actualTheme === 'light' ? 'bg-[#FFC700]' : 'bg-ripple-green'

  return (
    <div className={`border-r bg-sidebar flex flex-col flex-none overflow-y-auto transition-colors duration-300 ${
      sidebarCollapsed ? 'w-15' : 'w-64'
    }`}>
      {/* Sidebar Header */}
      {!sidebarCollapsed && (
        <div className="p-3 pt-5">
          <div className="flex items-center gap-2 px-2 py-2">
            <span className="font-semibold">秒言</span>
            <Badge
              variant="outline"
              className={`border-black text-black text-[10px] rounded-xl ${badgeBgColor}`}
            >
              试用版
            </Badge>
          </div>
        </div>
      )}

      {/* Sidebar Content */}
      <nav className={`flex-1 ${sidebarCollapsed ? 'px-2 pt-3' : 'px-2'}`}>
        <TooltipProvider>
          {navMain.map((item) => {
            const isActive = checkIsActive(pathname, item)

            if (sidebarCollapsed) {
              return (
                <Tooltip key={item.url} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link
                      to={item.url}
                      className={`flex items-center justify-center p-3 rounded-md mb-1 transition-colors ${
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'hover:bg-sidebar-accent/50'
                      }`}
                    >
                      {item.icon && (
                        <item.icon
                          className={`w-5 h-5 ${isActive && `${accentColor} flash-icon`}`}
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
                className={`flex items-center gap-3 px-3 py-2 rounded-md mb-1 transition-colors ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'hover:bg-sidebar-accent/50'
                }`}
              >
                {item.icon && (
                  <item.icon
                    className={`w-4 h-4 ${isActive && `${accentColor} flash-icon`}`}
                  />
                )}
                <span className={`text-sm ${isActive && accentColor}`}>{item.title}</span>
              </Link>
            )
          })}
        </TooltipProvider>
      </nav>
    </div>
  )
}

export default AppSidebar
