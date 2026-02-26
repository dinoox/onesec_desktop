import React, { useEffect, useState } from 'react'
import useAuthStore from '@/store/auth-store.ts'
import { Navigate } from 'react-router'
import ipcService from '@/services/ipc-service.ts'
import logoImg from '@/assets/images/logo.png'

const LOGIN_SERVER_URL = import.meta.env.VITE_LOGIN_SERVER_URL

const LoginPage: React.FC = () => {
  const isAuthed = useAuthStore((s) => s.isAuthed)
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null)

  useEffect(() => {
    ipcService.isFirstLaunch().then(setIsFirstLaunch)
  }, [])

  if (isAuthed) {
    return <Navigate to={isFirstLaunch ? '/onboarding' : '/'} replace />
  }

  if (isFirstLaunch === null) return null

  const handleLogin = async (provider: 'google' | 'email') => {
    const url = `${LOGIN_SERVER_URL}/login/${provider}`
    await ipcService.openExternalUrl(url)
  }

  const handleOpenExternalUrl = async (url: string) => {
    await ipcService.openExternalUrl(url)
  }

  return (
    <div className="relative flex min-h-svh w-full items-center justify-center p-6">
      <div className="fixed top-0 left-0 right-0 h-[60px] app-drag-region z-10" />

      <div className="flex flex-col items-center w-full max-w-[480px]">
        {/* Logo */}
        <img src={logoImg} alt="SaySo" className="h-12 mb-6" />

        {/* Title */}
        <h1 className="text-[30px] font-semibold mb-3">欢迎使用 SaySo</h1>

        {/* Subtitle */}
        <p className="text-[#ff9818] mb-10">限时注册：免费获得 30 天试用专业会员资格！</p>

        {/* Google Button */}
        <button
          onClick={() => handleLogin('google')}
          className="w-full h-[60px] rounded-full bg-[#2a2a2a] dark:bg-[#333] text-white text-[16px] font-medium flex items-center justify-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          使用 Google 邮箱继续
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 w-full my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-sm text-muted-foreground">或</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Email Button */}
        <button
          onClick={() => handleLogin('email')}
          className="w-full h-[60px] rounded-full border border-border bg-transparent text-foreground text-[16px] font-medium flex items-center justify-center gap-3 cursor-pointer hover:bg-accent transition-colors"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
          使用其他邮箱继续
        </button>

        {/* Terms */}
        <p className="text-sm text-muted-foreground mt-8">
          登录即表示您同意我们的
          <button
            type="button"
            onClick={() => handleOpenExternalUrl('https://www.sayso.ai/terms-of-service')}
            className="underline underline-offset-4 mx-1 hover:text-primary cursor-pointer bg-transparent border-none p-0 text-foreground"
          >
            服务条款
          </button>
          和
          <button
            type="button"
            onClick={() => handleOpenExternalUrl('https://www.sayso.ai/privacy-policy')}
            className="underline underline-offset-4 mx-1 hover:text-primary cursor-pointer bg-transparent border-none p-0 text-foreground"
          >
            隐私政策
          </button>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
