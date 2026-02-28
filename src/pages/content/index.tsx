import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ChevronDown, Info, Paperclip, X, MessageCircleMore } from 'lucide-react'
import { useCreateFeedback, useUsageStatistics } from '@/services/queries/dashboard-query'
import { Spinner } from '@/components/ui/spinner'
import useUserConfigStore from '@/store/user-config-store'
import { KeyMapper } from '@/utils/key'
import useStatusStore from '@/store/status-store'
import { throttledUpdateDeviceInfo } from '@/utils/device'
import { KeyDisplay } from '@/components/ui/key-display.tsx'
import { type AttachmentItem, getAttachmentKind } from '@/utils/oss-upload'
import { toast } from 'sonner'
import ipcService from '@/services/ipc-service'
import { Audios } from '../../../main/services/database-service'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const ContentPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [feedbackContent, setFeedbackContent] = useState('')
  const [attachments, setAttachments] = useState<AttachmentItem[]>([])
  const [lastRecord, setLastRecord] = useState<Audios | null>(null)
  const [showTranscription, setShowTranscription] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { refetch: refetchStats } = useUsageStatistics()
  const createFeedback = useCreateFeedback()

  const shortcutKeys = useUserConfigStore((state) => state.shortcutKeys)
  const { loadUserConfig } = useUserConfigStore((state) => state.actions)
  const holdIPCMessage = useStatusStore((state) => state.holdIPCMessage)

  const formattedKeys = useMemo(() => KeyMapper.formatKeys(shortcutKeys), [shortcutKeys])

  const loadLastRecord = async () => {
    const audios = await ipcService.getAudios()
    setLastRecord(audios[0] ?? null)
  }

  useEffect(() => {
    loadUserConfig()
    throttledUpdateDeviceInfo()
    loadLastRecord()
  }, [])

  useEffect(() => {
    if (holdIPCMessage?.action === 'user_audio_saved') {
      refetchStats()
      loadLastRecord()
    }
  }, [holdIPCMessage])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const existingKeys = new Set(attachments.map((a) => `${a.file.name}|${a.file.size}`))
    const newItems: AttachmentItem[] = []
    for (const file of files) {
      const kind = getAttachmentKind(file)
      if (!kind) {
        toast.warning(`${t('home.unsupportedFile')} ${file.name}`)
        continue
      }
      if (existingKeys.has(`${file.name}|${file.size}`)) continue
      newItems.push({
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        file,
        kind,
      })
    }
    setAttachments((prev) => [...prev, ...newItems].slice(0, 10))
    e.target.value = ''
  }

  const handleSubmitFeedback = async () => {
    if (!feedbackContent.trim()) return
    await createFeedback.mutateAsync({ content: feedbackContent.trim(), attachments })
    setFeedbackContent('')
    setAttachments([])
  }

  return (
    <div className="max-w-2xl h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 space-y-4 pb-3">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-semibold">{t('home.welcome')}</span>
          <div className="h-8 w-8"></div>
        </div>
        {/* 快捷提示 */}
        <div className="flex items-center justify-between bg-setting rounded-xl px-5 py-4">
          <div className="flex items-center">
            <div className="flex flex-col gap-1">
              <span className="font-medium">{t('home.tagline')}</span>
              <div className="text-sm text-muted-foreground space-x-1">
                <span>{t('home.holdKey')}</span>
                <KeyDisplay keys={formattedKeys} />
                <span>{t('home.thenSpeak')}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3"></div>
        </div>
      </div>

      {/* 反馈区域 */}
      <div className="flex-1 min-h-0 mt-4 flex flex-col">
        <div className="rounded-xl border border-border/60 bg-card shadow-sm flex flex-col overflow-hidden">
          {/* 最后转录展示区（可关闭） */}
          {showTranscription && (
            <div className="mx-3 mt-3 rounded-lg bg-muted/50 border border-border/30 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-semibold text-foreground">
                    {t('home.lastTranscript')}
                  </span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 mt-0.5 font-bold text-muted-foreground cursor-default" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-68">
                      <p>{t('home.tooltipLine1')}</p>
                      <p>{t('home.tooltipLine2')}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-center gap-0.5">
                  <HoverCard openDelay={200} closeDelay={100}>
                    <HoverCardTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground gap-0.5 group/more"
                        onClick={() => navigate('/content/history')}
                      >
                        {t('home.more')}
                        <ChevronDown className="h-3 w-3 transition-transform duration-200 group-data-[state=open]/more:rotate-180" />
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent side="left" className="w-74 p-4">
                      <div className="rounded-lg border p-3">
                        <p className="text-sm font-medium mb-2">
                          {t('home.hoverCardToday')}
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                              <span className="whitespace-nowrap">01:00 PM</span>
                              <span>The transcription was dismissed.</span>
                            </div>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="cursor-pointer flex-shrink-0">
                                  <MessageCircleMore className="h-3.5 w-3.5 text-muted-foreground" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                {t('home.feedbackTooltip')}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span className="whitespace-nowrap">02:00 PM</span>
                            <span>Audio is silent.</span>
                          </div>
                        </div>
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                        {t('home.hoverGuide1')}
                        <span className="font-medium text-foreground">
                          {t('nav.history')}
                        </span>
                        {t('home.hoverGuide2')}
                        <MessageCircleMore className="inline h-3 w-3 mx-0.5 align-text-bottom" />
                        {t('home.hoverGuide3')}
                      </p>
                    </HoverCardContent>
                  </HoverCard>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowTranscription(false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="px-3 pb-2.5">
                {lastRecord?.content ? (
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 select-text">
                    {lastRecord.content}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground/40 italic">{t('home.noTranscript')}</p>
                )}
              </div>
            </div>
          )}

          {/* 反馈输入区 */}
          <div className="px-4 pt-2 pb-1 flex-1">
            <Textarea
              placeholder={t('home.feedbackPlaceholder')}
              value={feedbackContent}
              onChange={(e) => setFeedbackContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.metaKey && !e.nativeEvent.isComposing) {
                  e.preventDefault()
                  handleSubmitFeedback()
                }
              }}
              className="min-h-[80px] resize-none border-none shadow-none focus-visible:ring-0 px-0 text-sm bg-transparent! placeholder:text-muted-foreground/50"
            />
          </div>

          {/* 附件预览 */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-1.5 px-4 pb-2">
              {attachments.map((item) => (
                <span
                  key={item.id}
                  className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground max-w-40"
                >
                  <span className="truncate">{item.file.name}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setAttachments((prev) => prev.filter((a) => a.id !== item.id))
                    }
                    className="flex-shrink-0 hover:text-foreground transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* 底部操作栏 */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-border/40">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,audio/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={createFeedback.isPending}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleSubmitFeedback}
              size="sm"
              variant="default"
              disabled={!feedbackContent.trim() || createFeedback.isPending}
              className="h-8 px-4 text-sm"
            >
              {createFeedback.isPending && <Spinner className="mr-1.5 h-3.5 w-3.5" />}
              {t('home.sendFeedback')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContentPage
