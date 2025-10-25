import { RouterProvider } from 'react-router'
import router from './routes'
import { ThemeProvider } from '@/components/theme-provider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useEffect } from 'react'
import useAuthStore from '@/store/auth-store'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      throwOnError: true,
    },
    mutations: {
      retry: false,
      onError: (err) => toast.error(err.message),
    },
  },
})

function App() {
  const initAuth = useAuthStore((state) => state.actions.initAuth)

  useEffect(() => {
    // 应用启动时从 electron-store 恢复认证状态
    initAuth()
  }, [initAuth])

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="app-ui-theme">
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
