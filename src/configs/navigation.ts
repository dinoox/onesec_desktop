import {
  LucideHome,
  LucideKeyboard,
  Settings,
  GiftIcon,
  History,
  BookA,
  Blend,
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
  {
    title: '快捷键',
    url: '/content/shortcut-keys',
    icon: LucideKeyboard,
  },
  {
    title: '输出模式',
    url: '/content/persona',
    icon: Blend,
  },
  {
    title: '邀请奖励',
    url: '/content/invite-reward',
    icon: GiftIcon,
  },
  {
    title: '设置',
    url: '/content/settings',
    icon: Settings,
  },
]
