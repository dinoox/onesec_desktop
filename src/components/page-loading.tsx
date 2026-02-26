import { Loader } from 'lucide-react'

export default function PageLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-secondary gap-2">
      <Loader className="animate-spin" />
      <p className="text-sm">加载中</p>
    </div>
  )
}
