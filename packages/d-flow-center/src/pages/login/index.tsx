import React from 'react'
import useAuthStore from '@/store/auth-store.ts'
import { Navigate } from 'react-router'
import { LoginForm } from '@/components/app/login-form.tsx'
import DotGrid from '@/components/DotGrid.tsx'

const LoginPage: React.FC = () => {
  const isAuthed = useAuthStore((s) => s.isAuthed)
  if (isAuthed) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="dark bg-background relative flex min-h-svh w-full items-center justify-center p-6">
      <div className="absolute top-0 left-0 w-full h-full">
        <DotGrid
          dotSize={5}
          gap={15}
          baseColor="#271E37"
          // activeColor="#5227FF"
          activeColor="#ffcc00"
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
        <LoginForm />
      </div>
    </div>
  )
}

export default LoginPage
