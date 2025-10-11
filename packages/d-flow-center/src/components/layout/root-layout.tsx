import React from 'react'
import { Outlet } from 'react-router'
import TopLoadingBar from '@/components/top-loading-bar.tsx'
import { Toaster } from '@/components/ui/sonner.tsx'
import AuthOverlay from '@/components/auth-overlay.tsx'

const RootLayout: React.FC = () => {
  return (
    <>
      {/*<TopLoadingBar />*/}
      <Toaster position="top-center" richColors />
      <Outlet />
      <AuthOverlay />
    </>
  )
}

export default RootLayout
