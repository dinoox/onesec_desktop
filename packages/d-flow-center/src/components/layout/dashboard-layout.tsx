import { Outlet, useNavigation } from 'react-router'
import AppSidebar from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import Header from '@/components/header'
import PageLoading from '@/components/page-loading'
import Footer from '@/components/footer'
import AuthGuardContainer from '@/components/app/auth-guard-container'

export default function DashboardLayout() {
  const navigation = useNavigation()
  const isNavigating = Boolean(navigation.location)

  return (
    <AuthGuardContainer>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <SidebarInset className="overflow-hidden h-screen">
          <Header />
          <div className="p-4 flex grow flex-col overflow-hidden">
            {isNavigating && <PageLoading />}
            <Outlet />
          </div>
          <Footer />
        </SidebarInset>
      </SidebarProvider>
    </AuthGuardContainer>
  )
}
