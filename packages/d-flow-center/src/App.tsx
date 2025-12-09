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
      retry: 1,
      throwOnError: false,
      staleTime: 1 * 60 * 1000,
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
    initAuth().then()
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
