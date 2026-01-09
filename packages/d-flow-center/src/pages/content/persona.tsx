import { Button } from '@/components/ui/button'
import React, { useState, useMemo, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { InputGroup, InputGroupInput } from '@/components/ui/input-group'
import { Textarea } from '@/components/ui/textarea'
import {
  Sparkles,
  Globe,
  Terminal,
  Briefcase,
  Flame,
  Zap,
  Code,
  BookOpen,
  Mic,
  Scissors,
  Phone,
  Heart,
  Users,
  Crown,
  Radio,
  Mail,
  Plus,
  Edit,
  MoreHorizontal,
  Search,
  Menu,
  Trash2,
  icons,
  Command,
  Keyboard,
  Blend,
  Info,
} from 'lucide-react'
import {
  usePersonaListQuery,
  useCreatePersonaQuery,
  useUpdatePersonaQuery,
  useDeletePersonaQuery,
} from '@/services/queries/persona-query'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Kbd } from '@/components/ui/kbd'
import { Spinner } from '@/components/ui/spinner'
import { UserRoundPenIcon, CircleUserRoundIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import ipcService from '@/services/ipc-service'
import useStatusStore from '@/store/status-store'
import useUserConfigStore from '@/store/user-config-store'
import { useClickOutside } from '@/hooks/use-click-outside'
import { toast } from 'sonner'
import { MessageTypes } from '../../../main/types/message'
import { KeyMapper } from '@/utils/key'
import { KeyDisplay } from '@/components/ui/key-display'

// 可选图标列表（使用 PascalCase 与 lucide-react icons 对象保持一致）
const ICON_OPTIONS = [
  { id: 'Sparkles', Icon: Sparkles },
  { id: 'Globe', Icon: Globe },
  { id: 'Terminal', Icon: Terminal },
  { id: 'Mail', Icon: Mail },
  { id: 'Briefcase', Icon: Briefcase },
  { id: 'Flame', Icon: Flame },
  { id: 'Zap', Icon: Zap },
  { id: 'Crown', Icon: Crown },
  { id: 'Radio', Icon: Radio },
  { id: 'Heart', Icon: Heart },
  { id: 'Users', Icon: Users },
  { id: 'Code', Icon: Code },
  { id: 'BookOpen', Icon: BookOpen },
  { id: 'Mic', Icon: Mic },
  { id: 'Scissors', Icon: Scissors },
  { id: 'Phone', Icon: Phone },
  { id: 'Command', Icon: Command },
]

// 人设类型
interface Persona {
  id: string
  name: string
  icon: string
  description: string
  is_example: boolean
}

const PersonaPage: React.FC = () => {
  // API hooks
  const { data: customPersonas = [], isLoading } = usePersonaListQuery()
  const createMutation = useCreatePersonaQuery()
  const updateMutation = useUpdatePersonaQuery()
  const deleteMutation = useDeletePersonaQuery()

  // 状态
  const [selectedId, setSelectedId] = useState<string>('default')
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null)
  const [editForm, setEditForm] = useState({ name: '', icon: '', description: '' })
  const [isCreating, setIsCreating] = useState(false)
  const [iconPickerOpen, setIconPickerOpen] = useState(false)
  const [iconSearch, setIconSearch] = useState('')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  // 快捷键设置
  const [hotkeyDialogOpen, setHotkeyDialogOpen] = useState(false)
  const shortcutPersonaKeys = useUserConfigStore((state) => state.shortcutPersonaKeys)
  const { setShortcutPersonaKeys, loadUserConfig } = useUserConfigStore(
    (state) => state.actions,
  )
  const hotkeySettingStatus = useStatusStore((state) => state.hotKeySettingStatus)
  const holdIPCMessage = useStatusStore((state) => state.holdIPCMessage)
  const { setHotkeySettingStatus } = useStatusStore.getState().actions
  const personaInputRef = useRef<HTMLDivElement>(null)

  const personas = useMemo(() => {
    const custom: Persona[] = customPersonas.map((p) => ({
      id: String(p.id),
      name: p.name,
      icon: p.icon || 'Sparkles',
      description: p.content,
      is_example: p.is_example,
    }))
    return [...custom]
  }, [customPersonas])

  // 默认选中第一个模式
  useEffect(() => {
    if (personas.length > 0 && !personas.some((p) => p.id === selectedId)) {
      setSelectedId(personas[0].id)
    }
  }, [personas, selectedId])

  // 加载配置
  useEffect(() => {
    loadUserConfig().then()
  }, [])

  // 监听快捷键设置消息
  useEffect(() => {
    const action = holdIPCMessage?.action
    const isHotkeyUpdate =
      action === MessageTypes.HOTKEY_SETTING_UPDATE ||
      action === MessageTypes.HOTKEY_SETTING_RESULT

    if (isHotkeyUpdate && holdIPCMessage?.data?.data) {
      const { mode, hotkey_combination } = holdIPCMessage.data.data

      if (mode === 'persona' && hotkey_combination && Array.isArray(hotkey_combination)) {
        setShortcutPersonaKeys(hotkey_combination)
      }

      if (action === 'hotkey_setting_result' && mode === 'persona') {
        const { is_conflict } = holdIPCMessage.data.data
        if (is_conflict) {
          loadUserConfig().then(() => toast.warning('快捷键设置冲突，请重新设置'))
        }
      }
    }
  }, [holdIPCMessage])

  // 快捷键设置相关
  const startHotKeySetting = async () => {
    await ipcService.startHotkeySetting('persona')
    setHotkeySettingStatus('hotkey_setting')
  }

  const endHotKeySetting = async () => {
    if (
      hotkeySettingStatus === 'hotkey_setting' ||
      hotkeySettingStatus === 'hotkey_setting_update'
    ) {
      await loadUserConfig()
      await ipcService.endHotkeySetting('persona')
      setHotkeySettingStatus('idle')
    }
  }

  const isEditingPersonaHotkey =
    hotkeyDialogOpen &&
    (hotkeySettingStatus === 'hotkey_setting' ||
      hotkeySettingStatus === 'hotkey_setting_update')

  const isWaitingPersonaHotkey =
    hotkeyDialogOpen && hotkeySettingStatus === 'hotkey_setting'

  useClickOutside([personaInputRef], endHotKeySetting, hotkeyDialogOpen)

  const formattedPersonaKeys = useMemo(
    () => KeyMapper.formatKeys(shortcutPersonaKeys),
    [shortcutPersonaKeys],
  )

  // 当前选中的人设
  const selectedPersona = useMemo(
    () => personas.find((p) => p.id === selectedId) || personas[0],
    [personas, selectedId],
  )

  // 过滤后的图标列表
  const filteredIcons = useMemo(() => {
    const allIcons = Object.entries(icons) as [
      string,
      React.ComponentType<{ className?: string }>,
    ][]
    // console.log("allIcons: ", icons.length)
    if (!iconSearch.trim()) {
      return allIcons
      // return allIcons.slice(0, 200) // 默认显示前 200 个
    }
    return allIcons.filter(([name]) =>
      name.toLowerCase().includes(iconSearch.toLowerCase()),
    )
  }, [iconSearch])

  // 获取图标组件
  const getIconComponent = (iconId: string) => {
    // 从完整图标库获取
    if (icons[iconId as keyof typeof icons]) {
      return icons[iconId as keyof typeof icons]
    }
    return icons.Sparkles // 默认图标
  }

  // 打开新增/编辑对话框
  const openEditDialog = (persona?: Persona) => {
    if (persona) {
      setIsCreating(false)
      setEditingPersona(persona)
      setEditForm({
        name: persona.name,
        icon: persona.icon,
        description: persona.description,
      })
    } else {
      setIsCreating(true)
      setEditingPersona(null)
      setEditForm({ name: '', icon: 'Sparkles', description: '' })
    }
    setEditDialogOpen(true)
  }

  // 保存人设
  const handleSave = async () => {
    if (!editForm.name.trim() || !editForm.description.trim()) return

    if (isCreating) {
      const resp = await createMutation.mutateAsync({
        name: editForm.name.trim(),
        icon: editForm.icon,
        content: editForm.description.trim(),
      })
      if (resp.success && resp.data?.id) {
        setSelectedId(String(resp.data.id))
      }
    } else if (editingPersona) {
      await updateMutation.mutateAsync({
        prompt_id: Number(editingPersona.id),
        name: editForm.name.trim(),
        icon: editForm.icon,
        content: editForm.description.trim(),
      })
    }
    setEditDialogOpen(false)
  }

  // 删除人设
  const handleDelete = async (id: string) => {
    setOpenMenuId(null)
    await deleteMutation.mutateAsync(Number(id))
    // 删除后会通过 useEffect 自动选中第一个
  }

  return (
    <div className="max-w-2xl h-full flex flex-col">
      {/* 标题栏 */}
      <div className="flex-shrink-0 space-y-3 pb-3">
        <div className="flex items-center justify-between">
          <span className="text-[15px] font-medium">输出模式</span>
          <div className="flex gap-2">
            <Tooltip open={shortcutPersonaKeys.length === 0}>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="px-2!"
                  onClick={() => setHotkeyDialogOpen(true)}
                >
                  <Keyboard className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>点击设置快捷键</p>
              </TooltipContent>
            </Tooltip>
            <Button
              variant="secondary"
              size="sm"
              className="px-2!"
              disabled={personas.length >= 9}
              onClick={() => openEditDialog()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 提示 */}
        <div className="flex items-center justify-between bg-setting rounded-xl px-4 py-3">
          <div className="flex items-center">
            <Blend className="w-4 h-4 mr-[0.7rem]" />
            <div className="flex flex-col gap-1">
              <span>自定义输出模式</span>
              <p className="text-sm text-muted-foreground">
                让文本输出更符合你的场景需求。可通过快捷键或底部状态栏切换输出模式
              </p>
            </div>
          </div>
          {shortcutPersonaKeys.length > 0 && (
            <div className="flex items-center">
              <KeyDisplay
                keys={[...formattedPersonaKeys]}
                className="bg-ripple-brand/20 text-ripple-brand-text"
              />
            </div>
          )}
        </div>
      </div>

      {/* 横向人设列表 */}
      <div className="flex-shrink-0 mt-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {personas.map((persona, index) => {
              const Icon = getIconComponent(persona.icon)
              const isSelected = persona.id === selectedId
              const hotkeyNumber = index < 9 ? index + 1 : null
              return (
                <motion.div
                  key={persona.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className={cn(
                    'flex-shrink-0 flex flex-col justify-center  gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors border',
                    isSelected
                      ? 'text-ripple-brand-text border-ripple-brand/60'
                      : 'bg-transparent border-transparent hover:bg-muted/40',
                  )}
                  onClick={() => setSelectedId(persona.id)}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'w-7 h-7 rounded-md flex items-center justify-center',
                        isSelected
                          ? 'bg-muted text-ripple-brand-text'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span
                      className={cn(
                        'text-sm whitespace-nowrap',
                        isSelected && 'text-ripple-brand-text',
                      )}
                    >
                      {persona.name}
                    </span>
                  </div>
                  {shortcutPersonaKeys.length > 0 && hotkeyNumber !== null && (
                    <div className="">
                      <KeyDisplay
                        keys={[...formattedPersonaKeys, hotkeyNumber.toString()]}
                      />
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* 选中人设详情 */}
      {selectedPersona && (
        <div className="flex-1 min-h-0 mt-4 border rounded-xl p-4 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedPersona.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {(() => {
                    const SelectedIcon = getIconComponent(selectedPersona.icon)
                    return (
                      <div className="w-10 h-10 rounded-lg bg-muted  text-ripple-brand-text flex items-center justify-center">
                        <SelectedIcon className="w-5 h-5" />
                      </div>
                    )
                  })()}
                  <div>
                    <h3 className="font-medium">{selectedPersona.name}</h3>
                    <span className="text-xs text-muted-foreground">
                      {selectedPersona.is_example ? '内置模式' : '自定义模式'}
                    </span>
                  </div>
                </div>
                {!selectedPersona.is_example && (
                  <DropdownMenu
                    open={openMenuId === selectedPersona.id}
                    onOpenChange={(open) =>
                      setOpenMenuId(open ? selectedPersona.id : null)
                    }
                  >
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Menu className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault()
                          setOpenMenuId(null)
                          openEditDialog(selectedPersona)
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        编辑
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault()
                          handleDelete(selectedPersona.id)
                        }}
                        disabled={deleteMutation.isPending}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-2 block">
                  输出模式描述
                </label>
                <div className="bg-muted/30 rounded-lg px-4 py-3 text-sm leading-relaxed max-h-[230px] overflow-y-auto whitespace-pre-wrap">
                  {selectedPersona.description}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* 编辑/新增对话框 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{isCreating ? '新增模式' : '修改模式'}</DialogTitle>
            <DialogDescription>
              {isCreating ? '创建一个新输出模式' : '修改输出模式的名称、图标和风格描述'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* 名称 */}
            <div>
              <label className="text-sm font-medium mb-2 block">名称</label>
              <InputGroup>
                <InputGroupInput
                  placeholder="请输入模式名称"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </InputGroup>
            </div>

            {/* 图标选择 */}
            <div>
              <label className="text-sm font-medium mb-2 block">图标</label>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(40px,1fr))] gap-2">
                {/* 如果选中的图标不在默认列表中，临时显示在最前面 */}
                {!ICON_OPTIONS.some(({ id }) => id === editForm.icon) &&
                  editForm.icon &&
                  (() => {
                    const SelectedIcon = getIconComponent(editForm.icon)
                    return (
                      <button
                        key={editForm.icon}
                        type="button"
                        className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors bg-ripple-brand/25 text-ripple-brand-text"
                      >
                        <SelectedIcon className="w-5 h-5" />
                      </button>
                    )
                  })()}
                {ICON_OPTIONS.map(({ id, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
                      editForm.icon === id
                        ? 'bg-ripple-brand/25 text-ripple-brand-text'
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted',
                    )}
                    onClick={() => setEditForm({ ...editForm, icon: id })}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                ))}
                {/* 查看更多按钮 */}
                <button
                  type="button"
                  className="w-10 h-10 rounded-lg flex items-center justify-center bg-muted/50 text-muted-foreground hover:bg-muted transition-colors"
                  onClick={() => setIconPickerOpen(true)}
                  title="查看更多图标"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 风格描述 */}
            <div>
              <label className="text-sm font-medium mb-2 block">输出模式描述</label>
              <Textarea
                placeholder="描述输出模式的特点"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                className="min-h-[120px] max-h-[213px] resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              取消
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                !editForm.name.trim() ||
                !editForm.description.trim() ||
                createMutation.isPending ||
                updateMutation.isPending
              }
            >
              {createMutation.isPending || updateMutation.isPending
                ? '保存中...'
                : '确定'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 图标选择弹框 */}
      <Dialog open={iconPickerOpen} onOpenChange={setIconPickerOpen}>
        <DialogContent className="sm:max-w-2xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>选择图标</DialogTitle>
            <DialogDescription>
              从 1600+ 个图标中选择一个图标作为当前输出模式图标
            </DialogDescription>
          </DialogHeader>

          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <InputGroup>
              <InputGroupInput
                placeholder="搜索图标..."
                value={iconSearch}
                onChange={(e) => setIconSearch(e.target.value)}
                className="pl-9"
              />
            </InputGroup>
          </div>

          {/* 图标网格 */}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(60px,1fr))] gap-3 max-h-[400px] overflow-y-auto flex-1 py-2 justify-items-center content-start">
            {filteredIcons.map(([name, Icon]) => (
              <button
                key={name}
                type="button"
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
                  editForm.icon === name
                    ? 'bg-ripple-brand/25 text-ripple-brand-text'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted',
                )}
                onClick={() => {
                  setEditForm({ ...editForm, icon: name })
                  setIconPickerOpen(false)
                  setIconSearch('')
                }}
                title={name}
              >
                <Icon className="w-5 h-5" />
              </button>
            ))}
          </div>

          {/* 提示 */}
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            {iconSearch.trim()
              ? `找到 ${filteredIcons.length} 个匹配图标`
              : `输入关键字以精确搜索图标`}
          </div>
        </DialogContent>
      </Dialog>

      {/* 快捷键设置弹框 */}
      <Dialog open={hotkeyDialogOpen} onOpenChange={setHotkeyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>输出模式快捷键</DialogTitle>
            <DialogDescription>
              <span>设置快捷键，用于快速切换输出模式</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <div>
              <div
                ref={personaInputRef}
                onClick={async () => {
                  await startHotKeySetting()
                }}
                className="border-input flex h-9 w-full items-center gap-2 rounded-md border bg-transparent px-3 shadow-xs transition-colors duration-300 cursor-pointer"
                style={
                  isEditingPersonaHotkey
                    ? { borderColor: 'var(--color-ripple-brand-text)' }
                    : {}
                }
                tabIndex={0}
              >
                <div className="grid [&>*]:col-start-1 [&>*]:row-start-1 items-center">
                  <AnimatePresence initial={false}>
                    {isWaitingPersonaHotkey && (
                      <motion.span
                        key="waiting-persona"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-muted-foreground text-sm"
                      >
                        等待按键...
                      </motion.span>
                    )}
                    {!isWaitingPersonaHotkey && (
                      <motion.div
                        key="keys-persona"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {shortcutPersonaKeys.length > 0 ? (
                          <KeyDisplay keys={formattedPersonaKeys} />
                        ) : (
                          <span className="text-muted-foreground text-sm">未设置</span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <AnimatePresence>
                  {!isWaitingPersonaHotkey && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="text-muted-foreground text-sm ml-auto"
                    >
                      修改
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* 快捷键提示卡片 */}
            <AnimatePresence>
              {shortcutPersonaKeys.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="bg-setting rounded-lg px-3 py-4 space-y-3"
                >
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>使用以下快捷键，即可在不同输出模式间快速切换</span>
                  </div>
                  <div className="space-y-2">
                    {personas.slice(0, 4).map((persona, index) => {
                      const Icon = getIconComponent(persona.icon)
                      return (
                        <div
                          key={persona.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <KeyDisplay
                              keys={[...formattedPersonaKeys, (index + 1).toString()]}
                              className="bg-ripple-brand text-foreground dark:text-background"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded flex items-center justify-center bg-sidebar">
                              <Icon className="w-3 h-3 text-muted-foreground" />
                            </div>
                            <span className="text-muted-foreground text-xs">
                              {persona.name}模式
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setHotkeyDialogOpen(false)
                endHotKeySetting()
              }}
            >
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default PersonaPage
