import { type ErrorResponse, isRouteErrorResponse, useRouteError } from 'react-router'
import { Button } from '@/components/ui/button.tsx'

export default function ErrorBoundary() {
  const error = useRouteError()
  let errMessage = '未知错误'
  if (isRouteErrorResponse(error)) {
    errMessage = (error as ErrorResponse).statusText
  } else if (error instanceof Error) {
    errMessage = error.message
  }
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="font-semibold text-5xl text-primary">500</h1>
      <h3 className="text-xl">抱歉，出错了，请稍后重试</h3>
      <p className="text-base text-muted-foreground">{errMessage}</p>
      <div className="flex items-center justify-center gap-4 text-sm">
        <Button
          size="sm"
          onClick={() => window.history.back()}
          className="cursor-pointer"
        >
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
