import React from 'react'
import { useLocation } from 'react-router'
import { navMain } from '@/configs/navigation'
import { Button } from '@/components/ui/button.tsx'

const Header: React.FC = () => {
  const location = useLocation()
  const currentTitle =
    navMain.find((item) => item.url === location.pathname)?.title || '首页'

  return (
    <header className="flex shrink-0 items-center justify-between py-0 border-b h-[55px] px-[1.15px]">
      <div className="w-20"></div>
      <div className="flex items-center gap-4 justify-center">
        <div className="text-base">{currentTitle}</div>
      </div>
      <div className="w-20 app-no-drag">
        {/*<Button className="rounded-full" variant="secondary" size="sm">简化UI</Button>*/}
      </div>
    </header>
  )
}

export default Header
