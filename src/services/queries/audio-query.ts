import { useQuery, useMutation } from '@tanstack/react-query'
import { getAudios, reconvertAudio } from '@/services/api/audio-api'
import { toast } from 'sonner'

export const useGetAudios = () => {
  return useQuery({
    queryKey: ['audios'],
    staleTime: 0,
    queryFn: getAudios,
    placeholderData: [],
  })
}

export const useReconvertAudio = () => {
  return useMutation({
    mutationFn: (audioData: string) => reconvertAudio(audioData),
    onSuccess: (resp) => {
      if (resp.success) {
        toast.success('转换成功')
      } else {
        toast.error('转换失败')
      }
    },
  })
}
