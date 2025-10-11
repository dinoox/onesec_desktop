import { lazy } from 'react'
import { createHashRouter, redirect, type RouteObject } from 'react-router'
import RootLayout from '@/components/layout/root-layout'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { ContentRoutes } from '@/routes/content'

const DashboardPage = lazy(() => import('@/pages/dashboard'))
const NotFoundPage = lazy(() => import('@/pages/not-found'))
const LoginPage = lazy(() => import('@/pages/login'))
const ErrorBoundaryPage = lazy(() => import('@/pages/error-boundary'))

const router: RouteObject[] = [
  {
    Component: RootLayout,
    ErrorBoundary: ErrorBoundaryPage,
    children: [
      {
        Component: DashboardLayout,
        children: [
          {
            index: true,
            loader: () => redirect('/content'),
          },
          ...ContentRoutes,
        ],
      },
      { path: 'login', Component: LoginPage },
      { path: '*', Component: NotFoundPage },
    ],
  },
]

export default createHashRouter(router)
