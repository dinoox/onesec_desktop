import { useMutation, useQuery } from '@tanstack/react-query'
import { getUsageStatistics, createFeedback } from '@/services/api/dashboard-api'
import { toast } from 'sonner'
import ipcService from '@/services/ipc-service'
import { type AttachmentItem, uploadToOss } from '@/utils/oss-upload'

const STATS_CACHE_KEY = 'usage-statistics-cache'

// 从 localStorage 读取缓存的统计数据
const getCachedStats = () => {
  try {
    const cached = localStorage.getItem(STATS_CACHE_KEY)
    return cached ? JSON.parse(cached) : null
  } catch {
    return null
  }
}

// 保存统计数据到 localStorage
const setCachedStats = (data: any) => {
  try {
    localStorage.setItem(STATS_CACHE_KEY, JSON.stringify(data))
  } catch {
    // 忽略存储错误
  }
}

export const useUsageStatistics = () => {
  return useQuery({
    queryKey: ['usage-statistics'],
    staleTime: 0,
    placeholderData: getCachedStats(), // 使用缓存数据作为占位
    queryFn: async () => {
      const resp = await getUsageStatistics()
      if (resp.code === 200 && resp.result) {
        setCachedStats(resp.result)
        return resp.result
      }
      return null
    },
  })
}

export const useCreateFeedback = () => {
  return useMutation({
    mutationFn: async ({
      content,
      attachments = [],
    }: {
      content: string
      attachments?: AttachmentItem[]
    }) => {
      const [info, ...uploadedUrls] = await Promise.all([
        ipcService.getSystemInfo(),
        ...attachments.map((item) => uploadToOss('feedback', item.file)),
      ])
      const image_urls: string[] = []
      const video_urls: string[] = []
      const audio_urls: string[] = []
      attachments.forEach((item, i) => {
        const url = uploadedUrls[i] as string
        if (item.kind === 'image') image_urls.push(url)
        else if (item.kind === 'video') video_urls.push(url)
        else audio_urls.push(url)
      })
      return createFeedback({
        content,
        app_version: info.appVersion,
        os: info.osVersion,
        image_urls,
        video_urls,
        audio_urls,
      })
    },
    onSuccess: (resp) => {
      if (resp.code === 200) {
        toast.success('反馈提交成功')
      } else {
        toast.error(resp.message || '提交失败')
      }
    },
  })
}
