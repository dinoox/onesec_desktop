import React from 'react'
import { SidebarTrigger } from './ui/sidebar'
import { Separator } from './ui/separator'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import { useLocation } from 'react-router'
import { navMain } from '@/configs/navigation'

const Header: React.FC = () => {
  const location = useLocation()
  const currentTitle =
    navMain.find((item) => item.url === location.pathname)?.title || '首页'

  return (
    <header className="flex h-16 shrink-0 items-center p-4 justify-between gap-2 transition-[width,height] ease-linear">
      <div className="flex items-center gap-4 app-no-drag">
        {/*<SidebarTrigger variant="outline" className="cursor-pointer" />*/}
        {/*<Separator orientation="vertical" className="data-[orientation=vertical]:h-6" />*/}
        <div className="text-sm font-medium">{currentTitle}</div>
      </div>
      <div className="flex items-center gap-4 app-no-drag">
        {/*<Button*/}
        {/*  variant="ghost"*/}
        {/*  size="icon"*/}
        {/*  className="relative size-7 cursor-pointer rounded-full"*/}
        {/*>*/}
        {/*  <Bell />*/}
        {/*  <span className="absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-500 flex">*/}
        {/*    <span className="absolute inline-flex w-full h-full bg-orange-500 rounded-full opacity-75 animate-ping"></span>*/}
        {/*  </span>*/}
        {/*</Button>*/}
      </div>
    </header>
  )
}

export default Header
