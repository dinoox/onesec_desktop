import React, { useState, useMemo, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Copy,
  Check,
  Loader2,
  LockIcon,
  Menu,
  Download,
  RefreshCw,
  Trash2,
  BadgeAlert,
  Database,
  MessageCircleMore,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { List } from 'react-window'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { Audios } from '../../../main/services/database-service'
import ipcService from '@/services/ipc-service'
import { reconvertAudio } from '@/services/api/audio-api'
import { useCreateFeedback } from '@/services/queries/dashboard-query'
import { toast } from 'sonner'
import useStatusStore from '@/store/status-store'
import useUserConfigStore, { useUserConfigActions } from '@/store/user-config-store'
import { MessageTypes } from '../../../main/types/message'
import { formatDateGroup, formatTime, getDateKey } from '@/utils/time'

const HistoryPage: React.FC = () => {
  const { t } = useTranslation()
  const [records, setRecords] = useState<Audios[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [showRetentionDialog, setShowRetentionDialog] = useState(false)
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false)
  const [pendingRetention, setPendingRetention] = useState<string>('')
  const [currentGroupLabel, setCurrentGroupLabel] = useState<string>('')
  const historyRetention = useUserConfigStore((state) => state.historyRetention)
  const { setHistoryRetention } = useUserConfigActions()
  const holdIPCMessage = useStatusStore((state) => state.holdIPCMessage)
  const reconvertingId = useStatusStore((state) => state.reconvertingId)
  const { setReconvertingId } = useStatusStore((state) => state.actions)
  const prevMessageIdRef = useRef<string | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [containerHeight, setContainerHeight] = useState(500)
  const [feedbackRecord, setFeedbackRecord] = useState<Audios | null>(null)
  const [feedbackContent, setFeedbackContent] = useState('')
  const createFeedback = useCreateFeedback()

  const loadAudios = async () => {
    try {
      const audios = await ipcService.getAudios()
      setRecords(audios)
    } catch (error) {
      console.error('loadAudios failed:', error)
    }
  }

  useEffect(() => {
    loadAudios()
  }, [])

  const handleCopy = (id: string, content: string) => {
    if (copiedId === id) return
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 3000)
  }

  const handleDownload = async (filename: string) => {
    setOpenMenuId(null)
    await ipcService.downloadAudio(filename)
  }

  const handleReconvert = async (id: string, filename: string) => {
    if (reconvertingId) {
      toast.error(t('history.reconvertRunning'))
      return
    }

    setOpenMenuId(null)
    setReconvertingId(id)

    try {
      const audioData = await ipcService.readAudioFile(filename)
      const result = await reconvertAudio(audioData, filename)

      if (result.code == 200) {
        const r = result.result as any
        const content = r?.optimized_text || r?.transcription || ''
        await ipcService.updateAudio(id, content, null)
      } else {
        const error = result.message || t('history.reconvertFailed')
        await ipcService.updateAudio(id, '', error)
        toast.error(error)
      }

      await loadAudios()
    } catch (error: any) {
      toast.error(t('history.reconvertFailed'))
    } finally {
      setReconvertingId(null)
    }
  }

  const handleDelete = async (id: string, filename: string) => {
    setOpenMenuId(null)
    try {
      if (await ipcService.deleteAudio(filename)) {
        toast.success(t('history.deleteSuccess'))
        loadedRecordsRef.current.delete(id)
        setRecords((prev) => prev.filter((record) => record.id !== id))
      } else {
        toast.error(t('history.deleteFailed'))
      }
    } catch (error) {
      console.log(error)
      toast.error(t('history.deleteFailed'))
    }
  }

  const handleDeleteAll = () => {
    setOpenMenuId(null)
    setShowDeleteAllDialog(true)
  }

  const confirmDeleteAll = async () => {
    setShowDeleteAllDialog(false)
    try {
      const filenames = records.map((r) => r.filename)
      const results = await Promise.allSettled(
        filenames.map((filename) => ipcService.deleteAudio(filename)),
      )
      const successCount = results.filter(
        (r) => r.status === 'fulfilled' && r.value,
      ).length

      if (successCount > 0) {
        toast.success(t('history.deletedCount', { count: successCount }))
        loadedRecordsRef.current.clear()
        await loadAudios()
      } else {
        toast.error(t('history.deleteFailed'))
      }
    } catch (error) {
      console.log(error)
      toast.error(t('history.deleteFailed'))
    }
  }

  const handleRetentionChange = (value: string) => {
    if (value === 'forever') {
      confirmRetentionChange(value)
    } else {
      setPendingRetention(value)
      setShowRetentionDialog(true)
    }
  }

  const confirmRetentionChange = async (value: string) => {
    await setHistoryRetention(value)

    try {
      const deletedCount = await ipcService.deleteAudiosByRetention(value)

      toast.success(t('history.settingSaved'))

      if (deletedCount > 0) {
        await loadAudios()
      }
    } catch (error) {
      toast.error(t('history.settingFailed'))
    } finally {
      setShowRetentionDialog(false)
    }
  }

  const handleSubmitFeedback = async () => {
    if (!feedbackContent.trim() || !feedbackRecord) return
    await createFeedback.mutateAsync({
      content: feedbackContent.trim(),
    })
    setFeedbackRecord(null)
    setFeedbackContent('')
  }

  const getRetentionTitleMessage = (value: string) => {
    const messages: Record<string, string> = {
      never: t('history.retentionNeverTitle'),
      '24hours': t('history.retentionDeleteTitle'),
      '1week': t('history.retentionDeleteTitle'),
      '1month': t('history.retentionDeleteTitle'),
    }
    return messages[value] || t('history.retentionDefault')
  }

  const getRetentionWarningMessage = (value: string) => {
    const messages: Record<string, string> = {
      never: t('history.retentionWarnNever'),
      '24hours': t('history.retentionWarn24h'),
      '1week': t('history.retentionWarn1week'),
      '1month': t('history.retentionWarn1month'),
    }
    return messages[value] || t('history.retentionDefault')
  }

  useEffect(() => {
    if (!holdIPCMessage || holdIPCMessage.id === prevMessageIdRef.current) {
      return
    }

    const messageType = holdIPCMessage.data?.type
    if (messageType === MessageTypes.USER_AUDIO_SAVED) {
      prevMessageIdRef.current = holdIPCMessage.id
      loadAudios()
    }
  }, [holdIPCMessage])

  const groupedRecords = useMemo(() => {
    if (historyRetention === 'never') {
      if (records.length > 0) {
        return [
              {
            key: 'last-error-record',
            label: t('history.lastErrorRecord'),
            records: [records[0]],
          },
        ]
      }
      return []
    }

    const groups: { key: string; label: string; records: Audios[] }[] = []
    const groupMap = new Map<string, Audios[]>()

    records.forEach((record) => {
      const key = getDateKey(record.created_at)
      if (!groupMap.has(key)) {
        groupMap.set(key, [])
      }
      groupMap.get(key)!.push(record)
    })

    groupMap.forEach((recs, key) => {
      groups.push({
        key,
        label: formatDateGroup(recs[0].created_at),
        records: recs,
      })
    })

    return groups
  }, [records, historyRetention])

  // 展平列表数据用于虚拟化
  const flattenedList = useMemo(() => {
    const items: Array<{
      type: 'header' | 'record'
      data: any
      groupIndex: number
      recordIndex?: number
    }> = []
    groupedRecords.forEach((group, groupIndex) => {
      if (groupIndex > 0) {
        items.push({ type: 'header', data: group, groupIndex })
      }
      group.records.forEach((record, recordIndex) => {
        items.push({ type: 'record', data: record, groupIndex, recordIndex })
      })
    })
    return items
  }, [groupedRecords])

  const listRef = useRef<any>(null)
  const [initialLoad, setInitialLoad] = useState(true)
  const loadedRecordsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (initialLoad && records.length > 0) {
      const timer = setTimeout(() => setInitialLoad(false), 800)
      return () => clearTimeout(timer)
    }
  }, [records.length, initialLoad])

  // 重置已加载记录的跟踪
  useEffect(() => {
    if (records.length === 0) {
      loadedRecordsRef.current.clear()
    }
  }, [records.length])

  // 动态计算每行高度
  const getRowHeight = (index: number) => {
    const item = flattenedList[index]
    if (item.type === 'header') {
      return 46
    }
    const content = item.data.content || item.data.error || ''
    const lines = Math.min(Math.ceil(content.length / 35), 3)
    return 46 + Math.max(0, lines - 1) * 20
  }

  const RowComponent = ({
    index,
    style,
  }: {
    index: number
    style: React.CSSProperties
    ariaAttributes?: any
  }) => {
    const item = flattenedList[index]

    if (item.type === 'header') {
      return (
        <div style={style}>
          <motion.div
            className="text-xs text-muted-foreground mb-2 pt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {item.data.label}
          </motion.div>
        </div>
      )
    }

    const record = item.data
    const isFirstInGroup = item.recordIndex === 0
    const isLastInGroup =
      item.recordIndex === groupedRecords[item.groupIndex].records.length - 1

    // 检查是否为新记录
    const isNewRecord = !loadedRecordsRef.current.has(record.id)
    if (isNewRecord) {
      loadedRecordsRef.current.add(record.id)
    }

    return (
      <div style={style}>
        <motion.div
          initial={initialLoad || isNewRecord ? { opacity: 0, scale: 0.96 } : false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 24,
            mass: 0.8,
            delay: initialLoad ? Math.min(index * 0.025, 0.4) : isNewRecord ? 0.1 : 0,
          }}
        >
          <div
            className={`group flex items-center gap-3 border-x border-b pl-4 pr-5 py-3 hover:bg-muted/50 transition-colors ${
              isFirstInGroup ? 'border-t rounded-t-lg' : ''
            } ${isLastInGroup ? 'rounded-b-lg' : ''}`}
          >
            <span className="text-xs text-muted-foreground w-[70px] flex-shrink-0 pt-0.5 tabular-nums">
              {formatTime(record.created_at)}
            </span>
            <div className="flex-1 min-w-0 text-sm flex items-center gap-2">
              {reconvertingId === record.id ? (
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin" />
                  {t('history.transcribing')}
                </span>
              ) : record.error ? (
                <span
                  className="flex items-center gap-2"
                  style={{ color: 'var(--ripple-error-text)' }}
                >
                  <BadgeAlert className="h-4 w-4 flex-shrink-0" />
                  {record.error}
                </span>
              ) : record.content ? (
                <span className="line-clamp-3">{record.content}</span>
              ) : (
                  <span className="text-muted-foreground">{t('history.noContent')}</span>
              )}
            </div>
            <div className="flex items-center gap-4.5 text-muted-foreground opacity-0 group-hover:opacity-100 has-[[data-state=open]]:opacity-100 transition-opacity">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-3 w-3 relative text-muted-foreground/80"
                    disabled={copiedId === record.id || !!record.error}
                    onClick={() => handleCopy(record.id, record.content)}
                  >
                    <Check
                      className={`h-2 w-2 absolute transition-all duration-200 ${
                        copiedId === record.id
                          ? 'opacity-100 scale-100'
                          : 'opacity-0 scale-50'
                      }`}
                    />
                    <Copy
                      className={`h-2 w-2 absolute transition-all duration-200 ${
                        copiedId === record.id
                          ? 'opacity-0 scale-50'
                          : 'opacity-100 scale-100'
                      }`}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {copiedId === record.id ? t('history.copied') : t('history.copy')}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-3 w-3 text-muted-foreground/80"
                    onClick={() => setFeedbackRecord(record)}
                  >
                    <MessageCircleMore className="h-2 w-2" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t('history.feedback')}</TooltipContent>
              </Tooltip>

              <DropdownMenu
                modal={false}
                open={openMenuId === record.id}
                onOpenChange={(open) => setOpenMenuId(open ? record.id : null)}
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
                      handleDownload(record.filename)
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {t('history.saveAudio')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={reconvertingId !== null}
                    onSelect={(e) => {
                      e.preventDefault()
                      handleReconvert(record.id, record.filename)
                    }}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {t('history.reconvert')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={reconvertingId === record.id}
                    onSelect={(e) => {
                      e.preventDefault()
                      handleDelete(record.id, record.filename)
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('history.deleteAudio')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // 初始化第一个分组的标题
  useEffect(() => {
    if (groupedRecords.length > 0 && !currentGroupLabel) {
      setCurrentGroupLabel(groupedRecords[0].label)
    }
  }, [groupedRecords, currentGroupLabel])

  // 监听容器高度变化
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const updateHeight = () => {
      setContainerHeight(container.clientHeight)
    }

    updateHeight()
    const resizeObserver = new ResizeObserver(updateHeight)
    resizeObserver.observe(container)

    return () => resizeObserver.disconnect()
  }, [])

  const handleRowsRendered = ({
    startIndex,
  }: {
    startIndex: number
    stopIndex: number
  }) => {
    if (flattenedList.length === 0 || groupedRecords.length === 0) return

    // 使用偏移量，让标题在滚动更深时才切换
    const checkIndex = Math.min(startIndex - 1, flattenedList.length - 1)
    const visibleItem = flattenedList[checkIndex]

    if (visibleItem) {
      const currentGroup = groupedRecords[visibleItem.groupIndex]
      if (currentGroup && currentGroup.label !== currentGroupLabel) {
        setCurrentGroupLabel(currentGroup.label)
      }
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 space-y-4 pb-3">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-semibold">{t('history.title')}</span>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                disabled={records.length === 0}
                onSelect={(e) => {
                  e.preventDefault()
                  handleDeleteAll()
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t('history.deleteAll')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* 提示 */}
        <div className="flex items-center justify-between bg-setting rounded-xl px-4 py-3">
          <div className="flex items-center">
            <LockIcon className="w-4 h-4 mr-3" />
            <div className="flex flex-col gap-1">
              <span>{t('history.retention')}</span>
              <p className="text-sm text-muted-foreground">
                {t('history.retentionDesc')}
              </p>
            </div>
          </div>
          <Select value={historyRetention} onValueChange={handleRetentionChange}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4}>
              <SelectGroup>
                <SelectLabel>{t('history.retentionLabel')}</SelectLabel>
                <SelectItem value="never">{t('history.never')}</SelectItem>
                <SelectItem value="24hours">{t('history.hours24')}</SelectItem>
                <SelectItem value="1week">{t('history.week1')}</SelectItem>
                <SelectItem value="1month">{t('history.month1')}</SelectItem>
                <SelectItem value="forever">{t('history.forever')}</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 mt-4 relative flex flex-col">
        {/* 固定的分组标题 */}
        <div className="flex-shrink-0 text-xs text-muted-foreground pb-2  min-h-[24px]">
          {groupedRecords.length > 0 && !isLoading && currentGroupLabel}
        </div>

        <div ref={scrollContainerRef} className="flex-1 min-h-0 overflow-y-auto">
          <div
            className={`flex justify-center py-12 transition-opacity duration-300 ${
              isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none absolute inset-0'
            }`}
          >
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>

          <div
            className={`transition-opacity duration-300 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {groupedRecords.length > 0 ? (
              <div style={{ height: containerHeight, width: '100%' }}>
                <List
                  listRef={listRef}
                  rowCount={flattenedList.length}
                  rowHeight={getRowHeight}
                  rowComponent={RowComponent as any}
                  rowProps={{} as any}
                  overscanCount={5}
                  onRowsRendered={handleRowsRendered}
                />
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                {t('history.noHistory')}
              </div>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={showRetentionDialog} onOpenChange={setShowRetentionDialog}>
        <AlertDialogContent className="max-w-[400px]!">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {getRetentionTitleMessage(pendingRetention)}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {getRetentionWarningMessage(pendingRetention)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('history.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmRetentionChange(pendingRetention)}>
              {t('history.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
        <AlertDialogContent className="max-w-[400px]!">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('history.deleteAllTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('history.deleteAllDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('history.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteAll}>
              {t('history.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={!!feedbackRecord}
        onOpenChange={(open) => {
          if (!open) {
            setFeedbackRecord(null)
            setFeedbackContent('')
          }
        }}
      >
        <DialogContent className="max-w-[420px]!">
          <DialogHeader>
            <DialogTitle>{t('history.feedbackDialogTitle')}</DialogTitle>
            <DialogDescription>
              {t('history.feedbackDialogDesc')}
            </DialogDescription>
          </DialogHeader>
          {feedbackRecord?.content && (
            <div className="rounded-lg bg-muted/50 border border-border/50 px-3 py-2.5">
              <p className="text-sm text-muted-foreground line-clamp-3 select-text">
                {feedbackRecord.content}
              </p>
            </div>
          )}
          <Textarea
            placeholder={t('history.feedbackPlaceholder')}
            value={feedbackContent}
            onChange={(e) => setFeedbackContent(e.target.value)}
            className="min-h-[100px] text-sm"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setFeedbackRecord(null)
                setFeedbackContent('')
              }}
            >
              {t('history.cancel')}
            </Button>
            <Button
              onClick={handleSubmitFeedback}
              disabled={!feedbackContent.trim() || createFeedback.isPending}
            >
              {createFeedback.isPending && <Spinner className="mr-1.5 h-3.5 w-3.5" />}
              {t('history.feedbackSubmit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default HistoryPage
