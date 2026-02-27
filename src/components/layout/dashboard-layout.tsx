import { Suspense } from 'react'
import { Outlet, useNavigation } from 'react-router'
import AppSidebar from '@/components/app-sidebar'
import Header from '@/components/header'
import PageLoading from '@/components/page-loading'
import AuthGuardContainer from '@/components/app/auth-guard-container'
import { SettingsDialog } from '@/components/settings-dialog'

export default function DashboardLayout() {
  const navigation = useNavigation()
  const isNavigating = Boolean(navigation.location)

  return (
    <AuthGuardContainer>
      <div className="flex h-screen overflow-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden pr-4 pb-4">
          <div className="flex-none app-drag-region">
            <Header />
          </div>
          <div className="flex-1 overflow-y-auto rounded-xl bg-white dark:bg-[#171717]">
            <div className="py-7 px-8 flex-1 flex flex-col relative">
              {isNavigating && <PageLoading />}
              <Suspense fallback={<PageLoading />}>
                <Outlet />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
      <SettingsDialog />
    </AuthGuardContainer>
  )
}
