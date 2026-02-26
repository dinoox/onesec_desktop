import { Suspense } from 'react'
import { Outlet, useNavigation } from 'react-router'
import AppSidebar from '@/components/app-sidebar'
import Header from '@/components/header'
import PageLoading from '@/components/page-loading'
import Footer from '@/components/footer'
import AuthGuardContainer from '@/components/app/auth-guard-container'

export default function DashboardLayout() {
  const navigation = useNavigation()
  const isNavigating = Boolean(navigation.location)

  return (
    <AuthGuardContainer>
      <div className="flex flex-col h-screen overflow-hidden">
        <div className="flex-none app-drag-region">
          <Header />
        </div>

        <div className="flex flex-1 overflow-hidden">
          <AppSidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="py-4 px-4.5 flex-1 flex flex-col overflow-y-auto relative">
              {isNavigating && <PageLoading />}
              <Suspense fallback={<PageLoading />}>
                <Outlet />
              </Suspense>
            </div>
            <Footer />
          </div>
        </div>
      </div>
    </AuthGuardContainer>
  )
}
