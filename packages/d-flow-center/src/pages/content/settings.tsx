import React from 'react'
import { Label } from '@radix-ui/react-label'
import { Input } from '@/components/ui/input.tsx'
import useAuthStore from '@/store/auth-store.ts'
import { Button } from '@/components/ui/button.tsx'
import { useLogoutQuery } from '@/services/queries/auth-query.ts'
import { Spinner } from '@/components/ui/spinner.tsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx'
import { useTheme } from '@/components/theme-provider.tsx'

const ContestPage: React.FC = () => {
  const user = useAuthStore((state) => state.user)
  const mutation = useLogoutQuery()
  const { theme, setTheme } = useTheme()

  async function logout() {
    await mutation.mutateAsync()
  }

  return (
    <div className="max-w-1/2">
      <div className="mb-6 flex flex-col justify-between self-start space-y-2 gap-x-4">
        <span className="text-sm text-muted-foreground mb-4">查看您的账户信息</span>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="picture">手机号</Label>
          <Input
            disabled
            type="email"
            placeholder="Email"
            value={user?.phone ? user.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '未设置'}
          />
        </div>
      </div>

      <div className="mb-6 flex flex-col justify-between self-start space-y-2 gap-x-4">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="theme">主题</Label>
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="选择主题" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">浅色</SelectItem>
              <SelectItem value="dark">深色</SelectItem>
              <SelectItem value="system">跟随系统</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="button" variant="secondary" onClick={logout} disabled={mutation.isPending}>
        {mutation.isPending ? <Spinner /> : null}
        退出登录
      </Button>
    </div>
  )
}

export default ContestPage
