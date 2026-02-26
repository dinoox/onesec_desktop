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
    title: '首页',
    url: '/content',
    icon: LucideHome,
  },
  {
    title: '历史记录',
    url: '/content/history',
    icon: History,
  },
  {
    title: '常用词',
    url: '/content/hot-words',
    icon: BookA,
  },
]

export const settingsNav: NavItem = {
  title: '设置',
  url: '/content/settings',
  icon: Settings,
}
