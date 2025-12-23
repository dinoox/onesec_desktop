import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import React, { useMemo, useState } from 'react'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Loader2,
  PopcornIcon,
  Search,
  Plus,
  AlertCircle,
  Menu,
  Edit,
  Trash2,
} from 'lucide-react'
import {
  useCreateHotWordQuery,
  useDeleteHotWordQuery,
  useHotWordListQuery,
  useUpdateHotWordQuery,
} from '@/services/queries/hotword-query'
import { HotWord } from '@/services/api/hotword-api'
import { Empty, EmptyDescription } from '@/components/ui/empty'
import { AnimatePresence, motion } from 'framer-motion'

const ContentPage: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [newHotWord, setNewHotWord] = useState('')
  const [editingHotWord, setEditingHotWord] = useState<HotWord | null>(null)
  const [editValue, setEditValue] = useState('')
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)

  // 获取热词列表
  const { data: hotWords = [], isLoading, isError, error } = useHotWordListQuery()
  const createHotWordMutation = useCreateHotWordQuery()
  const updateHotWordMutation = useUpdateHotWordQuery()
  const deleteHotWordMutation = useDeleteHotWordQuery()

  // 搜索过滤
  const filteredHotWords = useMemo(() => {
    if (!searchValue.trim()) return hotWords
    return hotWords.filter((item) =>
      item.hotword.toLowerCase().includes(searchValue.toLowerCase()),
    )
  }, [hotWords, searchValue])

  // 添加热词
  const handleCreate = async () => {
    if (!newHotWord.trim()) {
      return
    }
    await createHotWordMutation.mutateAsync(newHotWord.trim())
    setNewHotWord('')
    setOpen(false)
  }

  // 编辑热词
  const handleEdit = async () => {
    if (!editingHotWord || !editValue.trim()) {
      return
    }
    await updateHotWordMutation.mutateAsync({
      hotword_id: editingHotWord.id,
      hotword: editValue.trim(),
    })
    setEditValue('')
    setEditingHotWord(null)
    setEditOpen(false)
  }

  // 删除热词
  const handleDelete = async (id: number) => {
    setOpenMenuId(null)
    await deleteHotWordMutation.mutateAsync(id)
  }

  // 打开编辑对话框
  const openEditDialog = (hotWord: HotWord) => {
    setOpenMenuId(null)
    setEditingHotWord(hotWord)
    setEditValue(hotWord.hotword)
    setEditOpen(true)
  }

  return (
    <div className="max-w-2xl h-full flex flex-col">
      <div className="flex-shrink-0 space-y-3 pb-3">
        <div className="flex items-center justify-between">
          <span className="text-[15px] font-medium">常用词</span>

          {/* 搜索框 */}
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 ">
              <InputGroup className="max-w-md h-[32px] w-[212px]">
                <InputGroupInput
                  placeholder="搜索常用词..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
                <InputGroupAddon>
                  <Search />
                </InputGroupAddon>
                <InputGroupAddon align="inline-end">
                  <AnimatePresence>
                    {filteredHotWords.length !== hotWords.length && (
                      <motion.span
                        key={filteredHotWords.length}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        className='text-xs font-normal'
                      >
                        {filteredHotWords.length} 个结果
                      </motion.span>
                    )}
                  </AnimatePresence>
                </InputGroupAddon>
              </InputGroup>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" size="sm" className="px-2!">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>添加新常用词</DialogTitle>
                  <DialogDescription>在这里添加您的常用词内容</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                  <InputGroup>
                    <InputGroupInput
                      placeholder="请输入常用词..."
                      value={newHotWord}
                      onChange={(e) => setNewHotWord(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleCreate().then()
                        }
                      }}
                    />
                  </InputGroup>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    取消
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={createHotWordMutation.isPending || !newHotWord.trim()}
                  >
                    {createHotWordMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        创建中...
                      </>
                    ) : (
                      '确定'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        {/* 提示 */}
        <div className="flex items-center bg-setting rounded-xl px-4 py-3">
          <PopcornIcon className="w-4 h-4 mr-[0.7rem]" />
          <div className="flex flex-col gap-1">
            <span>让秒言更懂你</span>
            <p className="text-sm text-muted-foreground">
              添加常用的人名、地名或术语，系统会优先识别，避免识别错误或遗漏
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="mt-4">
          <div className="flex-shrink-0 text-xs text-muted-foreground pb-2 bg-background min-h-[24px]">
            {(filteredHotWords.length > 0 && !isLoading) ? '常用词' : '搜索词'}
          </div>

          <AnimatePresence mode="wait">
            {isError ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Alert variant="destructive">
                  <AlertCircle />
                  <AlertTitle>连接失败</AlertTitle>
                  <AlertDescription>
                    无法连接到服务器，请检查网络连接或稍后重试
                  </AlertDescription>
                </Alert>
              </motion.div>
            ) : isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="space-y-2"
              >
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-[44px] w-full rounded-xl" />
                ))}
              </motion.div>
            ) : filteredHotWords.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
              >
                <Empty>
                  <EmptyDescription>
                    {searchValue ? '未找到匹配的常用词' : '还没有添加常用词'}
                  </EmptyDescription>
                </Empty>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="border rounded-lg overflow-hidden"
              >
                <AnimatePresence>
                  {filteredHotWords.map((item, index) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1 }}
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 24,
                        mass: 0.8,
                        delay: index * 0.025,
                        layout: { type: 'spring', stiffness: 500, damping: 35 },
                      }}
                      className="group flex items-center gap-3 border-b pl-4 pr-5 py-3 hover:bg-muted/50 transition-colors last:border-b-0"
                    >
                      <div className="flex-1 min-w-0 text-sm">
                        <span className="line-clamp-2">{item.hotword}</span>
                      </div>
                      <div className="flex items-center gap-4.5 text-muted-foreground opacity-0 group-hover:opacity-100 has-[[data-state=open]]:opacity-100 transition-opacity">
                        <DropdownMenu
                          modal={false}
                          open={openMenuId === item.id}
                          onOpenChange={(open) => setOpenMenuId(open ? item.id : null)}
                        >
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-3 w-3 text-muted-foreground/80"
                            >
                              <Menu className="h-2 w-2" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            onPointerDownOutside={(e) => {
                              const target = e.target as HTMLElement
                              if (target.closest('.group')) {
                                e.preventDefault()
                              }
                            }}
                          >
                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault()
                                openEditDialog(item)
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              编辑
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault()
                                handleDelete(item.id)
                              }}
                              disabled={deleteHotWordMutation.isPending}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 编辑对话框 */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑常用词</DialogTitle>
            <DialogDescription>修改您的常用词内容</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <InputGroup>
              <InputGroupInput
                placeholder="请输入常用词..."
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleEdit().then()
                  }
                }}
              />
            </InputGroup>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              取消
            </Button>
            <Button
              onClick={handleEdit}
              disabled={updateHotWordMutation.isPending || !editValue.trim()}
            >
              {updateHotWordMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  更新中...
                </>
              ) : (
                '确定'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ContentPage
