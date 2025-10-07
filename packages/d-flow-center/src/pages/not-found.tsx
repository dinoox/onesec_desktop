import { Button } from '@/components/ui/button.tsx'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <p className="font-semibold text-5xl text-primary">404</p>
      <h1 className="text-xl">抱歉，你访问的页面不存在</h1>
      <p className="text-base text-muted-foreground">网址已失效</p>
      <div className="flex items-center justify-center gap-4 text-sm">
        <Button size="sm" onClick={() => window.history.back()} className="cursor-pointer">
          返回上一页
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => location.reload()}
          className="cursor-pointer"
        >
          刷新一下
        </Button>
      </div>
    </div>
  )
}
