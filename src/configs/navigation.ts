import {
  LucideHome,
  Settings,
  History,
  BookA,
  type LucideIcon,
} from 'lucide-react'

export type NavItem = {
  title: string
  url: string
  icon?: LucideIcon
  subUrls?: string[]
  children?: NavItem[]
}

export const navMain: NavItem[] = [
  {
    title: 'nav.home',
    url: '/content',
    icon: LucideHome,
  },
  {
    title: 'nav.history',
    url: '/content/history',
    icon: History,
  },
  {
    title: 'nav.hotWords',
    url: '/content/hot-words',
    icon: BookA,
  },
]

export const settingsNav: NavItem = {
  title: 'nav.settings',
  url: '/content/settings',
  icon: Settings,
}
