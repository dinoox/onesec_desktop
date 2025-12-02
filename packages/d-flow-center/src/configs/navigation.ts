import {
  LucideHome,
  PuzzleIcon,
  LucideShell,
  Settings,
  GiftIcon,
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
    title: '邀请返利',
    url: '/content/invite-reward',
    icon: GiftIcon,
  },
  {
    title: '设置',
    url: '/content/settings',
    icon: Settings,
  },
]
