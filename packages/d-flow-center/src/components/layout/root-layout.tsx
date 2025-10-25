import React, { Suspense } from 'react'
import { Outlet } from 'react-router'
import TopLoadingBar from '@/components/top-loading-bar.tsx'
import { Toaster } from '@/components/ui/sonner.tsx'
import AuthOverlay from '@/components/auth-overlay.tsx'
import PageLoading from '@/components/page-loading.tsx'

const RootLayout: React.FC = () => {
  return (
    <>
      {/*<TopLoadingBar />*/}
      <Toaster position="top-center" richColors />
      <Suspense fallback={<PageLoading />}>
        <Outlet />
      </Suspense>
      <AuthOverlay />
    </>
  )
}

export default RootLayout
