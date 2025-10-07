import { lazy } from 'react'
import type { RouteObject } from 'react-router'

const ContentPage = lazy(() => import('@/pages/content'))
const CommonWordsPage = lazy(() => import('@/pages/content/common-words'))
const ShortcutKeysPage = lazy(() => import('@/pages/content/shortcut-keys'))
const SettingsPage = lazy(() => import('@/pages/content/settings'))

export const ContentRoutes: RouteObject[] = [
  { path: 'content', Component: ContentPage },
  {
    path: '/content/common-words',
    Component: CommonWordsPage,
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
