import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group'
import { ChevronDown, Info, MessageCircleMore, Paperclip, X } from 'lucide-react'
import { useCreateFeedback } from '@/services/queries/dashboard-query'
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
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  IconBrandJavascript,
  IconCopy,
  IconCornerDownLeft,
  IconRefresh,
} from "@tabler/icons-react"

const ContentPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [feedbackContent, setFeedbackContent] = useState('')
  const [attachments, setAttachments] = useState<AttachmentItem[]>([])
  const [lastRecord, setLastRecord] = useState<Audios | null>(null)
  const [showTranscription, setShowTranscription] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
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
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 space-y-4 pb-3">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-semibold">{t('home.welcome')}</span>
          <div className="h-8 w-8"></div>
        </div>
        {/* 快捷提示 */}
        <Alert className="rounded-xl bg-setting px-4.5 py-3.5 border-none gap-1">
          <AlertTitle>{t('home.tagline')}</AlertTitle>
          <AlertDescription className="space-x-1.5">
            <span>{t('home.holdKey')}</span>
            <KeyDisplay keys={formattedKeys} className="bg-gray-200" />
            <span>{t('home.thenSpeak')}</span>
          </AlertDescription>
        </Alert>
      </div>

      {/* 反馈区域 */}
      <div className="mt-4 flex flex-col">
        <InputGroup className="overflow-hidden has-disabled:bg-transparent has-disabled:opacity-100 dark:has-disabled:bg-transparent border-border/50 has-[[data-slot=input-group-control]:focus-visible]:border-border/50">
          {/* 最后转录展示区（可关闭） */}
          {showTranscription && (
            <InputGroupAddon
              align="block-start"
              className="flex-col! items-stretch! gap-0! p-3! pb-1!"
            >
              <div className="rounded-lg bg-muted/50 border border-border/50">
                <div className="flex items-center justify-between px-3 pt-2 pb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[14px] text-foreground">
                      {t('home.lastTranscript')}
                    </span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 font-bold cursor-default" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-68">
                        <p>{t('home.tooltip')}</p>
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
                                <TooltipContent>{t('home.feedbackTooltip')}</TooltipContent>
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
                    <p className="text-sm font-normal text-muted-foreground  line-clamp-2 select-text">
                      {lastRecord.content}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground/40">
                      {t('home.noTranscript')}
                    </p>
                  )}
                </div>
              </div>
            </InputGroupAddon>
          )}

          {/* 反馈输入区 */}
          <InputGroupTextarea
            placeholder={t('home.feedbackPlaceholder')}
            value={feedbackContent}
            onChange={(e) => setFeedbackContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.metaKey && !e.nativeEvent.isComposing) {
                e.preventDefault()
                handleSubmitFeedback()
              }
            }}
            className="min-h-[105px] px-4  placeholder:text-placeholder"
          />

          {/* 附件预览 */}
          {attachments.length > 0 && (
            <div className="flex w-full flex-wrap gap-1.5 px-4 pb-2">
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
          <InputGroupAddon align="block-end" className="border-t border-border/50">
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
            <InputGroupButton
              onClick={handleSubmitFeedback}
              size="sm"
              variant="default"
              disabled={!feedbackContent.trim() || createFeedback.isPending}
              className="ml-auto"
            >
              {createFeedback.isPending && <Spinner className="mr-1.5 h-3.5 w-3.5" />}
              {t('home.sendFeedback')}
              <IconCornerDownLeft />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </div>
  )
}

export default ContentPage
