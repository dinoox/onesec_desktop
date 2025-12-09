import { useQuery } from '@tanstack/react-query'
import { getRecentRecords } from '@/services/api/audio-api'

export const useGetRecentRecords = () => {
  return useQuery({
    queryKey: ['recent-records'],
    staleTime: 0,
    queryFn: async () => {
      const resp = await getRecentRecords()
      if (!resp.success) throw new Error(resp.message)
      return resp.data?.records || []
    },
  })
}


