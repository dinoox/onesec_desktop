import React, { useState, useEffect, useRef } from 'react'
import { Kbd, KbdGroup } from '@/components/ui/kbd.tsx'
import useUserConfigStore from '@/store/user-config-store.ts'
import { AnimatePresence, motion } from 'framer-motion'
import { getKeyDisplayText } from '@/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx'
import { PopcornIcon, X } from 'lucide-react'

const ContestPage: React.FC = () => {
  const shortcutKeys = useUserConfigStore((state) => state.shortcutKeys)
  const shortcutCommandKeys = useUserConfigStore((state) => state.shortcutCommandKeys)
  const { loadUserConfig } = useUserConfigStore((state) => state.actions)

  const [editingMode, setEditingMode] = useState<'normal' | 'command' | null>(null)

  const normalInputRef = useRef<HTMLDivElement>(null)
  const commandInputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadUserConfig().then()
  }, [])

  return (
    <div className="max-w-1/2 flex flex-col justify-between gap-5">
      <div className="mb-3 flex flex-col justify-between space-y-2 gap-x-4">
        <div className="flex flex-col justify-center space-y-1">
          <span className="font-medium">普通模式</span>
          <span className="text-sm text-muted-foreground">
            按住该快捷键会进入普通识别模式
          </span>
        </div>
        <div
          ref={normalInputRef}
          className="border-input flex h-9 w-full items-center gap-2 rounded-md border bg-transparent px-3 shadow-xs transition-colors duration-300"
          tabIndex={0}
        >
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
                  <Kbd>{getKeyDisplayText(key)}</Kbd>
                </motion.div>
              ))}
            </AnimatePresence>
          </KbdGroup>
        </div>
      </div>

      <div className="mb-0 flex flex-col justify-between space-y-2 gap-x-4">
        <div className="flex flex-col justify-center  space-y-1">
          <span className="font-medium">命令模式</span>
          <span className="text-sm text-muted-foreground">
            按住该快捷键会进入命令识别和智能交互模式
          </span>
        </div>
        <div
          ref={commandInputRef}
          className="border-input flex h-9 w-full items-center gap-2 rounded-md border bg-transparent px-3 shadow-xs transition-colors duration-300"
          tabIndex={0}
        >
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
                  <Kbd>{getKeyDisplayText(key)}</Kbd>
                </motion.div>
              ))}
            </AnimatePresence>
          </KbdGroup>
        </div>
      </div>
      <Alert className="max-w-md my-2 border-ripple-brand-text/60 opacity-90">
        <PopcornIcon className="text-ripple-brand-text!" />
        <AlertDescription className="text-ripple-brand-text">
          可点击屏幕底部状态区，配置快捷键
        </AlertDescription>
      </Alert>
    </div>
  )
}

export default ContestPage
