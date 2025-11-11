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
} from '@/components/ui/select.tsx'
import { useTheme } from '@/components/theme-provider.tsx'
import useUserConfigStore, { useUserConfigActions } from '@/store/user-config-store.ts'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog.tsx'
import { Plus, TrashIcon } from 'lucide-react'
import { SystemFamily } from '../../../main/types/config.ts'
import { useUpdateUserInfo } from '@/services/queries/user-query.ts'
import {
  useListTerminals,
  useBindTerminal,
  useDeleteTerminal,
} from '@/services/queries/terminal-query.ts'

const ContestPage: React.FC = () => {
  const user = useAuthStore((state) => state.user)
  const mutation = useLogoutQuery()
  const updateUserMutation = useUpdateUserInfo()
  const { theme, setTheme } = useTheme()
  const showComparison = useUserConfigStore((state) => state.showComparison)
  const { setShowComparison } = useUserConfigActions()

  const { data: terminalsData } = useListTerminals()
  const bindTerminalMutation = useBindTerminal()
  const deleteTerminalMutation = useDeleteTerminal()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [newHostname, setNewHostname] = useState('')
  const [newSystemFamily, setNewSystemFamily] = useState<'debian' | 'red_hat'>('debian')

  async function logout() {
    await mutation.mutateAsync()
  }

  const handleSystemFamilyChange = async (value: string) => {
    let preferred_linux_distro: string | null = null
    
    if (value === SystemFamily.Debian || value === SystemFamily.RedHat) {
      preferred_linux_distro = value
    }
    
    await updateUserMutation.mutateAsync({ preferred_linux_distro })
  }

  const handleAddHostSystem = async () => {
    if (!newHostname.trim()) return

    await bindTerminalMutation.mutateAsync({
      endpoint_identifier: newHostname.trim(),
      linux_distro: newSystemFamily,
    })

    setNewHostname('')
    setNewSystemFamily('debian')
    setDialogOpen(false)
  }

  const handleRemoveHostSystem = async (bindingId: number) => {
    await deleteTerminalMutation.mutateAsync({ binding_id: bindingId })
  }

  return (
    <div className="max-w-1/2">
      <div className="mb-6 flex flex-col justify-between self-start space-y-2 gap-x-4">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="picture" className="font-medium">手机号</Label>
          <Input
            disabled
            type="email"
            placeholder="Email"
            value={
              user?.phone
                ? user.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
                : '未设置'
            }
          />
        </div>
      </div>

      <div className="mb-6 flex flex-col justify-between self-start space-y-2 gap-x-4">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="theme" className="font-medium">主题</Label>
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

      <div className="mb-6 flex flex-col justify-between self-start space-y-2 gap-x-4">
        <div className="flex flex-col">
          <div className="flex flex-col space-y-1 mb-1.5">
            <div className="font-medium">模式设置</div>
            <span className="text-muted-foreground">自动显示翻译前后对比结果</span>
          </div>

          <Select
            value={showComparison ? 'appear' : 'not_appear'}
            onValueChange={(value) => setShowComparison(value === 'appear')}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="选择模式" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="appear">自动显示</SelectItem>
              <SelectItem value="not_appear">不显示</SelectItem>
            </SelectContent>
          </Select>

          <span className="text-muted-foreground mt-4 mb-1.5">常用系统</span>
          <Select 
            value={user?.preferred_linux_distro || 'none'} 
            onValueChange={handleSystemFamilyChange}
            disabled={updateUserMutation.isPending}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="选择系统" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">未设置</SelectItem>
              <SelectItem value={SystemFamily.Debian}>Debian 系</SelectItem>
              <SelectItem value={SystemFamily.RedHat}>Red Hat 系</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-6 w-full max-w-2xl">
        <div className="rounded-lg border bg-card p-3">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className=" font-semibold">主机系统配置</h3>
                <p className="text-muted-foreground mt-1">管理不同主机的系统类型偏好</p>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4" />
                    添加主机
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>添加主机系统配置</DialogTitle>
                    <DialogDescription>为特定主机设置系统类型偏好</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="hostname" className="font-medium">主机名</Label>
                      <Input
                        id="hostname"
                        placeholder="例如: server-01"
                        value={newHostname}
                        onChange={(e) => setNewHostname(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddHostSystem()
                          }
                        }}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="system" className="font-medium">系统类型</Label>
                      <Select
                        value={newSystemFamily}
                        onValueChange={(value) => setNewSystemFamily(value as 'debian' | 'red_hat')}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择系统类型" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="debian">Debian 系</SelectItem>
                          <SelectItem value="red_hat">Red Hat 系</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setDialogOpen(false)
                        setNewHostname('')
                        setNewSystemFamily('debian')
                      }}
                    >
                      取消
                    </Button>
                    <Button 
                      onClick={handleAddHostSystem} 
                      disabled={!newHostname.trim() || bindTerminalMutation.isPending}
                    >
                      {bindTerminalMutation.isPending ? <Spinner /> : null}
                      添加
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div>
            {!terminalsData?.items || terminalsData.items.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p className="">暂无主机配置</p>
                <p className="text-xs mt-1">点击上方按钮添加主机系统配置</p>
              </div>
            ) : (
              <div className="space-y-2">
                {terminalsData.items.map((terminal) => (
                  <div
                    key={terminal.id}
                    className="flex items-center justify-between p-3 rounded-md border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{terminal.endpoint_identifier}</span>
                      <span className="text-sm text-muted-foreground">
                        {terminal.linux_distro === 'debian'
                          ? 'Debian 系'
                          : 'Red Hat 系'}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveHostSystem(terminal.id)}
                      disabled={deleteTerminalMutation.isPending}
                      className="hover:bg-destructive/10 hover:text-destructive"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

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
  )
}

export default ContestPage
