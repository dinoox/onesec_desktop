import React, { useMemo } from 'react'
import { Link, matchPath, useLocation } from 'react-router'
import { useTranslation } from 'react-i18next'
import { type NavItem, navMain, settingsNav } from '@/configs/navigation'
import { useUIActions } from '@/store/ui-store'
import { useEntitlementStatus } from '@/services/queries/user-query'
import { Button } from '@/components/ui/button'
import logo from '@/assets/images/logo.png'
import logoDark from '@/assets/images/logo-dark.png'
import { Badge } from './ui/badge'

function checkIsActive(href: string, item: NavItem) {
  if (matchPath({ path: item.url, end: true }, href)) return true
  if (item.subUrls) {
    for (let i in item.subUrls) {
      if (matchPath({ path: item.subUrls[i], end: true }, href)) return true
    }
  }
  return false
}

const AppSidebar: React.FC = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const { pathname } = location
  const settingsActive = checkIsActive(pathname, settingsNav)
  const { setSettingsDialogOpen } = useUIActions()
  const { data: entitlement } = useEntitlementStatus()

  const snapshot = useMemo(
    () => (entitlement?.snapshots ? [...entitlement.snapshots].pop() : null),
    [entitlement],
  )
  const isTrial = snapshot?.subscription_source === 'trial'
  const daysUsed = snapshot?.trial_days_used ?? 0
  const totalDays = snapshot?.total_trial_duration_days ?? 30
  const progressPercent = Math.min(Math.round((daysUsed / totalDays) * 100), 100)

  return (
    <div className="flex w-54 flex-col flex-none overflow-y-auto">
      {/* Sidebar Header - Logo */}
      <div className="app-drag-region p-3 pt-14 transition-colors duration-300">
        <div className="flex items-center gap-2 px-2 py-2">
          <img src={logo} alt="SaySo" className="w-18 dark:hidden" />
          <img src={logoDark} alt="SaySo" className="w-18 hidden dark:block" />
          {isTrial && (
            <Badge className="bg-blue-50 shadow-xs text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              Trial
            </Badge>
          )}
        </div>
      </div>

      {/* Sidebar Content - Navigation */}
      <nav className="px-3">
        {navMain.map((item) => {
          const isActive = checkIsActive(pathname, item)

          return (
            <Link
              key={item.url}
              to={item.url}
              data-theme-transition
              className={`flex items-center gap-3 px-3 py-2 rounded-md mb-1 transition-colors duration-300 ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'hover:bg-sidebar-accent/50'
              }`}
            >
              {item.icon && (
                <item.icon className={`w-4 h-4 ${isActive && 'flash-icon'}`} />
              )}
              <span className={`text-sm ${isActive && ''}`}>{t(item.title)}</span>
            </Link>
          )
        })}
      </nav>

      {/* Sidebar Footer - Trial Card + Settings */}
      <div className="mt-auto px-3 pb-3">
        {/* Trial Card */}
        {isTrial && (
          <div className="mb-2 animate-in fade-in-0 zoom-in-95 duration-300 rounded-lg bg-white dark:bg-muted/50 px-3 py-4">
            <p className="text-xs text-muted-foreground">{t('sidebar.trialPlan')}</p>
            <p className="mt-1 text-sm font-semibold">
              {t('sidebar.daysUsed', { used: daysUsed, total: totalDays })}
            </p>
            <div className="mt-2">
              <div className="h-1 w-full rounded-full bg-muted">
                <div
                  className="h-1 rounded-full bg-ripple-brand-text"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            <p className="mt-2.5 text-[11px] leading-relaxed text-muted-foreground">
              {t('sidebar.upgradeHint')}
            </p>
            <Button size="sm" className="mt-2 w-full">
              {t('sidebar.upgrade')}
            </Button>
          </div>
        )}

        {/* Divider */}
        <div className="my-2 border-t" />

        {/* Settings Link */}
        <button
          onClick={() => setSettingsDialogOpen(true)}
          data-theme-transition
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-300 ${
            settingsActive
              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
              : 'hover:bg-sidebar-accent/50'
          }`}
        >
          {settingsNav.icon && (
            <settingsNav.icon className={`w-4 h-4 ${settingsActive && 'flash-icon'}`} />
          )}
          <span className={`text-sm ${settingsActive && ''}`}>
            {t(settingsNav.title)}
          </span>
        </button>
      </div>
    </div>
  )
}

export default AppSidebar
