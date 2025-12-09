import React, { useState, useMemo } from 'react'
import { LockIcon, Copy, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { useGetRecentRecords } from '@/services/queries/audio-query'
import { AudioRecord } from '@/services/api/audio-api'

const formatDateGroup = (dateStr: string): string => {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()

  if (isSameDay(date, today)) return '今天'
  if (isSameDay(date, yesterday)) return '昨天'
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

const getDateKey = (dateStr: string): string => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

const HistoryPage: React.FC = () => {
  const { data: records = [], isLoading } = useGetRecentRecords()
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const handleCopy = (id: number, content: string) => {
    if (copiedId === id) return
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 3000)
  }

  const getDisplayText = (record: AudioRecord) => {
    return record.model_processed_text || record.recognized_text || '无内容'
  }

  const groupedRecords = useMemo(() => {
    const groups: { key: string; label: string; records: AudioRecord[] }[] = []
    const groupMap = new Map<string, AudioRecord[]>()

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

  return (
    <div className="max-w-2xl space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[15px] font-medium">历史记录</span>
      </div>

      {/*<div className="space-y-3">*/}
      {/*  <div className="flex items-center  bg-setting rounded-xl px-4 py-4">*/}
      {/*    <LockIcon className="w-4 h-4  mr-3" />*/}
      {/*    <div className="flex flex-col gap-1">*/}
      {/*      <span>您的数据保持私密</span>*/}
      {/*      <p className="text-sm text-muted-foreground">*/}
      {/*        您的语音口述是私密的，零数据保留。它们仅存储在您的设备上，无法从其他地方访问*/}
      {/*      </p>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</div>*/}

      <div className="space-y-6 mt-6 relative">
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
            groupedRecords.map((group) => (
              <div key={group.key}>
                <div className="text-xs text-muted-foreground mb-2">{group.label}</div>
                <div className="border rounded-lg">
                  {group.records.map((record) => (
                    <div
                      key={record.id}
                      className="group flex items-center gap-3 border-b pl-4 pr-5 py-3 hover:bg-muted/50 transition-colors last:border-b-0"
                    >
                      <span className="text-xs text-muted-foreground w-[70px] flex-shrink-0 pt-0.5 tabular-nums">
                        {formatTime(record.created_at)}
                      </span>
                      <div className="flex-1 min-w-0 text-sm">
                        {getDisplayText(record)}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-3 w-3 relative text-muted-foreground/80"
                              disabled={copiedId === record.id}
                              onClick={() =>
                                handleCopy(record.id, getDisplayText(record))
                              }
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
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">暂无历史记录</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HistoryPage
