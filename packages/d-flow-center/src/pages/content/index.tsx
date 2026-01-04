import React, { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Mic,
  FileText,
  Clock,
  SendHorizonal,
  Trash2,
  Menu,
  RefreshCw,
} from 'lucide-react'
import { IconMessageChatbot } from '@tabler/icons-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  useUsageStatistics,
  useFeedbackList,
  useCreateFeedback,
  useDeleteFeedback,
} from '@/services/queries/dashboard-query'
import { Spinner } from '@/components/ui/spinner'
import useUserConfigStore from '@/store/user-config-store'
import { KeyMapper } from '@/utils/key'
import { KeyDisplay } from '@/components/ui/key-display'
import useStatusStore from '@/store/status-store'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { throttle } from '../../../main/utils/throttle'
import IPCService from '@/services/ipc-service'
import { updateDeviceInfo } from '@/services/api/user-api'
import { throttledUpdateDeviceInfo } from '@/utils/device'
import CountUp from '@/components/CountUp'

const ContentPage: React.FC = () => {
  const [feedbackContent, setFeedbackContent] = useState('')
  const [isFeedbackFocused, setIsFeedbackFocused] = useState(false)
  const {
    data: stats,
    isLoading: statsLoading,
    isFetching: statsFetching,
    refetch: refetchStats,
  } = useUsageStatistics()
  const {
    data: feedbackData,
    isLoading: feedbackLoading,
    refetch: refetchFeedback,
  } = useFeedbackList()
  const createFeedback = useCreateFeedback()
  const deleteFeedback = useDeleteFeedback()

  const shortcutKeys = useUserConfigStore((state) => state.shortcutKeys)
  const { loadUserConfig } = useUserConfigStore((state) => state.actions)
  const holdIPCMessage = useStatusStore((state) => state.holdIPCMessage)

  const formattedKeys = useMemo(() => KeyMapper.formatKeys(shortcutKeys), [shortcutKeys])

  useEffect(() => {
    loadUserConfig()
    throttledUpdateDeviceInfo()
  }, [])

  useEffect(() => {
    if (holdIPCMessage?.action === 'user_audio_saved') {
      refetchStats()
      refetchFeedback()
    }
  }, [holdIPCMessage])

  const handleSubmitFeedback = async () => {
    if (!feedbackContent.trim()) return
    await createFeedback.mutateAsync(feedbackContent.trim())
    setFeedbackContent('')
  }

  const handleRefreshData = () => {
    refetchStats()
    refetchFeedback()
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }

  return (
    <div className="max-w-2xl h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 space-y-3 pb-3">
        <div className="flex items-center justify-between">
          <span className="text-[15px] font-medium">概览</span>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={handleRefreshData}>
                <RefreshCw className="mr-2 h-4 w-4" />
                刷新数据
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* 快捷提示 */}
        <div className="flex items-center justify-between bg-setting rounded-xl px-4 py-3">
          <div className="flex items-center">
            <Mic className="w-4 h-4 mr-[0.7rem]" />
            <div className="flex flex-col gap-1">
              <span>按住 {formattedKeys.join(' + ')} 键说话</span>
              <p className="text-sm text-muted-foreground">
                松开后，文字自动插入光标位置
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <KbdGroup className="flex items-center gap-3">
              {formattedKeys.map((key, index) => (
                <Kbd
                  key={`${key}-${index}`}
                  className="bg-ripple-brand/20 text-ripple-brand-text"
                >
                  {key}
                </Kbd>
              ))}
            </KbdGroup>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ripple-brand-text/10">
              <Mic className="h-4 w-4 text-ripple-brand-text" />
            </div>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-3 mt-2 flex-shrink-0">
        <div className="rounded-lg bg-setting text-card-foreground px-4 py-3 flex flex-col justify-between gap-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">累计输入</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-ripple-brand-text/10">
              <FileText className="h-3.5 w-3.5 text-ripple-brand-text" />
            </div>
          </div>
          <div className=" flex items-baseline gap-1.5">
            <CountUp
              to={stats?.total_characters ?? 0}
              separator=","
              duration={1}
              className="text-2xl font-semibold"
            />
            <span className="text-sm text-muted-foreground">字</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
            <span>转写次数</span>
            <span>
              <CountUp to={stats?.total_sessions ?? 0} duration={1} /> 次
            </span>
          </div>
        </div>

        <div className="rounded-lg bg-setting text-card-foreground px-4 py-3 flex flex-col justify-between gap-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">节省时间</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-ripple-brand-text/10">
              <Clock className="h-3.5 w-3.5 text-ripple-brand-text" />
            </div>
          </div>
          <div className=" flex items-baseline gap-1.5">
            <CountUp
              to={Math.round(stats?.saved_time_minutes ?? 0)}
              duration={1.5}
              className="text-2xl font-semibold"
            />
            <span className="text-sm text-muted-foreground">分钟</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
            <span>预估基准</span>
            <span>
              <CountUp to={stats?.estimated_typing_speed ?? 60} duration={1} /> 字/分
            </span>
          </div>
        </div>

        <div className="rounded-lg bg-setting text-card-foreground  px-4 py-3 flex flex-col justify-between gap-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">总听写时长</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-ripple-brand-text/10">
              <Mic className="h-3.5 w-3.5 text-ripple-brand-text" />
            </div>
          </div>
          <div className=" flex items-baseline gap-1.5">
            <CountUp
              to={Math.round(stats?.total_duration_minutes ?? 0)}
              duration={1.5}
              className="text-2xl font-semibold"
            />
            <span className="text-sm text-muted-foreground">分钟</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
            <span>平均速度</span>
            <span>
              <CountUp to={Math.round(stats?.average_speed ?? 0)} duration={1} /> 字/分
            </span>
          </div>
        </div>
      </div>

      {/* 反馈与建议 */}
      <div className="flex-1 min-h-0 mt-4 flex flex-col">
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <span className="text-[15px] font-medium">反馈与建议</span>
        </div>

        <div
          className={`rounded-lg border text-card-foreground px-3 py-2 flex-shrink-0 shadow-ripple-brand-text/10 transition-colors ${isFeedbackFocused ? 'border-ripple-brand/60' : ''}`}
        >
          <div className="flex items-center gap-3">
            <IconMessageChatbot className="h-4.5 w-4.5 text-muted-foreground flex-shrink-0" />
            <Input
              placeholder="遇到问题或有新想法？告诉我们..."
              value={feedbackContent}
              onChange={(e) => setFeedbackContent(e.target.value)}
              onFocus={() => setIsFeedbackFocused(true)}
              onBlur={() => setIsFeedbackFocused(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                  e.preventDefault()
                  handleSubmitFeedback()
                }
              }}
              className="flex-1 border-none text-sm shadow-none focus-visible:ring-0 px-0 h-8 bg-transparent!"
            />
            <Button
              onClick={handleSubmitFeedback}
              size="icon-sm"
              variant="ghost"
              disabled={!feedbackContent.trim() || createFeedback.isPending}
              className="h-8 text-sm rounded-full"
            >
              {createFeedback.isPending ? (
                <Spinner className="mr-1 text-muted-foreground" />
              ) : null}
              <SendHorizonal className="text-muted-foreground" />
            </Button>
          </div>
        </div>
        {/* 反馈列表 */}
        {(feedbackLoading || (feedbackData?.items && feedbackData.items.length > 0)) && (
          <div
            className={`flex-1 min-h-0 mt-5 rounded-xl   overflow-y-auto transition-colors duration-200   ${!feedbackLoading ? 'bg-setting/50' : ''}`}
          >
            {feedbackLoading ? (
              <div className="flex items-center justify-center h-full">
                <Spinner className="text-muted-foreground" />
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {feedbackData?.items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="group flex items-start gap-4 last:border-none px-4 py-4.5 border-b border-border/50"
                  >
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-ripple-brand flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{item.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(item.created_at)}
                      </p>
                      {item.admin_reply && (
                        <div className="mt-2 rounded-lg bg-muted p-2.5">
                          <span className="text-sm font-medium text-muted-foreground">
                            回复:{'  '}&nbsp;
                          </span>
                          <span className="text-sm">{item.admin_reply}</span>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteFeedback.mutate(item.id)}
                      disabled={deleteFeedback.isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ContentPage
