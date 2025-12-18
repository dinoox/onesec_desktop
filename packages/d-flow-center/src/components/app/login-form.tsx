import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  useLoginQuery,
  useRegisterQuery,
  useVerificationCodeQuery,
} from '@/services/queries/auth-query.ts'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import LogoIcon from '@/components/icons/app-logo'
import { Separator } from '@/components/ui/separator'
import { LoginFormSchema } from '@/types/zods.ts'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useState, useEffect } from 'react'
import { Spinner } from '@/components/ui/spinner.tsx'
import IPCService from '@/services/ipc-service.ts'

export function LoginForm({
  defaultRegister = false,
}: {
  className?: string
  defaultRegister?: boolean
}) {
  const [isRegisterMode, setIsRegisterMode] = useState(defaultRegister)
  const [countdown, setCountdown] = useState(0)

  const form = useForm<z.infer<typeof LoginFormSchema>>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      phone: '',
      verification_code: '',
      share_code: '',
    },
  })

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const loginMutation = useLoginQuery()
  const registerMutation = useRegisterQuery()
  const mutation = isRegisterMode ? registerMutation : loginMutation

  async function onSubmit(data: z.infer<typeof LoginFormSchema>) {
    const params = isRegisterMode
      ? {
          phone: data.phone,
          code: data.verification_code,
          ...(data.share_code && { share_code: data.share_code }),
        }
      : { phone: data.phone, code: data.verification_code }
    await mutation.mutateAsync(params)
  }

  const codeMutation = useVerificationCodeQuery()
  async function onRequestCode() {
    form.clearErrors()

    const phone = form.getValues('phone')
    if (!phone) {
      form.setError('phone', { message: '请先输入手机号' })
      return
    }

    try {
      await codeMutation.mutateAsync(phone)
      setCountdown(60)
    } catch (error) {
      console.error('获取验证码失败:', error)
    }
  }

  const handleOpenExternalUrl = async (url: string) => {
    try {
      await IPCService.openExternalUrl(url)
    } catch (error) {
      console.error('Failed to open external URL:', error)
    }
  }

  return (
    <div className="w-[350px] bg-background border border-border/60 backdrop-blur rounded-2xl">
      <div className="flex flex-col items-center p-5 mb-2">
        <LogoIcon />
        <h2 className="text-xl font-semibold">秒言</h2>
        <p className="text-base text-muted-foreground">从说到做，只需一秒</p>
      </div>
      <div className="p-6 pt-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid w-full items-center gap-5">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="gap-0.5">手机号</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="请输入手机号"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e)
                          form.clearErrors()
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="verification_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="gap-0.5">验证码</FormLabel>
                    <FormControl>
                      <div className="flex w-full justify-between gap-2">
                        <Input
                          type="text"
                          placeholder="请输入验证码"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e)
                            form.clearErrors()
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={onRequestCode}
                          disabled={codeMutation.isPending || countdown > 0}
                          className={`${countdown > 0 ? 'w-[146px]' : ''} h-9`}
                        >
                          {codeMutation.isPending ? (
                            <Spinner />
                          ) : countdown > 0 ? (
                            <>获取验证码({countdown}秒)</>
                          ) : (
                            '获取验证码'
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {isRegisterMode && (
                <FormField
                  control={form.control}
                  name="share_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="gap-0.5">邀请码</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="选择输入邀请码"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e)
                            form.clearErrors()
                          }}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        &nbsp;填入邀请码，双方各获得 10 积分
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? <Spinner /> : null}
                {mutation.isPending
                  ? isRegisterMode
                    ? '注册中'
                    : '登录中'
                  : isRegisterMode
                    ? '注 册'
                    : '登 录'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
      <div className="flex flex-col gap-4 p-6 pt-0">
        <p className="text-xs text-center text-muted-foreground">
          {isRegisterMode ? '注册' : '登录'}即表示您同意我们的
          <button
            type="button"
            onClick={() => handleOpenExternalUrl('https://www.miaoyan.cn/terms.html')}
            className="underline underline-offset-4 mx-1 hover:text-primary cursor-pointer bg-transparent border-none p-0 text-inherit"
          >
            服务条款
          </button>
          和
          <button
            type="button"
            onClick={() => handleOpenExternalUrl('https://www.miaoyan.cn/privacy.html')}
            className="underline underline-offset-4 mx-1 hover:text-primary cursor-pointer bg-transparent border-none p-0 text-inherit"
          >
            隐私政策
          </button>
        </p>
        <Separator />
        <p className="text-xs text-center">
          <span className="text-muted-foreground">
            {isRegisterMode ? '已有账号？' : '没有账号？'}
          </span>
          <Button
            type="button"
            variant="link"
            className="text-xs p-0 ml-1 font-normal"
            disabled={mutation.isPending}
            onClick={() => setIsRegisterMode(!isRegisterMode)}
          >
            {isRegisterMode ? '立即登录' : '现在就注册'}
          </Button>
        </p>
      </div>
    </div>
  )
}
