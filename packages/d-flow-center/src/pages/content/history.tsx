import React, { useState, useMemo, useEffect, useRef } from 'react'
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
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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
  SelectItem,
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
import { Audios } from '../../../main/services/database-service'
import ipcService from '@/services/ipc-service'
import { reconvertAudio } from '@/services/api/audio-api'
import { toast } from 'sonner'
import useStatusStore from '@/store/status-store'
import useUserConfigStore, { useUserConfigActions } from '@/store/user-config-store'
import { MessageTypes } from '../../../main/types/message'
import { formatDateGroup, formatTime, getDateKey } from '@/utils/time'

const HistoryPage: React.FC = () => {
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
  const groupRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  const loadAudios = async () => {
    try {
      const audios = await ipcService.getAudios()
      setRecords(audios)
    } catch (error) {
      console.error('加载音频列表失败:', error)
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
      toast.error('已有转录任务正在运行，请稍候')
      return
    }

    setOpenMenuId(null)
    setReconvertingId(id)

    try {
      const audioData = await ipcService.readAudioFile(filename)
      const result = await reconvertAudio(audioData)

      if (result.success) {
        const content = (result.data as any)?.text || ''
        await ipcService.updateAudio(id, content, null)
      } else {
        const error = result.message || '转录失败'
        await ipcService.updateAudio(id, '', error)
        toast.error(error)
      }

      await loadAudios()
    } catch (error) {
      console.error('重新转录失败:', error)
    } finally {
      setReconvertingId(null)
    }
  }

  const handleDelete = async (id: string, filename: string) => {
    setOpenMenuId(null)
    try {
      if (await ipcService.deleteAudio(filename)) {
        toast.success('音频删除成功')
        setRecords((prev) => prev.filter((record) => record.id !== id))
      } else {
        toast.error('删除失败')
      }
    } catch (error) {
      console.log(error)
      toast.error('删除失败')
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
        toast.success(`已删除 ${successCount} 条记录`)
        await loadAudios()
      } else {
        toast.error('删除失败')
      }
    } catch (error) {
      console.log(error)
      toast.error('删除失败')
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

      toast.success('设置已保存')

      if (deletedCount > 0) {
        await loadAudios()
      }
    } catch (error) {
      toast.error('设置失败')
    } finally {
      setShowRetentionDialog(false)
    }
  }

  const getRetentionTitleMessage = (value: string) => {
    const messages: Record<string, string> = {
      never: '永不保存历史记录？',
      '24hours': '删除旧历史记录？',
      '1week': '删除旧历史记录？',
      '1month': '删除旧历史记录？',
    }
    return messages[value] || '此操作可能会删除部分历史数据'
  }

  const getRetentionWarningMessage = (value: string) => {
    const messages: Record<string, string> = {
      never: '将删除本设备中所有历史记录。该操作会立即生效，删除后无法恢复',
      '24hours': '将删除本设备中早于 1 天的历史记录。该操作会立即生效，删除后无法恢复',
      '1week': '将删除本设备中早于 1 周的历史记录。该操作会立即生效，删除后无法恢复',
      '1month': '将删除本设备中早于 1 月的历史记录。该操作会立即生效，删除后无法恢复',
    }
    return messages[value] || '此操作可能会删除部分历史数据'
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
  }, [records])

  // 初始化第一个分组的标题
  useEffect(() => {
    if (groupedRecords.length > 0 && !currentGroupLabel) {
      setCurrentGroupLabel(groupedRecords[0].label)
    }
  }, [groupedRecords, currentGroupLabel])

  // 使用滚动事件监听当前分组
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (!scrollContainer || groupedRecords.length === 0) return

    const handleScroll = () => {
      const containerTop = scrollContainer.getBoundingClientRect().top

      // 找到当前应该显示的分组（最后一个 top <= containerTop 的分组）
      let currentGroup = groupedRecords[0]

      for (const group of groupedRecords) {
        const el = groupRefs.current.get(group.key)
        if (el) {
          const rect = el.getBoundingClientRect()
          // 如果分组顶部还在容器顶部之上或刚好在顶部，这就是当前分组
          if (rect.top <= containerTop - 14) {
            currentGroup = group
          } else {
            break
          }
        }
      }

      setCurrentGroupLabel(currentGroup.label)
    }

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true })
    // 初始化时也执行一次
    handleScroll()

    return () => scrollContainer.removeEventListener('scroll', handleScroll)
  }, [groupedRecords])

  return (
    <div className="max-w-2xl h-full flex flex-col">
      <div className="flex-shrink-0 space-y-3 pb-3">
        <div className="flex items-center justify-between">
          <span className="text-[15px] font-medium">历史记录</span>
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
                删除所有
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center justify-between bg-setting rounded-xl px-4 py-3">
          <div className="flex items-center">
            <LockIcon className="w-4 h-4 mr-3" />
            <div className="flex flex-col gap-1">
              <span>历史记录保存</span>
              <p className="text-sm text-muted-foreground">
                设置语音输入记录在本地的保存时长
              </p>
            </div>
          </div>
          <Select value={historyRetention} onValueChange={handleRetentionChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="never">永不保存</SelectItem>
              <SelectItem value="24hours">24 小时</SelectItem>
              <SelectItem value="1week">一周</SelectItem>
              <SelectItem value="1month">一月</SelectItem>
              <SelectItem value="forever">始终保存</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 mt-6 relative flex flex-col">
        {/* 固定的分组标题 */}
        {groupedRecords.length > 0 && !isLoading && (
          <div className="flex-shrink-0 text-xs text-muted-foreground pb-2 bg-background">
            {currentGroupLabel}
          </div>
        )}

        <div ref={scrollContainerRef} className="flex-1 min-h-0 overflow-y-auto">
          <div
            className={`flex justify-center py-12 transition-opacity duration-300 ${
              isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none absolute inset-0'
            }`}
          >
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>

          <div
            className={`space-y-6 transition-opacity duration-300 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {groupedRecords.length > 0 ? (
              groupedRecords.map((group, groupIndex) => (
                <motion.div

                  key={group.key}
                  ref={(el) => {
                    if (el) groupRefs.current.set(group.key, el)
                    else groupRefs.current.delete(group.key)
                  }}
                  data-group-key={group.key}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* 第一个分组不显示标题（已在顶部固定显示），其他分组显示标题 */}
                  {groupIndex > 0 && (
                    <div className="text-xs text-muted-foreground mb-2">
                      {group.label}
                    </div>
                  )}
                  <div className="border rounded-lg overflow-hidden">
                    <AnimatePresence initial={false}>
                      {group.records.map((record) => (
                        <motion.div
                          key={record.id}
                          layout
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{
                            opacity: { duration: 0.12 },
                            layout: { type: 'spring', stiffness: 500, damping: 35 },
                          }}
                          className="group flex items-center gap-3 border-b pl-4 pr-5 py-3 hover:bg-muted/50 transition-colors last:border-b-0"
                        >
                          <span className="text-xs text-muted-foreground w-[70px] flex-shrink-0 pt-0.5 tabular-nums">
                            {formatTime(record.created_at)}
                          </span>
                          <div className="flex-1 min-w-0 text-sm flex items-center gap-2">
                            {reconvertingId === record.id ? (
                              <span className="flex items-center gap-2 text-muted-foreground">
                                <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin" />
                                转录中...
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
                              record.content
                            ) : (
                              <span className="text-muted-foreground">未识别到内容</span>
                            )}
                          </div>
                          <div className="flex items-center gap-4.5 text-muted-foreground opacity-0 group-hover:opacity-100 has-[[data-state=open]]:opacity-100 transition-opacity">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-3 w-3 relative text-muted-foreground/80"
                                  disabled={copiedId === record.id}
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
                                {copiedId === record.id ? '已复制' : '复制'}
                              </TooltipContent>
                            </Tooltip>

                            <DropdownMenu
                              modal={false}
                              open={openMenuId === record.id}
                              onOpenChange={(open) =>
                                setOpenMenuId(open ? record.id : null)
                              }
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
                                  音频另存
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  disabled={reconvertingId !== null}
                                  onSelect={(e) => {
                                    e.preventDefault()
                                    handleReconvert(record.id, record.filename)
                                  }}
                                >
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                  重新转录
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
                                  删除音频
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">暂无历史记录</div>
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
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmRetentionChange(pendingRetention)}>
              确定
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
        <AlertDialogContent className="max-w-[400px]!">
          <AlertDialogHeader>
            <AlertDialogTitle>删除所有历史记录？</AlertDialogTitle>
            <AlertDialogDescription>
              将删除本设备中所有历史记录，删除后将无法恢复
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteAll}>确定</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default HistoryPage
