import React from 'react'
import { useLocation } from 'react-router'
import { navMain } from '@/configs/navigation'
import { Button } from '@/components/ui/button.tsx'
import useUIStore, { useUIActions } from '@/store/ui-store'

const Header: React.FC = () => {
  const location = useLocation()
  const currentTitle =
    navMain.find((item) => item.url === location.pathname)?.title || '首页'

  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed)

  return (
    <header className="flex shrink-0 items-center justify-between py-0 border-b h-[55px] px-[1.15px]">
      <div className="w-22"></div>
      <div className="flex items-center gap-4 justify-center">
        <div className="text-base">{currentTitle}</div>
      </div>
      <div className="w-22 app-no-drag">
        {/*<Button*/}
        {/*  className="rounded-full mx-[1.15px] font-normal text-sm opacity-70"*/}
        {/*  variant="secondary"*/}
        {/*  size="sm"*/}
        {/*  onClick={useUIActions().toggleSidebar}*/}
        {/*>*/}
        {/*  {sidebarCollapsed ? '完整界面' : '简洁界面'}*/}
        {/*</Button>*/}
      </div>
    </header>
  )
}

export default Header
