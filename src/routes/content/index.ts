import { lazy } from 'react'
import type { RouteObject } from 'react-router'

const ContentPage = lazy(() => import('@/pages/content'))
const HotWordsPage = lazy(() => import('@/pages/content/hot-words.tsx'))
const ShortcutKeysPage = lazy(() => import('@/pages/content/shortcut-keys'))
const InviteRewardPage = lazy(() => import('@/pages/content/invite-reward'))
const HistoryPage = lazy(() => import('@/pages/content/history'))
const SettingsPage = lazy(() => import('@/pages/content/settings'))
const PersonaPage = lazy(() => import('@/pages/content/persona'))

export const ContentRoutes: RouteObject[] = [
  { path: 'content', Component: ContentPage },
  {
    path: '/content/hot-words',
    Component: HotWordsPage,
  },
  {
    path: '/content/shortcut-keys',
    Component: ShortcutKeysPage,
  },
  {
    path: '/content/invite-reward',
    Component: InviteRewardPage,
  },
  {
    path: '/content/history',
    Component: HistoryPage,
  },
  {
    path: '/content/settings',
    Component: SettingsPage,
  },
  {
    path: '/content/persona',
    Component: PersonaPage,
  },
]
