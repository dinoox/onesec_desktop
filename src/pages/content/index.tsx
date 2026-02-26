import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Paperclip, SendHorizonal, X } from 'lucide-react'
import { IconMessageChatbot } from '@tabler/icons-react'
import { useCreateFeedback, useUsageStatistics } from '@/services/queries/dashboard-query'
import { Spinner } from '@/components/ui/spinner'
import useUserConfigStore from '@/store/user-config-store'
import { KeyMapper } from '@/utils/key'
import useStatusStore from '@/store/status-store'
import { throttledUpdateDeviceInfo } from '@/utils/device'
import { KeyDisplay } from '@/components/ui/key-display.tsx'
import { type AttachmentItem, getAttachmentKind } from '@/utils/oss-upload'
import { toast } from 'sonner'

const ContentPage: React.FC = () => {
  const [feedbackContent, setFeedbackContent] = useState('')
  const [isFeedbackFocused, setIsFeedbackFocused] = useState(false)
  const [attachments, setAttachments] = useState<AttachmentItem[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const {
    data: stats,
    isLoading: statsLoading,
    isFetching: statsFetching,
    refetch: refetchStats,
  } = useUsageStatistics()
  const createFeedback = useCreateFeedback()

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
    }
  }, [holdIPCMessage])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const existingKeys = new Set(attachments.map((a) => `${a.file.name}|${a.file.size}`))
    const newItems: AttachmentItem[] = []
    for (const file of files) {
      const kind = getAttachmentKind(file)
      if (!kind) { toast.warning(`不支持的文件类型: ${file.name}`); continue }
      if (existingKeys.has(`${file.name}|${file.size}`)) continue
      newItems.push({ id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, file, kind })
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
          <span className="text-2xl font-semibold">欢迎回来！</span>
          <div className="h-8 w-8"></div>
        </div>
        {/* 快捷提示 */}
        <div className="flex items-center justify-between bg-setting rounded-xl px-5 py-4">
          <div className="flex items-center">
            <div className="flex flex-col gap-1">
              <span className="font-medium">
                无需切换窗口，只要语音唤起，立刻解决问题
              </span>
              <div className="text-sm text-muted-foreground space-x-1">
                <span>按住</span>
                <KeyDisplay keys={formattedKeys} />
                <span>键，并在任何文本框中说话，松开结束</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3"></div>
        </div>
      </div>

      {/* 反馈与建议 */}
      <div className="flex-1 min-h-0 mt-4 flex flex-col">
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <span className="text-[15px] font-medium">反馈与建议</span>
        </div>

        <div
          className={`rounded-lg border text-card-foreground px-3 py-2 flex-shrink-0 shadow-black/10 transition-colors ${isFeedbackFocused ? 'border-black/30' : ''}`}
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
              size="icon-sm"
              variant="ghost"
              onClick={() => fileInputRef.current?.click()}
              disabled={createFeedback.isPending}
              className="h-8 rounded-full"
            >
              <Paperclip className="h-4 w-4 text-muted-foreground" />
            </Button>
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
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-border/50">
              {attachments.map((item) => (
                <span
                  key={item.id}
                  className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground max-w-40"
                >
                  <span className="truncate">{item.file.name}</span>
                  <button
                    type="button"
                    onClick={() => setAttachments((prev) => prev.filter((a) => a.id !== item.id))}
                    className="flex-shrink-0 hover:text-foreground transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ContentPage
