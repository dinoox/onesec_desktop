import React, { useEffect, useState } from 'react'
import useAuthStore from '@/store/auth-store.ts'
import { Navigate } from 'react-router'
import { LoginForm } from '@/components/app/login-form.tsx'
import DotGrid from '@/components/DotGrid.tsx'
import ipcService from '@/services/ipc-service.ts'

const LoginPage: React.FC = () => {
  const isAuthed = useAuthStore((s) => s.isAuthed)
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null)
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark'),
  )

  useEffect(() => {
    ipcService.isFirstLaunch().then(setIsFirstLaunch)
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    return () => observer.disconnect()
  }, [])

  if (isAuthed) {
    return <Navigate to="/" replace />
  }

  if (isFirstLaunch === null) return null

  return (
    <div className="bg-background relative flex min-h-svh w-full items-center justify-center p-6">
      <div className="absolute top-0 left-0 w-full h-full">
        <DotGrid
          dotSize={5}
          gap={15}
          baseColor={isDark ? '#271E37' : '#fafafa'}
          activeColor="var(--ripple-brand)"
          proximity={120}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
        />
      </div>

      {/* 内容层 */}
      <div className="fixed top-0 left-0 right-0 h-[60px] app-drag-region z-10"></div>
      <div className="relative z-99 flex justify-center">
        <LoginForm defaultRegister={isFirstLaunch} />
      </div>
    </div>
  )
}

export default LoginPage
