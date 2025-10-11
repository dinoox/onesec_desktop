import { ChevronRight } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { Link, matchPath, useLocation } from 'react-router'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'
import { type NavItem } from '@/configs/navigation'

function checkIsActive(href: string, item: NavItem, mainNav = false) {
  if (matchPath({ path: item.url, end: true }, href)) return true
  if (item.subUrls) {
    for (let i in item.subUrls) {
      if (matchPath({ path: item.subUrls[i], end: true }, href)) return true
    }
  }
  return (
    !!item?.children?.filter((i) => i.url === href).length || // if child nav is active
    (mainNav &&
      href.split('/')[1] !== '' &&
      href.split('/')[1] === item?.url?.split('/')[1])
  )
}

const SidebarMenuLink = ({ item, href }: { item: NavItem; href: string }) => {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={item.title}
        asChild
        isActive={checkIsActive(href, item)}
      >
        <Link to={item.url}>
          {item.icon && <item.icon />}
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

const SidebarMenuCollapsible = ({ item, href }: { item: NavItem; href: string }) => {
  return (
    <Collapsible
      asChild
      defaultOpen={checkIsActive(href, item, true)}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.title}>
            {item.icon && <item.icon />}
            <span>{item.title}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.children?.map((subItem) => (
              <SidebarMenuSubItem key={subItem.title}>
                <SidebarMenuSubButton
                  asChild
                  isActive={checkIsActive(href, subItem, false)}
                >
                  <Link to={subItem.url}>
                    {subItem.icon && <subItem.icon />}
                    <span>{subItem.title}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

const SidebarMenuDropdown = ({ item, href }: { item: NavItem; href: string }) => {
  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton tooltip={item.title} isActive={checkIsActive(href, item)}>
            {item.icon && <item.icon />}
            <span>{item.title}</span>
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" sideOffset={4}>
          <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {item.children!.map((sub) => (
            <DropdownMenuItem key={`${sub.title}-${sub.url}`} asChild>
              <Link
                to={sub.url}
                className={`${checkIsActive(href, sub) && 'bg-primary-foreground'}`}
              >
                {sub.icon && <sub.icon />}
                <span className="max-w-52 text-wrap">{sub.title}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
}

export function NavMain({ items }: { items: NavItem[] }) {
  const { state } = useSidebar()
  const location = useLocation()
  const { pathname } = location

  return (
    <SidebarGroup>
      {/*<SidebarGroupLabel>平台</SidebarGroupLabel>*/}
      <SidebarMenu>
        {items.map((item) => {
          const key = `${item.title}-${item.url}`
          if (!item.children)
            return <SidebarMenuLink key={key} item={item} href={pathname} />
          return state === 'collapsed' ? (
            <SidebarMenuDropdown key={key} item={item} href={pathname} />
          ) : (
            <SidebarMenuCollapsible key={key} item={item} href={pathname} />
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
