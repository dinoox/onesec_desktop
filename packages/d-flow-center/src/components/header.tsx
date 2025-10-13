import React from 'react'
import { useLocation } from 'react-router'
import { navMain } from '@/configs/navigation'

const Header: React.FC = () => {
  const location = useLocation()
  const currentTitle =
    navMain.find((item) => item.url === location.pathname)?.title || '首页'

  return (
    <header className="flex shrink-0 items-center py-0 justify-center border-b h-[55px] px-[1.15px]">
      <div className="flex items-center gap-4 app-no-drag">
        <div className="text-base">{currentTitle}</div>
      </div>
    </header>
  )
}

export default Header
