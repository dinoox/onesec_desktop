import React from 'react'
import { Label } from '@radix-ui/react-label'
import { Input } from '@/components/ui/input.tsx'
import useAuthStore from '@/store/authStore'
import { Button } from '@/components/ui/button.tsx'

const ContestPage: React.FC = () => {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="max-w-9/12">
      <div className="mb-3 flex flex-col justify-between self-start space-y-2 gap-x-4">
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
      <Button type="button" variant="secondary">
        退出登录
      </Button>
    </div>
  )
}

export default ContestPage
