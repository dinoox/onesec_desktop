import { Button } from '@/components/ui/button'
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Textarea } from '@/components/ui/textarea'
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
  AlertCircle,
  BookA,
  Edit,
  Loader2,
  Menu,
  Plus,
  PopcornIcon,
  Search,
  Trash2,
} from 'lucide-react'
import {
  useCreateHotWordQuery,
  useDeleteHotWordQuery,
  useHotWordListQuery,
  useUpdateHotWordQuery,
} from '@/services/queries/hotword-query'
import { DictionaryEntry } from '@/services/api/hotword-api'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { AnimatePresence, motion } from 'framer-motion'
import { Spinner } from '@/components/ui/spinner'

const ContentPage: React.FC = () => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [newHotWords, setNewHotWords] = useState('')
  const [editingHotWord, setEditingHotWord] = useState<DictionaryEntry | null>(null)
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
      item.content.toLowerCase().includes(searchValue.toLowerCase()),
    )
  }, [hotWords, searchValue])

  // 批量添加验证
  const batchValidation = useMemo(() => {
    const lines = newHotWords.split('\n').filter((line) => line.trim())
    const errors: string[] = []

    if (lines.length > 200) {
      errors.push(t('hotWords.overLimit', { count: lines.length }))
    }

    const overLengthLines = lines
      .map((line, i) => ({ line: line.trim(), index: i + 1 }))
      .filter(({ line }) => line.length > 50)

    if (overLengthLines.length > 0) {
      const preview = overLengthLines
        .slice(0, 3)
        .map((l) => t('hotWords.lineNumber', { n: l.index }))
      errors.push(
        t('hotWords.overLength', { count: overLengthLines.length }) +
          preview.join(t('hotWords.separator')) +
          (overLengthLines.length > 3 ? '...' : ''),
      )
    }

    return { lines, errors, isValid: lines.length > 0 && errors.length === 0 }
  }, [newHotWords])

  // 批量添加热词
  const handleCreate = async () => {
    if (!batchValidation.isValid) return
    await createHotWordMutation.mutateAsync(newHotWords.trim())
    setNewHotWords('')
    setOpen(false)
  }

  // 编辑热词
  const handleEdit = async () => {
    if (!editingHotWord || !editValue.trim()) {
      return
    }
    await updateHotWordMutation.mutateAsync({
      id: editingHotWord.id,
      content: editValue.trim(),
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
  const openEditDialog = (hotWord: DictionaryEntry) => {
    setOpenMenuId(null)
    setEditingHotWord(hotWord)
    setEditValue(hotWord.content)
    setEditOpen(true)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 space-y-4 pb-3">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-semibold">{t('hotWords.title')}</span>

          {/* 搜索框 */}
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 ">
              <InputGroup className="h-[32px] w-[212px]">
                <InputGroupInput
                  placeholder={t('hotWords.searchPlaceholder')}
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
                        className="text-xs font-normal"
                      >
                        {t('hotWords.resultCount', { count: filteredHotWords.length })}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </InputGroupAddon>
              </InputGroup>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" size="sm" className="px-2!  h-[32px]">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{t('hotWords.addTitle')}</DialogTitle>
                  <DialogDescription>{t('hotWords.addDesc')}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-3">
                  <Textarea
                    placeholder={t('hotWords.addPlaceholder')}
                    value={newHotWords}
                    onChange={(e) => setNewHotWords(e.target.value)}
                    className="min-h-[120px] max-h-[193px] resize-none"
                  />
                  {batchValidation.errors.length > 0 && (
                    <div className="text-sm text-destructive space-y-1">
                      {batchValidation.errors.map((err, i) => (
                        <p key={i}>{err}</p>
                      ))}
                    </div>
                  )}
                  {batchValidation.lines.length > 0 &&
                    batchValidation.errors.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        {t('hotWords.wordCount', { count: batchValidation.lines.length })}
                      </p>
                    )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    {t('hotWords.cancel')}
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={createHotWordMutation.isPending || !batchValidation.isValid}
                  >
                    {createHotWordMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('hotWords.creating')}
                      </>
                    ) : (
                      t('hotWords.confirm')
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        {/* 提示 */}
        <div className="flex items-center bg-setting rounded-xl px-4 py-3">
          <PopcornIcon className="w-4 h-4 mr-3" />
          <div className="flex flex-col gap-1">
            <span>{t('hotWords.tagline')}</span>
            <p className="text-sm text-muted-foreground">{t('hotWords.taglineDesc')}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="mt-4">
          <div className="flex-shrink-0 text-xs text-muted-foreground pb-2  min-h-[24px]">
            {filteredHotWords.length > 0 && !isLoading
              ? t('hotWords.listLabel')
              : t('hotWords.searchLabel')}
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
                  <AlertTitle>{t('hotWords.connectionFailed')}</AlertTitle>
                  <AlertDescription>
                    {t('hotWords.connectionFailedDesc')}
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
                className="flex items-center justify-center py-12"
              >
                <Spinner />
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
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <BookA />
                    </EmptyMedia>
                    <EmptyTitle>
                      {searchValue ? t('hotWords.notFound') : t('hotWords.empty')}
                    </EmptyTitle>
                    <EmptyDescription>
                      {searchValue
                        ? t('hotWords.tryOtherKeyword')
                        : t('hotWords.clickToAdd')}
                    </EmptyDescription>
                  </EmptyHeader>
                  {!searchValue && (
                    <EmptyContent className="flex-row justify-center">
                      <Button size="sm" onClick={() => setOpen(true)}>
                        <Plus className="h-4 w-4" />
                        {t('hotWords.addHotWord')}
                      </Button>
                    </EmptyContent>
                  )}
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
                        <span className="line-clamp-2">{item.content}</span>
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
                              {t('hotWords.edit')}
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
                              {t('hotWords.delete')}
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
            <DialogTitle>{t('hotWords.editTitle')}</DialogTitle>
            <DialogDescription>{t('hotWords.editDesc')}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <InputGroup>
              <InputGroupInput
                placeholder={t('hotWords.editPlaceholder')}
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
              {t('hotWords.cancel')}
            </Button>
            <Button
              onClick={handleEdit}
              disabled={updateHotWordMutation.isPending || !editValue.trim()}
            >
              {updateHotWordMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('hotWords.updating')}
                </>
              ) : (
                t('hotWords.confirm')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ContentPage
