import { Button } from '@/components/ui/button'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
} from '@/components/ui/item'
import React, { useMemo, useState } from 'react'
import { Edit, HamburgerMenu, Trash } from 'iconsax-reactjs'
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
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, PopcornIcon, Search, EllipsisVerticalIcon, Plus } from 'lucide-react'
import {
  useCreateHotWordQuery,
  useDeleteHotWordQuery,
  useHotWordListQuery,
  useUpdateHotWordQuery,
} from '@/services/queries/hotword-query'
import { HotWord } from '@/services/api/hotword-api'
import { Spinner } from '@/components/ui/spinner'
import { Empty, EmptyDescription } from '@/components/ui/empty'
import { AnimatePresence, motion } from 'framer-motion'

const ContestPage: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [newHotWord, setNewHotWord] = useState('')
  const [editingHotWord, setEditingHotWord] = useState<HotWord | null>(null)
  const [editValue, setEditValue] = useState('')
  const [showAlert, setShowAlert] = useState(true)

  // 获取热词列表
  const { data: hotWords = [], isLoading } = useHotWordListQuery()
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
    await deleteHotWordMutation.mutateAsync(id)
  }

  // 打开编辑对话框
  const openEditDialog = (hotWord: HotWord) => {
    setEditingHotWord(hotWord)
    setEditValue(hotWord.hotword)
    setEditOpen(true)
  }

  return (
    <>
      <div className="flex w-full flex-col gap-6">
        <div className="flex items-center justify-between gap-4 w-full">
          <InputGroup className="max-w-md">
            <InputGroupInput
              placeholder="搜索常用词..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupAddon align="inline-end">
              <AnimatePresence mode="wait">
                {filteredHotWords.length !== hotWords.length && (
                  <motion.span
                    key={filteredHotWords.length}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    {filteredHotWords.length} 个结果
                  </motion.span>
                )}
              </AnimatePresence>
            </InputGroupAddon>
          </InputGroup>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary">
                <Plus />
                添加常用词
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

      {showAlert && (
        <Alert className="max-w-md mt-4">
          <PopcornIcon />
          <AlertTitle>让秒言更懂你</AlertTitle>
          <AlertDescription>
            添加常用的人名、地名或术语，系统会优先识别，避免识别错误或遗漏。
          </AlertDescription>
          {/* <button className="absolute top-3 right-3" onClick={() => setShowAlert(false)}>
                  <X className="h-4 w-4" />
                </button> */}
        </Alert>
      )}

      <div className="flex w-full max-w-md flex-col gap-6 my-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Spinner className="size-6 text-muted-foreground" />
          </div>
        ) : filteredHotWords.length === 0 ? (
          <Empty>
            <EmptyDescription>
              {searchValue ? '未找到匹配的常用词' : '还没有添加常用词'}
            </EmptyDescription>
          </Empty>
        ) : (
          <ItemGroup className="border border-border rounded-md">
            <AnimatePresence mode="popLayout">
              {filteredHotWords.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  layout
                >
                  <Item className="p-2 px-4">
                    <ItemContent className="gap-1">
                      <ItemTitle>{item.hotword}</ItemTitle>
                    </ItemContent>
                    <ItemActions>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <EllipsisVerticalIcon />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56" align="start">
                            <DropdownMenuLabel>提示词操作</DropdownMenuLabel>
                            <DropdownMenuGroup>
                              <DropdownMenuItem onClick={() => openEditDialog(item)}>
                                编辑
                                <DropdownMenuShortcut>
                                  <Edit />
                                </DropdownMenuShortcut>
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(item.id)}
                              disabled={deleteHotWordMutation.isPending}
                            >
                              删除
                              <DropdownMenuShortcut>
                                <Trash />
                              </DropdownMenuShortcut>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </Button>
                    </ItemActions>
                  </Item>
                  {index !== filteredHotWords.length - 1 && <ItemSeparator />}
                </motion.div>
              ))}
            </AnimatePresence>
          </ItemGroup>
        )}
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
    </>
  )
}

export default ContestPage
