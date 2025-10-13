import React from 'react'
import { Link, useLocation, matchPath } from 'react-router'
import { navMain, type NavItem } from '@/configs/navigation'
import { Badge } from '@/components/ui/badge'
import { Home } from 'iconsax-reactjs'

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

  return (
    <div className="w-64 border-r bg-sidebar flex flex-col flex-none overflow-y-auto">
      {/* Sidebar Header */}
      <div className="p-3 pt-5">
        <div className="flex items-center gap-2 px-2 py-2">
          <span className="font-semibold">秒言</span>
          <Badge
            variant="outline"
            className="border-black text-black text-[10px] rounded-xl bg-[#fc0]"
          >
            试用版
          </Badge>
        </div>
      </div>

      {/* Sidebar Content */}
      <nav className="flex-1 px-2">
        {navMain.map((item) => {
          const isActive = checkIsActive(pathname, item)
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
                  className={`w-4 h-4 ${isActive && 'text-ripple-green flash-icon'}`}
                />
              )}
              <span className={`text-sm ${isActive && 'text-ripple-green'}`}>
                {item.title}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export default AppSidebar
