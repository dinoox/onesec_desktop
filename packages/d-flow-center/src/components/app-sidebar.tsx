import React from 'react'
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from './ui/sidebar'
import AppLogo from './icons/app-logo'
import { NavMain } from './nav-main'
import { navMain } from '@/configs/navigation'
import { Badge } from '@/components/ui/badge'

const AppSidebar: React.FC = () => {
  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="pt-10">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <a
                href="/"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                {/*<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary">*/}
                {/*  <AppLogo />*/}
                {/*</div>*/}
                <div className="flex items-center gap-2">
                  <span className="truncate font-semibold">秒言</span>
                  <Badge
                    variant="outline"
                    className="border-black text-black text-[10px] rounded-xl bg-[#fc0]"
                  >
                    试用版
                  </Badge>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
    </Sidebar>
  )
}

export default AppSidebar
