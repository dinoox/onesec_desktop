import React, { useState } from 'react'
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
} from '@/components/ui/pure-select.tsx'
import { useTheme } from '@/components/theme-provider.tsx'
import useUserConfigStore, { useUserConfigActions } from '@/store/user-config-store.ts'
import ipcService from '@/services/ipc-service.ts'
import { uploadErrorLog } from '@/services/api/error-log-api.ts'
import { toast } from 'sonner'

const ContentPage: React.FC = () => {
  const user = useAuthStore((state) => state.user)
  const mutation = useLogoutQuery()
  const { theme, setTheme } = useTheme()
  const showComparison = useUserConfigStore((state) => state.showComparison)
  const hideStatusPanel = useUserConfigStore((state) => state.hideStatusPanel)
  const { setShowComparison, setHideStatusPanel } = useUserConfigActions()
  const [uploadingLog, setUploadingLog] = useState(false)

  async function logout() {
    await mutation.mutateAsync()
  }

  async function handleUploadLog() {
    setUploadingLog(true)
    try {
      const res = await uploadErrorLog(await ipcService.readErrorLog())
      if (res.success) {
        toast.success('日志上传成功')
      } else {
        toast.error(res.message || '上传失败')
      }
    } catch (e) {
      toast.error('上传失败')
    } finally {
      setUploadingLog(false)
    }
  }

  return (
    <div className="max-w-1/2 space-y-3 mt-1">
      <div className="absolute right-4 top-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleUploadLog}
          disabled={uploadingLog}
        >
          {uploadingLog ? <Spinner /> : null}
          上传日志
        </Button>
      </div>

      <div className=" flex flex-col justify-between self-start space-y-2 gap-x-4">
        <div className="text-[15px]">基础设置</div>
        <div className="flex items-center justify-between w-full bg-setting rounded-xl px-3 py-3">
          <Label htmlFor="picture">邮箱</Label>
          <Input
            className="w-fit h-[21px] border-none bg-transparent! p-0"
            disabled
            type="email"
            placeholder="Email"
            value={user?.email || '未设置'}
          />
        </div>

        <div className="flex items-center justify-between w-full bg-setting rounded-xl p-3">
          <Label htmlFor="picture">主题</Label>
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger>
              <SelectValue placeholder="选择主题" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">浅色</SelectItem>
              <SelectItem value="dark">深色</SelectItem>
              <SelectItem value="system">跟随系统</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between w-full bg-setting rounded-xl p-3">
          <div className="flex flex-col space-y-1">
            <Label htmlFor="hide-floating-panel">始终显示悬浮图标</Label>
            <span className="text-muted-foreground">
              关闭后，悬浮图标只会在录音时显示
            </span>
          </div>
          <Select
            value={hideStatusPanel ? 'disabled' : 'enabled'}
            onValueChange={(value) => setHideStatusPanel(value !== 'enabled')}
          >
            <SelectTrigger className="py-4">
              <SelectValue placeholder="选择模式" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="enabled">开启</SelectItem>
              <SelectItem value="disabled">关闭</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="my-6 flex flex-col justify-between self-start space-y-2 gap-x-4">
        <div className="text-[15px]">模式设置</div>
        <div className="flex items-center justify-between w-full bg-setting rounded-xl p-3">
          <div className="flex flex-col space-y-1">
            <Label htmlFor="mode">显示原文</Label>
            <span className="text-muted-foreground">翻译时显示语音原文</span>
          </div>
          <Select
            value={showComparison ? 'appear' : 'not_appear'}
            onValueChange={(value) => setShowComparison(value === 'appear')}
          >
            <SelectTrigger className="py-4">
              <SelectValue placeholder="选择模式" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="appear">开启</SelectItem>
              <SelectItem value="not_appear">关闭</SelectItem>
            </SelectContent>
          </Select>
        </div>

      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={logout}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? <Spinner /> : null}
          退出登录
        </Button>
      </div>
    </div>
  )
}

export default ContentPage
