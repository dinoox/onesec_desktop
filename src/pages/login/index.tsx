import React, { useCallback, useEffect, useRef, useState } from 'react'
import useAuthStore from '@/store/auth-store.ts'
import { Navigate } from 'react-router'
import ipcService from '@/services/ipc-service.ts'
import logoImg from '@/assets/images/logo.png'
import loginGuideImg from '@/assets/images/login-guide.png'
import { isCN, regionConfig } from '@/configs/region'
import { phoneLogin, sendCode } from '@/services/api/auth-api'
import { toast } from 'sonner'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button.tsx'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'

const LOGIN_SERVER_URL = import.meta.env.VITE_LOGIN_SERVER_URL

const LoginPage: React.FC = () => {
  const isAuthed = useAuthStore((s) => s.isAuthed)
  const { setAuthed } = useAuthStore((s) => s.actions)
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null)

  useEffect(() => {
    ipcService.isFirstLaunch().then(setIsFirstLaunch)
  }, [])

  if (isAuthed) {
    return <Navigate to={isFirstLaunch ? '/onboarding' : '/'} replace />
  }

  if (isFirstLaunch === null) return null

  return (
    <div className="relative flex min-h-svh w-full bg-white">
      <div className="fixed top-0 left-0 right-0 h-[60px] app-drag-region z-10" />
      {isCN ? <CNLoginForm /> : <GlobalLoginForm />}
    </div>
  )
}

/* ─── 国内手机号登录 ─── */
const CNLoginForm: React.FC = () => {
  const { setAuthed } = useAuthStore((s) => s.actions)
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showAgreement, setShowAgreement] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined)

  useEffect(() => () => clearInterval(timerRef.current), [])

  const startCountdown = useCallback(() => {
    setCountdown(60)
    timerRef.current = setInterval(() => {
      setCountdown((v) => {
        if (v <= 1) {
          clearInterval(timerRef.current)
          return 0
        }
        return v - 1
      })
    }, 1000)
  }, [])

  const handleSendCode = async () => {
    if (!phone.trim()) {
      toast.error('请输入手机号')
      return
    }
    try {
      const res = await sendCode(phone.trim())
      if (res.code === 200) {
        toast.success('验证码已发送')
        startCountdown()
      } else {
        toast.error(res.message || '发送失败')
      }
    } catch {
      toast.error('发送失败，请稍后重试')
    }
  }

  const doLogin = async () => {
    setLoading(true)
    try {
      const res = await phoneLogin(phone.trim(), code.trim())
      if (res.code === 200 && res.result) {
        const { user, ...loginData } = res.result
        await setAuthed(user, loginData)
      } else {
        toast.error(res.message || '登录失败')
      }
    } catch {
      toast.error('登录失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!agreed) {
      setShowAgreement(true)
      return
    }
    await doLogin()
  }

  const handleAgree = async () => {
    setAgreed(true)
    setShowAgreement(false)
    await doLogin()
  }

  const openUrl = (url: string) => ipcService.openExternalUrl(url)

  return (
    <div className="flex w-full min-h-svh">
      {/* 左侧图片 */}
      <div className="hidden md:flex w-1/2 items-center justify-center p-4 pt-9">
        <img
          src={loginGuideImg}
          alt="SaySo"
          className="max-w-full h-full object-cover"
          style={{ borderRadius: '16px' }}
        />
      </div>

      {/* 右侧表单 */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[312px] flex flex-col">
          <h1 className="text-[22px] font-semibold mb-2 flex items-center justify-center gap-1.5">
            欢迎登入
            <img src={logoImg} alt="SaySo" className="h-[25px] mt-1.5" />
          </h1>
          <p className="text-muted-foreground text-[12.6px] mb-10 text-center">
            登录以体验更多功能
          </p>

          {/* 手机号 */}
          <Field className="mb-5 gap-1.5 ">
            <FieldLabel className="text-[13px]">手机号</FieldLabel>
            <InputGroup className="h-[41px] rounded-xl px-1.5 bg-[#F5F5F5]">
              <InputGroupAddon className="text-placeholder font-normal text-[13px]">
                +86
              </InputGroupAddon>
              <InputGroupInput
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="请输入手机号"
                className="placeholder:text-placeholder text-[13px]!"
                maxLength={11}
              />
            </InputGroup>
          </Field>

          {/* 验证码 */}
          <Field className="mb-6 gap-1.5">
            <FieldLabel className="text-[13px]">验证码</FieldLabel>
            <InputGroup className="h-[41px] rounded-xl pl-1.5 bg-[#F5F5F5]">
              <InputGroupInput
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="验证码"
                className="placeholder:text-placeholder text-[13px]!"
                maxLength={6}
              />
              <InputGroupAddon align="inline-end" className="pr-4">
                <button
                  type="button"
                  disabled={countdown > 0}
                  onClick={handleSendCode}
                  className="text-[13px] text-placeholder font-normal hover:text-foreground transition-colors cursor-pointer disabled:cursor-default disabled:hover:text-muted-foreground"
                >
                  {countdown > 0 ? `${countdown}s` : '获取验证码'}
                </button>
              </InputGroupAddon>
            </InputGroup>
          </Field>

          {/* 登录按钮 */}
          <Button
            onClick={handleLogin}
            disabled={loading || !phone.trim() || !code.trim()}
            className="w-full h-[42px] rounded-[14px] bg-[#1a1a1a] dark:bg-white dark:text-black text-white text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity"
          >
            {loading ? '登录中...' : '登录'}
          </Button>

          {/* 协议 */}
          <div className="flex items-start gap-2 mt-6 text-[11px] ">
            <Checkbox
              checked={agreed}
              onCheckedChange={(v) => setAgreed(v === true)}
              className="mt-0.5 shrink-0 cursor-pointer size-3 [&_svg]:size-2.5"
            />
            <p className=" text-[#B4B4B4]">
              您已阅读并同意
              <button
                type="button"
                onClick={() => openUrl(regionConfig.termsUrl)}
                className="text-foreground hover:text-primary cursor-pointer bg-transparent border-none p-0"
              >
                《用户协议》
              </button>
              和
              <button
                type="button"
                onClick={() => openUrl(regionConfig.privacyUrl)}
                className="text-foreground hover:text-primary cursor-pointer bg-transparent border-none p-0"
              >
                《隐私政策》
              </button>
              。如您手机号未注册，点击登录即视为您授权系统自动为您创建新账号。
            </p>
          </div>
        </div>
      </div>

      <Dialog open={showAgreement} onOpenChange={setShowAgreement}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>服务协议与隐私政策</DialogTitle>
            <DialogDescription>
              请阅读并同意
              <button
                type="button"
                onClick={() => openUrl(regionConfig.termsUrl)}
                className="text-foreground hover:text-primary cursor-pointer bg-transparent border-none p-0"
              >
                《用户协议》
              </button>
              和
              <button
                type="button"
                onClick={() => openUrl(regionConfig.privacyUrl)}
                className="text-foreground hover:text-primary cursor-pointer bg-transparent border-none p-0"
              >
                《隐私政策》
              </button>
              ，以继续使用我们的服务。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setShowAgreement(false)}>
                不同意
              </Button>
            </DialogClose>
            <Button type="submit" onClick={handleAgree}>
              同意
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ─── 国际版 OAuth 登录 ─── */
const GlobalLoginForm: React.FC = () => {
  const handleLogin = async (provider: 'google' | 'email') => {
    const url = `${LOGIN_SERVER_URL}/login/${provider}`
    await ipcService.openExternalUrl(url)
  }

  const openUrl = (url: string) => ipcService.openExternalUrl(url)

  return (
    <div className="flex w-full items-center justify-center p-6">
      <div className="flex flex-col items-center w-full max-w-[480px]">
        <img src={logoImg} alt="SaySo" className="h-12 mb-6" />
        <h1 className="text-[30px] font-semibold mb-3">欢迎使用 SaySo</h1>
        <p className="text-[#ff9818] mb-10">限时注册：免费获得 30 天试用专业会员资格！</p>

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

        <div className="flex items-center gap-4 w-full my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-sm text-muted-foreground">或</span>
          <div className="flex-1 h-px bg-border" />
        </div>

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

        <p className="text-sm text-muted-foreground mt-8">
          登录即表示您同意我们的
          <button
            type="button"
            onClick={() => openUrl(regionConfig.termsUrl)}
            className="underline underline-offset-4 mx-1 hover:text-primary cursor-pointer bg-transparent border-none p-0 text-foreground"
          >
            服务条款
          </button>
          和
          <button
            type="button"
            onClick={() => openUrl(regionConfig.privacyUrl)}
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
