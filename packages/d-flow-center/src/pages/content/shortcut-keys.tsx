import React, { useState, useEffect, useRef, useMemo } from 'react'
import { KbdGroup } from '@/components/ui/kbd.tsx'
import ipcService from '@/services/ipc-service.ts'
import useStatusStore from '@/store/status-store.ts'
import useUserConfigStore from '@/store/user-config-store.ts'
import { useClickOutside } from '@/hooks/use-click-outside.ts'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'sonner'
import { HotkeyMode, MessageTypes } from '../../../main/types/message.ts'
import { KeyMapper } from '@/utils/key.ts'
import { KeyDisplay } from '@/components/ui/key-display.tsx'
import { PopcornIcon } from 'lucide-react'

const ContentPage: React.FC = () => {
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
    loadUserConfig().then()
  }, [])

  useEffect(() => {
    const action = holdIPCMessage?.action
    const isHotkeyUpdate =
      action === MessageTypes.HOTKEY_SETTING_UPDATE ||
      action === MessageTypes.HOTKEY_SETTING_RESULT

    if (isHotkeyUpdate && holdIPCMessage?.data?.data) {
      const { mode, hotkey_combination } = holdIPCMessage.data.data

      if (hotkey_combination && Array.isArray(hotkey_combination)) {
        if (mode === 'normal') {
          setShortcutKeys(hotkey_combination)
        } else if (mode === 'command') {
          setShortcutCommandKeys(hotkey_combination)
        } else if (mode === 'free') {
          setShortcutFreeKeys(hotkey_combination)
        }
      }

      if (action === 'hotkey_setting_result') {
        setEditingMode(null)

        const { is_conflict } = holdIPCMessage.data.data
        if (is_conflict) {
          loadUserConfig().then(() => toast.warning('快捷键设置冲突，请重新设置'))
        }
      }
    }
  }, [holdIPCMessage])

  const startHotKeySetting = async (mode: HotkeyMode) => {
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

  // 判断是否正在编辑
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

  // 判断是否等待按键（刚开始设置，还没有按键）
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
    <div className="max-w-1/2 flex flex-col justify-between gap-5">
      <div className="mb-3 flex flex-col justify-between space-y-2 gap-x-4">
        <div className="flex flex-col justify-center space-y-1">
          <span className="text-[15px] font-medium">普通模式</span>
          <span className="text-sm text-muted-foreground">
            按住该快捷键会进入普通识别模式，双击进入免提模式
          </span>
        </div>
        <div
          ref={normalInputRef}
          onClick={async () => {
            await startHotKeySetting('normal')
          }}
          className="border-input flex h-9 w-full items-center gap-2 rounded-md border bg-transparent px-3 shadow-xs transition-colors duration-300 cursor-pointer"
          style={isEditingNormal ? { borderColor: 'var(--color-ripple-green-text)' } : {}}
          tabIndex={0}
        >
          <div className="grid [&>*]:col-start-1 [&>*]:row-start-1 items-center">
            <AnimatePresence initial={false}>
              {isWaitingNormal && (
                <motion.span
                  key="waiting-normal"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-muted-foreground text-sm"
                >
                  等待按键...
                </motion.span>
              )}
              {!isWaitingNormal && (
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
                修改
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mb-3 flex flex-col justify-between space-y-2 gap-x-4">
        <div className="flex flex-col justify-center  space-y-1">
          <span className="text-[15px] font-medium">命令模式</span>
          <span className="text-sm text-muted-foreground">
            按住该快捷键会进入命令识别和智能交互模式
          </span>
        </div>
        <div
          ref={commandInputRef}
          className="border-input flex h-9 w-full items-center gap-2 rounded-md border bg-transparent px-3 shadow-xs transition-colors duration-300 cursor-pointer"
          style={
            isEditingCommand ? { borderColor: 'var(--color-ripple-yellow-text)' } : {}
          }
          tabIndex={0}
          onClick={async () => {
            await startHotKeySetting('command')
          }}
        >
          <div className="grid [&>*]:col-start-1 [&>*]:row-start-1 items-center">
            <AnimatePresence initial={false}>
              {isWaitingCommand && (
                <motion.span
                  key="waiting-command"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-muted-foreground text-sm"
                >
                  等待按键...
                </motion.span>
              )}
              {!isWaitingCommand && (
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
                修改
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mb-3 flex flex-col justify-between space-y-2 gap-x-4">
        <div className="flex flex-col justify-center space-y-1">
          <span className="text-[15px] font-medium">免提模式</span>
          <span className="text-sm text-muted-foreground">
            按一次开始说话，无需持续按住，再按一次结束录音
          </span>
        </div>
        <div
          ref={freeInputRef}
          onClick={async () => {
            await startHotKeySetting('free')
          }}
          className="border-input flex h-9 w-full items-center gap-2 rounded-md border bg-transparent px-3 shadow-xs transition-colors duration-300 cursor-pointer"
          style={isEditingFree ? { borderColor: 'var(--color-ripple-green-text)' } : {}}
          tabIndex={0}
        >
          <div className="grid [&>*]:col-start-1 [&>*]:row-start-1 items-center">
            <AnimatePresence initial={false}>
              {isWaitingFree && (
                <motion.span
                  key="waiting-free"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-muted-foreground text-sm"
                >
                  等待按键...
                </motion.span>
              )}
              {!isWaitingFree && (
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
                修改
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="border-none text-ripple-brand-text flex h-9 w-full justify-center items-center gap-2 rounded-md border bg-ripple-brand-text/10 px-3 shadow-none transition-colors duration-300">
        <PopcornIcon size="16" />
        <span className="">单次录音限时 5 分钟，超时自动结束并上传</span>
      </div>
    </div>
  )
}

export default ContentPage
