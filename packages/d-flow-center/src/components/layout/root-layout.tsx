import React from 'react'
import { Outlet } from 'react-router'
import TopLoadingBar from '@/components/top-loading-bar.tsx'
import { Toaster } from '@/components/ui/sonner.tsx'

const RootLayout: React.FC = () => {
  return (
    <>
      {/*<TopLoadingBar />*/}
      <Toaster position="top-center" richColors />
      <Outlet />
    </>
  )
}

export default RootLayout
