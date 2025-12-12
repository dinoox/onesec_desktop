import React from 'react'
import { Link, useLocation, matchPath } from 'react-router'
import { navMain, type NavItem } from '@/configs/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import useUIStore from '@/store/ui-store'
import useAuthStore from '@/store/auth-store'
import { CircleFadingArrowUpIcon } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

function checkIsActive(href: string, item: NavItem) {
  if (matchPath({ path: item.url, end: true }, href)) return true
  if (item.subUrls) {
    for (let i in item.subUrls) {
      if (matchPath({ path: item.subUrls[i], end: true }, href)) return true
    }
  }
  return false
}

const membershipLabels: Record<string, string> = {
  normal: '普通用户',
  pro: 'Pro',
}

const AppSidebar: React.FC = () => {
  const location = useLocation()
  const { pathname } = location
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed)
  const user = useAuthStore((state) => state.user)

  return (
    <div
      className={`border-r bg-background flex flex-col flex-none overflow-y-auto ${
        sidebarCollapsed ? 'w-15' : 'w-64'
      }`}
    >
      {/* Sidebar Header */}
      {!sidebarCollapsed && (
        <div className="p-3 pt-5 transition-colors duration-300">
          <div className="flex items-center gap-2 px-2 py-2">
            <span className="text-base font-semibold">秒言</span>
            {user && user.membership_type && !sidebarCollapsed && (
              <Badge variant="secondary" className="text-ripple-brand-text">
                {membershipLabels[user.membership_type] || user.membership_type}
              </Badge>
            )}
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
                  <item.icon
                    className={`w-4 h-4 ${isActive && 'text-ripple-brand-text flash-icon'}`}
                  />
                )}
                <span className={`text-sm ${isActive && 'text-ripple-brand-text'}`}>
                  {item.title}
                </span>
              </Link>
            )
          })}
        </TooltipProvider>
      </nav>

      {/* 会员信息 */}
      {user && user.membership_type != 'normal' && !sidebarCollapsed && (
        <div className="p-2">
          <div className="flex items-center px-3 py-2 gap-2 text-sm bg-sidebar-accent/40 rounded-md">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-ripple-brand-text">
                {membershipLabels[user.membership_type] || user.membership_type}
              </Badge>
            </div>
            {user.membership_expires_at && (
              <>
                <div className="text-xs">
                  还剩{' '}
                  {Math.max(
                    0,
                    Math.ceil(
                      (user.membership_expires_at * 1000 - Date.now()) /
                        (1000 * 60 * 60 * 24),
                    ),
                  )}{' '}
                  天到期
                </div>
                {/*<Button*/}
                {/*  variant="outline"*/}
                {/*  size="sm"*/}
                {/*  className="w-fit text-xs px-2 bg-sidebar-accent text-ripple-brand-text hover:text-ripple-brand-text"*/}
                {/*>*/}
                {/*  升级*/}
                {/*</Button>*/}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AppSidebar
