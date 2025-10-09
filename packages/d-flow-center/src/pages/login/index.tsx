import React from 'react'
import useAuthStore from '@/store/auth-store.ts'
import { Navigate } from 'react-router'
import { LoginForm } from '@/components/app/login-form.tsx'

const LoginPage: React.FC = () => {
  const isAuthed = useAuthStore((s) => s.isAuthed)
  if (isAuthed) {
    return <Navigate to="/" replace />
  }

  return (
    <div
      className="flex min-h-svh w-full items-center justify-center p-6"
      style={{
        backgroundImage: `
      linear-gradient(rgba(108,117,125,0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(108,117,125,0.06) 1px, transparent 1px)
    `,
        backgroundSize: '40px 40px',
      }}
    >
      <div className="w-full flex justify-center">
        <LoginForm />
      </div>
    </div>
  )
}

export default LoginPage
