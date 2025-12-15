import { RouterProvider } from 'react-router'
import router from './routes'
import { ThemeProvider } from '@/components/theme-provider'
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { useEffect } from 'react'
import useAuthStore from '@/store/auth-store'

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      if (
        !navigator.onLine ||
        error.message.includes('fetch') ||
        error.message.includes('Network')
      ) {
        // toast.error('网络不可用')
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      if (
        !navigator.onLine ||
        error.message.includes('fetch') ||
        error.message.includes('Network')
      ) {
        // toast.error('网络不可用')
      }
    },
  }),
  defaultOptions: {
    queries: {
      retry: 1,
      throwOnError: false,
      staleTime: 1 * 60 * 1000,
      networkMode: 'always',
    },
    mutations: {
      retry: false,
      networkMode: 'always',
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
