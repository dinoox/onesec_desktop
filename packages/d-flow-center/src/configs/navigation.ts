import { LucideHome, PuzzleIcon, LucideShell, UserIcon, type LucideIcon } from 'lucide-react'

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
    title: '常用词',
    url: '/content/common-words',
    icon: PuzzleIcon,
  },
  {
    title: '快捷键设置',
    url: '/content/shortcut-keys',
    icon: LucideShell,
  },
  {
    title: '用户信息',
    url: '/content/settings',
    icon: UserIcon,
  },
]
