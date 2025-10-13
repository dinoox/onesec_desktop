import React, { useState, useEffect, useRef } from 'react'
import { Kbd, KbdGroup } from '@/components/ui/kbd.tsx'
import ipcService from '@/services/ipc-service.ts'
import useStatusStore from '@/store/status-store.ts'
import useUserConfigStore from '@/store/user-config-store.ts'
import { useClickOutside } from '@/hooks/use-click-outside.ts'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'sonner'
import { HotkeyMode } from '../../../main/types/message.ts'

const ContestPage: React.FC = () => {
  const shortcutKeys = useUserConfigStore((state) => state.shortcutKeys)
  const shortcutCommandKeys = useUserConfigStore((state) => state.shortcutCommandKeys)
  const { setShortcutKeys, setShortcutCommandKeys, loadUserConfig, updateHotkeyConfig } =
    useUserConfigStore((state) => state.actions)

  const [editingMode, setEditingMode] = useState<'normal' | 'command' | null>(null)

  const normalInputRef = useRef<HTMLDivElement>(null)
  const commandInputRef = useRef<HTMLDivElement>(null)

  const hotkeySettingStatus = useStatusStore((state) => state.hotKeySettingStatus)
  const holdIPCMessage = useStatusStore((state) => state.holdIPCMessage)
  const { setHotkeySettingStatus } = useStatusStore.getState().actions

  useEffect(() => {
    loadUserConfig().then()
  }, [])

  useEffect(() => {
    const action = holdIPCMessage?.action
    const isHotkeyUpdate =
      action === 'hotkey_setting_update' || action === 'hotkey_setting_result'

    if (isHotkeyUpdate && holdIPCMessage?.data?.data) {
      const { mode, hotkey_combination } = holdIPCMessage.data.data

      if (hotkey_combination && Array.isArray(hotkey_combination)) {
        if (mode === 'normal') {
          setShortcutKeys(hotkey_combination)
        } else if (mode === 'command') {
          setShortcutCommandKeys(hotkey_combination)
        }
      }

      if (action === 'hotkey_setting_result') {
        setEditingMode(null)

        const otherModeKeys = mode === 'normal' ? shortcutCommandKeys : shortcutKeys
        const keysMatch =
          hotkey_combination.length === otherModeKeys.length &&
          hotkey_combination.every(
            (key: string, idx: number) => key === otherModeKeys[idx],
          )

        if (keysMatch) {
          loadUserConfig().then(() => toast.warning('快捷键设置冲突，请重新设置'))
        } else {
          updateHotkeyConfig(mode, hotkey_combination).then()
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
      const currentKeys = editingMode === 'normal' ? shortcutKeys : shortcutCommandKeys
      await ipcService.endHotkeySetting(editingMode, currentKeys)
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

  // 判断是否等待按键（刚开始设置，还没有按键）
  const isWaitingNormal =
    editingMode === 'normal' && hotkeySettingStatus === 'hotkey_setting'
  const isWaitingCommand =
    editingMode === 'command' && hotkeySettingStatus === 'hotkey_setting'

  useClickOutside([normalInputRef, commandInputRef], endHotKeySetting, !!editingMode)

  return (
    <div className="max-w-1/2 flex flex-col justify-between gap-5">
      <div className="mb-3 flex flex-col justify-between space-y-2 gap-x-4">
        <div className="flex flex-col justify-center  space-y-2">
          <span className="text-base font-medium">普通模式</span>
          <span className="text-sm text-muted-foreground">
            按住该快捷键会进入普通识别模式
          </span>
        </div>
        <div
          ref={normalInputRef}
          onClick={async () => {
            await startHotKeySetting('normal')
          }}
          className="border-input flex h-9 w-full items-center gap-2 rounded-md border bg-transparent px-3 shadow-xs transition-colors duration-300 cursor-pointer"
          style={isEditingNormal ? { borderColor: 'var(--color-ripple-green)' } : {}}
          tabIndex={0}
        >
          {isWaitingNormal ? (
            <span className="text-muted-foreground text-sm">等待按键...</span>
          ) : (
            <KbdGroup>
              <AnimatePresence mode="popLayout">
                {shortcutKeys.map((key, index) => (
                  <motion.div
                    key={`${key}-${index}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    style={{ display: 'inline-flex' }}
                  >
                    <Kbd>{key}</Kbd>
                  </motion.div>
                ))}
              </AnimatePresence>
            </KbdGroup>
          )}
          <span className="text-muted-foreground text-sm ml-auto">点击修改</span>
        </div>
      </div>

      <div className="mb-3 flex flex-col justify-between space-y-2 gap-x-4">
        <div className="flex flex-col justify-center  space-y-2">
          <span className="text-base font-medium">命令模式</span>
          <span className="text-sm text-muted-foreground">
            按住该快捷键会进入命令识别和智能交互模式
          </span>
        </div>
        <div
          ref={commandInputRef}
          className="border-input flex h-9 w-full items-center gap-2 rounded-md border bg-transparent px-3 shadow-xs transition-colors duration-300 cursor-pointer"
          style={isEditingCommand ? { borderColor: 'var(--color-ripple-yellow)' } : {}}
          tabIndex={0}
          onClick={async () => {
            await startHotKeySetting('command')
          }}
        >
          {isWaitingCommand ? (
            <span className="text-muted-foreground text-sm">等待按键...</span>
          ) : (
            <KbdGroup>
              <AnimatePresence mode="popLayout">
                {shortcutCommandKeys.map((key, index) => (
                  <motion.div
                    key={`${key}-${index}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    style={{ display: 'inline-flex' }}
                  >
                    <Kbd>{key}</Kbd>
                  </motion.div>
                ))}
              </AnimatePresence>
            </KbdGroup>
          )}
          <span className="text-muted-foreground text-sm ml-auto">点击修改</span>
        </div>
      </div>

      {/*<div>*/}
      {/*  <span>{hotkeySettingStatus}</span>*/}
      {/*  <span>{JSON.stringify(holdIPCMessage)}</span>*/}
      {/*</div>*/}
    </div>
  )
}

export default ContestPage
