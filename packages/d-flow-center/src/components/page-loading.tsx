import { Loader } from 'lucide-react'

export default function PageLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-2">
      <Loader className="animate-spin text-primary" />
      <p className="text-sm">加载中...</p>
    </div>
  )
}
