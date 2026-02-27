import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ExternalLink, Info, Settings2, SlidersHorizontal, User, X } from 'lucide-react'
import { Label } from '@radix-ui/react-label'
import { Input } from '@/components/ui/input.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Spinner } from '@/components/ui/spinner.tsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/pure-select.tsx'
import { useTheme } from '@/components/theme-provider.tsx'
import useUIStore, { useUIActions } from '@/store/ui-store.ts'
import useAuthStore from '@/store/auth-store.ts'
import useUserConfigStore, { useUserConfigActions } from '@/store/user-config-store.ts'
import useStatusStore from '@/store/status-store.ts'
import { useLogoutQuery } from '@/services/queries/auth-query.ts'
import ipcService from '@/services/ipc-service.ts'
import { uploadErrorLog } from '@/services/api/error-log-api.ts'
import { toast } from 'sonner'
import { useClickOutside } from '@/hooks/use-click-outside.ts'
import { MessageTypes } from '../../main/types/message.ts'
import { KeyMapper } from '@/utils/key.ts'
import { KeyDisplay } from '@/components/ui/key-display.tsx'
import { IconGitBranch, IconRefresh } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import i18n from '@/i18n'

type Tab = 'account' | 'general' | 'shortcuts' | 'about'

export const SettingsDialog: React.FC = () => {
  const { t } = useTranslation()
  const settingsDialogOpen = useUIStore((state) => state.settingsDialogOpen)
  const { setSettingsDialogOpen } = useUIActions()
  const [activeTab, setActiveTab] = useState<Tab>('account')

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'account', label: t('settings.tabs.account'), icon: <User className="h-4 w-4" /> },
    {
      key: 'general',
      label: t('settings.tabs.general'),
      icon: <SlidersHorizontal className="h-4 w-4" />,
    },
    {
      key: 'shortcuts',
      label: t('settings.tabs.shortcuts'),
      icon: <Settings2 className="h-4 w-4" />,
    },
    { key: 'about', label: t('settings.tabs.about'), icon: <Info className="h-4 w-4" /> },
  ]

  return (
    <AnimatePresence>
      {settingsDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50"
            onClick={() => setSettingsDialogOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white dark:bg-black rounded-lg border border-border shadow-lg w-full max-w-2xl h-[68vh] flex"
          >
            <button
              onClick={() => setSettingsDialogOpen(false)}
              className="absolute top-4 right-4 opacity-50 hover:opacity-100 transition-opacity z-10"
            >
              <X className="h-[18px] w-[18px]" />
            </button>

            {/* 左侧导航 */}
            <div className="w-46 flex-none border-r border-border  flex flex-col pt-10 pb-4 px-2">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-3 text-left px-3 py-2 rounded-md text-sm transition-colors mb-0.5 ${
                    activeTab === tab.key
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                      : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 右侧内容 */}
            <div className="flex-1 overflow-y-auto px-6 py-5 mt-1">
              {activeTab === 'account' && <AccountTab />}
              {activeTab === 'general' && <GeneralTab />}
              {activeTab === 'shortcuts' && <ShortcutsTab />}
              {activeTab === 'about' && <AboutTab />}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function AccountTab() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const mutation = useLogoutQuery()
  const { theme, setTheme } = useTheme()
  const showComparison = useUserConfigStore((state) => state.showComparison)
  const hideStatusPanel = useUserConfigStore((state) => state.hideStatusPanel)
  const { setShowComparison, setHideStatusPanel } = useUserConfigActions()
  const [uploadingLog, setUploadingLog] = useState(false)
  const { setSettingsDialogOpen } = useUIActions()

  async function logout() {
    await mutation.mutateAsync()
    setSettingsDialogOpen(false)
  }

  async function handleUploadLog() {
    setUploadingLog(true)
    try {
      const res = await uploadErrorLog(await ipcService.readErrorLog())
      if (res.success) {
        toast.success(t('settings.logUploadSuccess'))
      } else {
        toast.error(res.message || t('settings.uploadFailed'))
      }
    } catch {
      toast.error(t('settings.uploadFailed'))
    } finally {
      setUploadingLog(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col space-y-2">
        <div className="text-[15px] font-medium">{t('settings.accountTitle')}</div>
        <div className="flex items-center justify-between w-full bg-setting rounded-xl px-3 py-3">
          <Label>{t('settings.email')}</Label>
          <span className="text-sm text-muted-foreground">
            {user?.email || t('settings.emailNotSet')}
          </span>
        </div>

        <div className="flex items-center justify-between w-full bg-setting rounded-xl p-3">
          <Label>{t('settings.theme')}</Label>
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger>
              <SelectValue placeholder={t('settings.themeSelect')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">{t('settings.themeLight')}</SelectItem>
              <SelectItem value="dark">{t('settings.themeDark')}</SelectItem>
              <SelectItem value="system">{t('settings.themeSystem')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between w-full bg-setting rounded-xl p-3">
          <div className="flex flex-col space-y-1">
            <Label>{t('settings.subscription')}</Label>
            <span className="text-muted-foreground text-sm">{t('settings.trialPro')}</span>
          </div>
          <Button variant="outline" className="" size="sm">
            <IconGitBranch />
            {t('settings.upgrade')}
          </Button>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={logout}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? <Spinner /> : null}
          {t('settings.logout')}
        </Button>
      </div>
    </div>
  )
}

function GeneralTab() {
  const { t } = useTranslation()

  return (
    <div className="space-y-3">
      <div className="text-[15px] font-medium">{t('settings.generalTitle')}</div>
      <div className="flex items-center justify-between w-full bg-setting rounded-xl p-3">
        <Label>{t('settings.language')}</Label>
        <Select
          value={i18n.language}
          onValueChange={(v) => {
            i18n.changeLanguage(v)
            localStorage.setItem('lang', v)
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="zh">{t('settings.lang.zh')}</SelectItem>
            <SelectItem value="en">{t('settings.lang.en')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

function ShortcutsTab() {
  const { t } = useTranslation()
  const shortcutKeys = useUserConfigStore((state) => state.shortcutKeys)
  const shortcutCommandKeys = useUserConfigStore((state) => state.shortcutCommandKeys)
  const shortcutFreeKeys = useUserConfigStore((state) => state.shortcutFreeKeys)
  const { setShortcutKeys, setShortcutCommandKeys, setShortcutFreeKeys, loadUserConfig } =
    useUserConfigStore((state) => state.actions)

  const [editingMode, setEditingMode] = useState<'normal' | 'command' | 'free' | null>(
    null,
  )

  const normalInputRef = useRef<HTMLDivElement>(null)
  const commandInputRef = useRef<HTMLDivElement>(null)
  const freeInputRef = useRef<HTMLDivElement>(null)

  const hotkeySettingStatus = useStatusStore((state) => state.hotKeySettingStatus)
  const holdIPCMessage = useStatusStore((state) => state.holdIPCMessage)
  const { setHotkeySettingStatus } = useStatusStore.getState().actions

  useEffect(() => {
    loadUserConfig()
  }, [])

  useEffect(() => {
    const action = holdIPCMessage?.action
    const isHotkeyUpdate =
      action === MessageTypes.HOTKEY_SETTING_UPDATE ||
      action === MessageTypes.HOTKEY_SETTING_RESULT

    if (isHotkeyUpdate && holdIPCMessage?.data?.data) {
      const { mode, hotkey_combination } = holdIPCMessage.data.data

      if (hotkey_combination && Array.isArray(hotkey_combination)) {
        if (mode === 'normal') setShortcutKeys(hotkey_combination)
        else if (mode === 'command') setShortcutCommandKeys(hotkey_combination)
        else if (mode === 'free') setShortcutFreeKeys(hotkey_combination)
      }

      if (action === 'hotkey_setting_result') {
        setEditingMode(null)
        const { is_conflict } = holdIPCMessage.data.data
        if (is_conflict) {
          loadUserConfig().then(() => toast.warning(t('settings.conflictWarning')))
        }
      }
    }
  }, [holdIPCMessage])

  const startHotKeySetting = async (mode: 'normal' | 'command' | 'free') => {
    setEditingMode(mode)
    await ipcService.startHotkeySetting(mode)
    setHotkeySettingStatus('hotkey_setting')
  }

  const endHotKeySetting = async () => {
    if (
      editingMode &&
      (hotkeySettingStatus === 'hotkey_setting' ||
        hotkeySettingStatus === 'hotkey_setting_update')
    ) {
      await loadUserConfig()
      await ipcService.endHotkeySetting(editingMode)
      setEditingMode(null)
      setHotkeySettingStatus('idle')
    }
  }

  const isEditingNormal =
    editingMode === 'normal' &&
    (hotkeySettingStatus === 'hotkey_setting' ||
      hotkeySettingStatus === 'hotkey_setting_update')
  const isEditingCommand =
    editingMode === 'command' &&
    (hotkeySettingStatus === 'hotkey_setting' ||
      hotkeySettingStatus === 'hotkey_setting_update')
  const isEditingFree =
    editingMode === 'free' &&
    (hotkeySettingStatus === 'hotkey_setting' ||
      hotkeySettingStatus === 'hotkey_setting_update')

  const isWaitingNormal =
    editingMode === 'normal' && hotkeySettingStatus === 'hotkey_setting'
  const isWaitingCommand =
    editingMode === 'command' && hotkeySettingStatus === 'hotkey_setting'
  const isWaitingFree = editingMode === 'free' && hotkeySettingStatus === 'hotkey_setting'

  useClickOutside(
    [normalInputRef, commandInputRef, freeInputRef],
    endHotKeySetting,
    !!editingMode,
  )

  const formattedNormalKeys = useMemo(
    () => KeyMapper.formatKeys(shortcutKeys),
    [shortcutKeys],
  )
  const formattedCommandKeys = useMemo(
    () => KeyMapper.formatKeys(shortcutCommandKeys),
    [shortcutCommandKeys],
  )
  const formattedFreeKeys = useMemo(
    () => KeyMapper.formatKeys(shortcutFreeKeys),
    [shortcutFreeKeys],
  )

  return (
    <div className="flex flex-col gap-5">
      {/* 普通模式 */}
      <div className="flex flex-col space-y-2">
        <div className="flex flex-col space-y-1">
          <span className="text-[15px] font-medium">{t('settings.normalMode')}</span>
          <span className="text-sm text-muted-foreground">{t('settings.normalModeDesc')}</span>
        </div>
        <div
          ref={normalInputRef}
          onClick={() => startHotKeySetting('normal')}
          className="border-input flex h-9 w-full items-center gap-2 rounded-md border bg-transparent px-3 shadow-xs transition-colors duration-300 cursor-pointer"
          style={isEditingNormal ? { borderColor: 'var(--color-ripple-green-text)' } : {}}
          tabIndex={0}
        >
          <div className="grid [&>*]:col-start-1 [&>*]:row-start-1 items-center">
            <AnimatePresence initial={false}>
              {isWaitingNormal ? (
                <motion.span
                  key="waiting-normal"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-muted-foreground text-sm"
                >
                  {t('settings.waitingKey')}
                </motion.span>
              ) : (
                <motion.div
                  key="keys-normal"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <KeyDisplay keys={formattedNormalKeys} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <AnimatePresence>
            {!isWaitingNormal && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="text-muted-foreground text-sm ml-auto"
              >
                {t('settings.modify')}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 智能模式 */}
      <div className="flex flex-col space-y-2">
        <div className="flex flex-col space-y-1">
          <span className="text-[15px] font-medium">{t('settings.commandMode')}</span>
          <span className="text-sm text-muted-foreground">{t('settings.commandModeDesc')}</span>
        </div>
        <div
          ref={commandInputRef}
          className="border-input flex h-9 w-full items-center gap-2 rounded-md border bg-transparent px-3 shadow-xs transition-colors duration-300 cursor-pointer"
          style={
            isEditingCommand ? { borderColor: 'var(--color-ripple-yellow-text)' } : {}
          }
          tabIndex={0}
          onClick={() => startHotKeySetting('command')}
        >
          <div className="grid [&>*]:col-start-1 [&>*]:row-start-1 items-center">
            <AnimatePresence initial={false}>
              {isWaitingCommand ? (
                <motion.span
                  key="waiting-command"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-muted-foreground text-sm"
                >
                  {t('settings.waitingKey')}
                </motion.span>
              ) : (
                <motion.div
                  key="keys-command"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <KeyDisplay keys={formattedCommandKeys} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <AnimatePresence>
            {!isWaitingCommand && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="text-muted-foreground text-sm ml-auto"
              >
                {t('settings.modify')}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 薯片模式 */}
      <div className="flex flex-col space-y-2">
        <div className="flex flex-col space-y-1">
          <span className="text-[15px] font-medium">{t('settings.freeMode')}</span>
          <span className="text-sm text-muted-foreground">{t('settings.freeModeDesc')}</span>
        </div>
        <div
          ref={freeInputRef}
          onClick={() => startHotKeySetting('free')}
          className="border-input flex h-9 w-full items-center gap-2 rounded-md border bg-transparent px-3 shadow-xs transition-colors duration-300 cursor-pointer"
          style={isEditingFree ? { borderColor: 'var(--color-ripple-green-text)' } : {}}
          tabIndex={0}
        >
          <div className="grid [&>*]:col-start-1 [&>*]:row-start-1 items-center">
            <AnimatePresence initial={false}>
              {isWaitingFree ? (
                <motion.span
                  key="waiting-free"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-muted-foreground text-sm"
                >
                  {t('settings.waitingKey')}
                </motion.span>
              ) : (
                <motion.div
                  key="keys-free"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <KeyDisplay keys={formattedFreeKeys} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <AnimatePresence>
            {!isWaitingFree && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="text-muted-foreground text-sm ml-auto"
              >
                {t('settings.modify')}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function AboutTab() {
  const { t } = useTranslation()
  const [appVersion, setAppVersion] = useState<string>('')

  useEffect(() => {
    ipcService.getSystemInfo().then((info) => setAppVersion(info.appVersion))
  }, [])

  const links = [
    { label: t('settings.privacy'), url: 'https://sayso.ai/privacy' },
    { label: t('settings.terms'), url: 'https://sayso.ai/terms' },
  ]

  return (
    <div className="space-y-2">
      <div className="text-[15px] font-medium">{t('settings.aboutTitle')}</div>
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between w-full bg-setting rounded-xl p-3">
          <div className="flex flex-col space-y-1">
            <Label>{t('settings.version')}</Label>
            <span className="text-muted-foreground text-sm">
              {appVersion ? `v${appVersion}` : '—'}
            </span>
          </div>
          <Button variant="outline" className="" size="sm">
            <IconRefresh />
            {t('settings.checkUpdate')}
          </Button>
        </div>
        {links.map((link) => (
          <button
            key={link.url}
            onClick={() => ipcService.openExternalUrl(link.url)}
            className="flex items-center justify-between w-full bg-setting rounded-xl px-4 py-3 hover:bg-setting/80 transition-colors text-left group"
          >
            <span className="text-sm">{link.label}</span>
            <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
        ))}
      </div>
    </div>
  )
}
