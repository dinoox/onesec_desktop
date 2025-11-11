import {
  LucideHome,
  PuzzleIcon,
  LucideShell,
  Settings,
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
    title: '常用词',
    url: '/content/hot-words',
    icon: PuzzleIcon,
  },
  {
    title: '快捷键',
    url: '/content/shortcut-keys',
    icon: LucideShell,
  },
  {
    title: '设置',
    url: '/content/settings',
    icon: Settings,
  },
]
