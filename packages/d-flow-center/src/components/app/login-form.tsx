import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLoginQuery } from '@/services/queries/authQuery.ts'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import LogoIcon from '@/components/icons/app-logo'
import { LoginFormSchema } from '@/types/zods.ts'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

export function LoginForm({}: { className?: string }) {
  const form = useForm<z.infer<typeof LoginFormSchema>>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      phone: '',
      verification_code: '',
    },
  })

  const mutation = useLoginQuery()
  async function onSubmit(data: z.infer<typeof LoginFormSchema>) {
    await mutation.mutateAsync(data)
  }

  return (
    <Card className="w-[350px]">
      <CardHeader className="flex flex-col items-center p-3">
        <LogoIcon />
        <CardTitle className="text-xl">秒言</CardTitle>
        <CardDescription className="text-base">从说到做，只需一秒</CardDescription>
      </CardHeader>
      <CardContent>
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
                      <Input placeholder="请输入手机号" {...field} />
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
                        <Input type="password" placeholder="请输入验证码" {...field} />
                        <Button type="submit" variant="outline">
                          获取验证码
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? '登录中···' : '登 录'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <p className="text-xs text-center text-muted-foreground">
          登录即表示您同意我们的
          <a href="#" className="underline underline-offset-4 hover:text-primary">
            服务条款
          </a>
          和
          <a href="#" className="underline underline-offset-4 hover:text-primary">
            隐私政策
          </a>
        </p>
      </CardFooter>
    </Card>
  )
}
