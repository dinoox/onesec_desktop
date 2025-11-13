import React, {useState} from 'react'
import {Button} from '@/components/ui/button.tsx'
import {Input} from '@/components/ui/input.tsx'
import {Label} from '@radix-ui/react-label'
import {MonitorCog, Plus, Trash2, X} from 'lucide-react'
import {NativeSelect, NativeSelectOption} from '@/components/ui/native-select.tsx'
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover.tsx'
import useUIStore, {useUIActions} from '@/store/ui-store.ts'
import {useBindTerminal, useDeleteTerminal, useListTerminals,} from '@/services/queries/terminal-query.ts'
import {Separator} from '@radix-ui/react-select'
import {AnimatePresence, motion} from 'framer-motion'
import {SystemFamily} from "@/types/terminal.ts";

export const AdvancedSettingsDialog: React.FC = () => {
  const advancedSettingsOpen = useUIStore((state) => state.advancedSettingsOpen)
  const { setAdvancedSettingsOpen } = useUIActions()

  const { data: terminalsData } = useListTerminals()
  const bindTerminalMutation = useBindTerminal()
  const deleteTerminalMutation = useDeleteTerminal()

  const [newHostname, setNewHostname] = useState('')
  const [newSystemFamily, setNewSystemFamily] = useState<SystemFamily>(SystemFamily.Debian)
  const [popoverOpen, setPopoverOpen] = useState(false)

  const handleAddHostSystem = async () => {
    if (!newHostname.trim()) return

    await bindTerminalMutation.mutateAsync({
      endpoint_identifier: newHostname.trim(),
      linux_distro: newSystemFamily,
    })

    setNewHostname('')
    setNewSystemFamily(SystemFamily.Debian)
    setPopoverOpen(false)
  }

  const handleRemoveHostSystem = async (bindingId: number) => {
    await deleteTerminalMutation.mutateAsync({ binding_id: bindingId })
  }

  return (
    <AnimatePresence>
      {advancedSettingsOpen && (
        <div className="fixed inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50"
            onClick={() => setAdvancedSettingsOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative bg-background rounded-lg border border-border shadow-lg w-full max-w-2xl h-[60vh] flex flex-col"
          >
            <div className="flex-none px-5 pt-4">
              <button
                onClick={() => setAdvancedSettingsOpen(false)}
                className="absolute top-5 right-5 opacity-50 hover:opacity-100 transition-opacity"
              >
                <X className="h-[18px] w-[18px]" />
              </button>

              <div className="mb-4">
                <span className="text-[17px] font-medium">主机</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-4">
              <div className="flex items-center justify-between w-full bg-setting rounded-xl p-3 px-4">
                <div className="flex items-center space-x-3">
                  <MonitorCog />
                  <div className="flex flex-col space-y-1">
                    <Label>主机配置</Label>
                    <span className="text-muted-foreground">
                      配置不同远程主机的系统类型偏好
                    </span>
                  </div>
                </div>

                <Popover open={popoverOpen} onOpenChange={setPopoverOpen} modal={false}>
                  <PopoverTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4" />
                      添加主机
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-66 z-[100]"
                    align="end"
                    onInteractOutside={(e) => {
                      // 如果点击的是 Select 下拉菜单，阻止 Popover 关闭
                      // e.preventDefault()
                      // console.log(e)
                      // const target = e.target as HTMLElement
                      // if (target.closest('[data-radix-popper-content-wrapper]') ||
                      //     target.closest('[data-slot="select-content"]')) {
                      //   e.preventDefault()
                      // }
                    }}
                  >
                    <div className="grid gap-3">
                      <div className="grid gap-2">
                        <Label htmlFor="hostname" className="font-medium">
                          主机名
                        </Label>
                        <Input
                          id="hostname"
                          placeholder="请输入 IP / hostname / 域名"
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
                        <Label htmlFor="system" className="font-medium">
                          系统类型
                        </Label>
                        <NativeSelect
                          id="system"
                          value={newSystemFamily}
                          onChange={(e) =>
                            setNewSystemFamily(e.target.value as SystemFamily)
                          }
                        >
                          <NativeSelectOption value="debian">
                            Debian 系
                          </NativeSelectOption>
                          <NativeSelectOption value="red_hat">
                            Red Hat 系
                          </NativeSelectOption>
                        </NativeSelect>
                      </div>
                      <Button
                        onClick={handleAddHostSystem}
                        disabled={!newHostname.trim() || bindTerminalMutation.isPending}
                      >
                        {bindTerminalMutation.isPending ? '添加中...' : '添加'}
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2 mt-4">
                <div className="font-medium">我的主机</div>
                <div>
                  {!terminalsData?.items || terminalsData.items.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border rounded-lg">
                      <p>暂无主机配置</p>
                      <p className="text-xs mt-1">点击添加主机按钮开始配置</p>
                    </div>
                  ) : (
                    <div className="flex flex-col justify-between rounded-xl bg-setting overflow-hidden">
                      {terminalsData.items.map((terminal, idx) => (
                        <div key={terminal.id}>
                          <div className="p-3 flex justify-between items-center hover:bg-accent/50 transition-colors">
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {terminal.endpoint_identifier}
                              </span>
                              <span className=" text-muted-foreground">
                                {terminal.linux_distro === 'debian'
                                  ? 'Debian 系'
                                  : 'Red Hat 系'}
                              </span>
                            </div>

                            <div>
                              {/*<Button*/}
                              {/*  variant="ghost"*/}
                              {/*  size="sm"*/}
                              {/*  onClick={() => handleRemoveHostSystem(terminal.id)}*/}
                              {/*  disabled={deleteTerminalMutation.isPending}*/}
                              {/*  className="hover:bg-destructive/10 hover:text-destructive px-1!"*/}
                              {/*>*/}
                              {/*  <Trash2 className="h-4 w-4"/>*/}
                              {/*</Button>*/}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveHostSystem(terminal.id)}
                                disabled={deleteTerminalMutation.isPending}
                                className="hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {idx !== terminalsData.items.length - 1 && (
                            <Separator className="bg-border h-[1px]" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
