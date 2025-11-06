import { lazy } from 'react'
import type { RouteObject } from 'react-router'

const ContentPage = lazy(() => import('@/pages/content'))
const HotWordsPage = lazy(() => import('@/pages/content/hot-words.tsx'))
const ShortcutKeysPage = lazy(() => import('@/pages/content/shortcut-keys'))
const SettingsPage = lazy(() => import('@/pages/content/settings'))

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
    path: '/content/settings',
    Component: SettingsPage,
  },
]
