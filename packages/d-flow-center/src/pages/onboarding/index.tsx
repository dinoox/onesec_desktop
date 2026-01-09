import { useState, useEffect, useCallback, useRef, ReactNode, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Check, ChevronRight, Info, Space, Mic, MessageCircle } from 'lucide-react'
import IPCService, { delay } from '@/services/ipc-service'
import { cn } from '@/lib/utils'
import useStatusStore from '@/store/status-store'
import useUserConfigStore from '@/store/user-config-store'
import { KeyMapper } from '@/utils/key'
import { KeyDisplay } from '@/components/ui/key-display'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AnimatePresence, motion, Variants } from 'framer-motion'
import { MessageTypes } from '../../../main/types/message'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { toast } from 'sonner'
import selectedTextImg from '@/assets/selectedText.jpg'
import selectedTextDarkImg from '@/assets/selectedTextDark.png'
import onBoardingVideo from '@/assets/videos/onBoarding.mp4'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

// 统一的步骤切换动画变体
const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -100 : 100,
    opacity: 0,
  }),
}

const slideTransition = {
  type: 'tween' as const,
  ease: 'easeInOut' as const,
  duration: 0.25,
}

type StepKey = 'register' | 'permission' | 'settings' | 'tryit'

const STEPS: { key: StepKey; label: string }[] = [
  { key: 'register', label: '注册' },
  { key: 'permission', label: '权限' },
  { key: 'settings', label: '设置' },
  { key: 'tryit', label: '快速体验' },
]

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1) // 从权限步骤开始(index 1)
  const [direction, setDirection] = useState(1) // 1: 前进, -1: 后退
  const [isExiting, setIsExiting] = useState(false)

  const handleFinish = () => {
    setIsExiting(true)
  }

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setDirection(1)
      setCurrentStep(currentStep + 1)
    } else {
      handleFinish()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1)
      setCurrentStep(currentStep - 1)
    }
  }

  const onExitComplete = () => {
    IPCService.markAsLaunched()
    navigate('/content')
  }

  return (
    <motion.div
      className="h-screen w-screen bg-background flex flex-col"
      initial={{ opacity: 1 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.2 }}
      onAnimationComplete={() => isExiting && onExitComplete()}
    >
      {/* Stepper Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-center gap-2 py-4 app-drag-region h-[50px] z-9">
        <div className="flex items-center justify-center gap-2 py-3 px-5 border rounded-full mt-10 bg-background">
          {STEPS.map((step, index) => (
            <div key={step.key} className="flex items-center">
              <span
                className={cn(
                  'text-sm font-medium transition-colors',
                  index <= currentStep ? 'text-foreground' : 'text-muted-foreground/70',
                )}
              >
                {step.label}
              </span>
              {index < STEPS.length - 1 && (
                <ChevronRight className="w-4 h-4 mx-3 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
            className="absolute inset-0 overflow-auto"
          >
            {currentStep === 0 && <RegisterStep />}
            {currentStep === 1 && <PermissionStep onNext={handleNext} />}
            {currentStep === 2 && <SettingsStep onNext={handleNext} />}
            {currentStep === 3 && <TryItStep onFinish={handleNext} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// 注册步骤 - 占位UI
function RegisterStep() {
  return (
    <StepContainer title="注册完成">
      <div className="text-center text-muted-foreground">您已成功注册秒言账号</div>
    </StepContainer>
  )
}

// 权限步骤 - 完整实现
function PermissionStep({ onNext }: { onNext: () => void }) {
  const [accessibilityGranted, setAccessibilityGranted] = useState(false)
  const [microphoneGranted, setMicrophoneGranted] = useState(false)

  const checkPermissions = useCallback(async () => {
    const accessibility = await IPCService.checkAccessibility()
    const micStatus = await IPCService.checkMicrophone()
    setAccessibilityGranted(accessibility)
    setMicrophoneGranted(micStatus === 'granted')
  }, [])

  useEffect(() => {
    checkPermissions()
    const interval = setInterval(checkPermissions, 2000)
    return () => clearInterval(interval)
  }, [checkPermissions])

  const handleRequestAccessibility = async () => {
    await IPCService.requestAccessibility()
    await checkPermissions()
  }

  const handleRequestMicrophone = async () => {
    await IPCService.requestMicrophone()
    await checkPermissions()
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col justify-center p-8 max-w-xl">
        <h1 className="text-2xl font-semibold mb-2">在您的计算机上设置秒言</h1>
        <p className="text-muted-foreground mb-8 text-[14px]">
          允许关键权限，确保秒言可以在任意输入框中正常工作。
        </p>

        <div className="space-y-4 mb-8">
          <PermissionCard
            title="允许秒言将文本粘贴到任何文本框中"
            description="这让秒言能够将您的口述内容放入正确的文本框中"
            granted={accessibilityGranted}
            onRequest={handleRequestAccessibility}
            infoTooltip='点击"允许"后，系统将打开"隐私与安全性"设置，请在"辅助功能"中勾选秒言应用'
          />

          <PermissionCard
            title="允许秒言使用您的麦克风"
            description="这让秒言能够录制您的语音并转换为文字"
            granted={microphoneGranted}
            onRequest={handleRequestMicrophone}
            infoTooltip='点击"允许"后，系统将弹出麦克风权限请求，请点击"好"以授予权限'
          />
        </div>

        <Button
          onClick={onNext}
          className="w-fit"
          disabled={!accessibilityGranted || !microphoneGranted}
        >
          下一步
        </Button>
      </div>

      {/* 右侧内容：根据权限状态显示视频或声明卡片 */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-ripple-brand/10 via-emerald-50 to-white dark:from-ripple-brand/10 dark:via-slate-900 dark:to-slate-950">
        <AnimatePresence mode="wait">
          {accessibilityGranted && microphoneGranted ? (
            <motion.div
              key="declaration"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="w-full max-w-sm rounded-xl border border-white/60 dark:border-slate-800 bg-white/70 dark:bg-background shadow-md p-6 space-y-4"
            >
              <h2 className="text-lg font-semibold">权限已开启</h2>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-ripple-brand" />
                  语音内容自动粘贴到目标输入框
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-ripple-brand" />
                  录音转写更稳定、更准确
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-ripple-brand" />
                  可随时在系统偏好设置中更改
                </li>
              </ul>
            </motion.div>
          ) : (
            <motion.div
              key="video"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="w-full max-w-2xl"
            >
              <video
                src={onBoardingVideo}
                autoPlay
                loop
                muted
                className="w-full rounded-lg shadow-lg"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// 设置步骤 - 麦克风测试和快捷键测试
function SettingsStep({ onNext }: { onNext: () => void }) {
  const [subStep, setSubStep] = useState(1) // 1: 麦克风测试, 2: 快捷键测试
  const [subDirection, setSubDirection] = useState(1)
  const [audioLevel, setAudioLevel] = useState(0)
  const [showHotkeyDialog, setShowHotkeyDialog] = useState(false)
  const streamRef = useRef<MediaStream | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationRef = useRef<number | null>(null)

  const hotkeyDetectKeys = useStatusStore((state) => state.hotkeyDetectKeys)
  const hotkeyDetectCompleted = useStatusStore((state) => state.hotkeyDetectCompleted)
  const hotkeySettingStatus = useStatusStore((state) => state.hotKeySettingStatus)
  const holdIPCMessage = useStatusStore((state) => state.holdIPCMessage)
  const { setHotkeyDetectKeys, setHotkeySettingStatus } =
    useStatusStore.getState().actions

  const shortcutKeys = useUserConfigStore((state) => state.shortcutKeys)
  const { setShortcutKeys, loadUserConfig } = useUserConfigStore.getState().actions

  const formattedKeys = useMemo(
    () => KeyMapper.formatKeys(hotkeyDetectKeys),
    [hotkeyDetectKeys],
  )

  const formattedShortcutKeys = useMemo(
    () => KeyMapper.formatKeys(shortcutKeys),
    [shortcutKeys],
  )

  // 处理快捷键设置的 IPC 消息
  useEffect(() => {
    const action = holdIPCMessage?.action
    const isHotkeyUpdate =
      action === MessageTypes.HOTKEY_SETTING_UPDATE ||
      action === MessageTypes.HOTKEY_SETTING_RESULT

    if (isHotkeyUpdate && holdIPCMessage?.data?.data) {
      const { mode, hotkey_combination } = holdIPCMessage.data.data
      if (mode === 'normal' && hotkey_combination && Array.isArray(hotkey_combination)) {
        setShortcutKeys(hotkey_combination)
      }
      if (action === 'hotkey_setting_result') {
        setShowHotkeyDialog(false)
        setHotkeySettingStatus('idle')

        const { is_conflict } = holdIPCMessage.data.data
        if (is_conflict) {
          loadUserConfig().then(() => toast.error('快捷键设置冲突，请重新设置'))
        }

        // 重新启动热键检测
        setHotkeyDetectKeys([])
        IPCService.startHotkeyDetect()
      }
    }
  }, [holdIPCMessage])

  const openHotkeyDialog = async () => {
    // 先停止热键检测
    await IPCService.endHotkeyDetect()
    setHotkeyDetectKeys([])
    // 打开 dialog 并开始热键设置
    setShowHotkeyDialog(true)
    await IPCService.startHotkeySetting('normal')
    setHotkeySettingStatus('hotkey_setting')
  }

  const closeHotkeyDialog = async () => {
    await loadUserConfig()
    await IPCService.endHotkeySetting('normal')
    setShowHotkeyDialog(false)
    setHotkeySettingStatus('idle')
    // 重新启动热键检测
    setHotkeyDetectKeys([])
    await IPCService.startHotkeyDetect()
  }

  const isWaitingHotkey = hotkeySettingStatus === 'hotkey_setting'

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser

      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      // 噪声门限：环境噪音 RMS 通常在 8-15，设为 20 过滤
      const noiseGate = 20
      const updateLevel = () => {
        analyser.getByteFrequencyData(dataArray)
        // 使用 RMS 计算音量
        let sum = 0
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i] * dataArray[i]
        }
        const rms = Math.sqrt(sum / dataArray.length)

        // 应用噪声门限：低于阈值直接归零
        let normalizedLevel = 0
        if (rms > noiseGate) {
          // 减去噪声门限后归一化，人声 RMS 约 30-80
          const effectiveRms = rms - noiseGate
          const raw = effectiveRms / 60
          // pow 0.6 曲线增强中低音量响应
          normalizedLevel = Math.pow(Math.min(1, raw), 0.6)
        }

        console.log('rms', rms, 'normalizedLevel', normalizedLevel)
        setAudioLevel(Math.min(1, normalizedLevel))
        animationRef.current = requestAnimationFrame(updateLevel)
      }
      updateLevel()
    } catch (err) {
      console.error('Failed to access microphone:', err)
    }
  }

  useEffect(() => {
    if (subStep === 1) {
      startRecording()
    }
    return () => {
      if (subStep === 1) {
        stopRecording()
      }
    }
  }, [subStep])

  // 进入快捷键测试步骤时启动热键检测
  useEffect(() => {
    if (subStep === 2) {
      setHotkeyDetectKeys([])
      IPCService.startHotkeyDetect()
    }
    return () => {
      if (subStep === 2) {
        IPCService.endHotkeyDetect()
        setHotkeyDetectKeys([])
      }
    }
  }, [subStep])

  const stopRecording = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    streamRef.current?.getTracks().forEach((track) => track.stop())
  }

  const handleContinueFromMicrophone = () => {
    stopRecording()
    setSubDirection(1)
    setSubStep(2)
  }

  const handleBackToMicrophone = () => {
    setSubDirection(-1)
    setSubStep(1)
  }

  const handleContinueFromShortcut = async () => {
    await IPCService.endHotkeyDetect()
    setHotkeyDetectKeys([])
    onNext()
  }

  return (
    <div className="relative h-full overflow-hidden">
      <AnimatePresence mode="wait" custom={subDirection}>
        {subStep === 1 && (
          <motion.div
            key="microphone"
            custom={subDirection}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
            className="absolute inset-0 flex"
          >
            {/* 左侧内容 */}
            <div className="flex-1 flex flex-col justify-center p-8 max-w-xl">
              <h1 className="text-2xl font-semibold mb-2">
                请说几句话，确认麦克风是否正常工作
              </h1>
              <p className="text-muted-foreground mb-12 text-[14px]">
                我们将通过声音波纹，帮助您确认: 当前麦克风是否成功接收到您的声音
              </p>
              <p className="font-medium mb-4 text-[14px]">
                您在说话时是否看到右侧的波纹在扩散？
              </p>
              <Button onClick={handleContinueFromMicrophone} className="w-fit">
                是的，看到了，继续
              </Button>
            </div>
            {/* 右侧波纹 */}
            <div className="flex-1 flex items-center justify-center bg-ripple-brand/5 p-8">
              <VolumeRipple level={audioLevel} />
            </div>
          </motion.div>
        )}

        {subStep === 2 && (
          <motion.div
            key="shortcut"
            custom={subDirection}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
            className="absolute inset-0 flex"
          >
            {/* 左侧内容 */}
            <div className="flex-1 flex flex-col justify-center p-8 max-w-xl">
              <div className="mb-8">
                <button
                  onClick={handleBackToMicrophone}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span>←</span>
                  <span>返回</span>
                </button>
              </div>
              <h1 className="text-2xl font-bold mb-2">
                请按下快捷键，确认是否能被正确识别
              </h1>
              <p className="text-muted-foreground mb-12">
                我们推荐使用 <KeyDisplay keys={['Fn']} /> 键，位于键盘左下角
              </p>
              <p className="font-medium mb-4">
                按下 快捷键时，您是否看到右侧出现的提示动画？
              </p>
              <div className="flex gap-4">
                <Button variant="outline" onClick={openHotkeyDialog} className="w-fit">
                  没有反应，换一个快捷键
                </Button>
                <Button onClick={handleContinueFromShortcut} className="w-fit">
                  是的，能看到，继续
                </Button>
              </div>
            </div>
            {/* 右侧按键示意图 */}
            <div className="flex-1 flex items-center justify-center bg-slate-50/50 dark:bg-slate-950/20 p-8">
              <div>
                <KbdGroup className="gap-8">
                  {formattedShortcutKeys.map((key, index) => (
                    <div
                      key={`${key}-${index}`}
                      className="flex items-center flex-col gap-12"
                    >
                      <Kbd
                        className={cn(
                          'scale-210',
                          !hotkeyDetectCompleted &&
                            hotkeyDetectKeys.length > 0 &&
                            KeyMapper.formatKeys(hotkeyDetectKeys).includes(key)
                            ? 'bg-ripple-brand/80 dark:bg-yellow-600/80'
                            : 'bg-muted',
                        )}
                      >
                        {key === 'Space' ? <Space size={14} strokeWidth={2.6} /> : key}
                      </Kbd>
                    </div>
                  ))}
                </KbdGroup>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 快捷键设置 Dialog */}
      <Dialog
        open={showHotkeyDialog}
        onOpenChange={(open) => !open && closeHotkeyDialog()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>设置快捷键</DialogTitle>
            <DialogDescription>
              按住该快捷键触发键盘检测, 至少包含一个修饰键
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col space-y-4">
            <div className="border-input flex h-9 w-full items-center gap-2 rounded-md border bg-transparent px-3 shadow-xs transition-colors duration-300 border-ripple-brand-text ">
              <div className="grid [&>*]:col-start-1 [&>*]:row-start-1 items-center">
                <AnimatePresence initial={false}>
                  {isWaitingHotkey && (
                    <motion.span
                      key="waiting"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-muted-foreground text-sm"
                    >
                      等待按键...
                    </motion.span>
                  )}
                  {!isWaitingHotkey && (
                    <motion.div
                      key="keys"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <KeyDisplay keys={formattedShortcutKeys} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <div>修饰键列表:</div>
              <KeyDisplay
                keys={KeyMapper.formatKeys([
                  'Fn',
                  'Left Command',
                  'Left Shift',
                  'Left Option',
                  'Left Control',
                ])}
              />
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// 音量波纹组件 - 麦克风样式
function VolumeRipple({ level }: { level: number }) {
  const coreSize = 120 // 中心绿色圆的大小
  const ringGap = 25 // 每层波纹之间的间距
  const maxExpand = 40 // 每层波纹的最大扩展量

  // 大幅提高阈值，过滤环境噪音，只有真正说话时才触发
  const voiceThreshold = 0.45 // 低于此值不显示任何扩散
  const isVoiceActive = level > voiceThreshold

  // 计算有效音量（减去阈值后的部分）
  const effectiveLevel = isVoiceActive
    ? (level - voiceThreshold) / (1 - voiceThreshold)
    : 0

  // 波纹层配置：阈值越高，需要越大的声音才能触发
  const rings = [
    { threshold: 0.1, baseSize: coreSize + ringGap },
    { threshold: 0.25, baseSize: coreSize + ringGap * 2 },
    { threshold: 0.5, baseSize: coreSize + ringGap * 3 },
  ]

  return (
    <div className="relative w-[300px] h-[300px] flex items-center justify-center">
      {/* 多层扩散波纹 - 只在说话时显示 */}
      {rings.map((ring, i) => {
        const isRingActive = isVoiceActive && effectiveLevel > ring.threshold
        const ringLevel = isRingActive
          ? Math.min(1, (effectiveLevel - ring.threshold) / (1 - ring.threshold))
          : 0
        const expand = ringLevel * maxExpand
        const size = ring.baseSize + expand
        // 透明度：激活时显示，越外层越淡
        const opacity = isRingActive ? 0.35 - i * 0.08 : 0

        return (
          <div
            key={i}
            className="absolute rounded-full transition-all duration-150 ease-out bg-green-500 dark:bg-yellow-600"
            style={{
              width: size,
              height: size,
              opacity,
            }}
          />
        )
      })}

      {/* 中心绿色圆 + 麦克风图标 */}
      <div
        className="absolute rounded-full flex items-center justify-center transition-all duration-100 bg-ripple-brand/80 border-2 border-ripple-brand/80"
        style={{
          width: coreSize + effectiveLevel * 6.5,
          height: coreSize + effectiveLevel * 6.5,
        }}
      >
        <Mic className="text-black" size={48} strokeWidth={1.5} />
      </div>
    </div>
  )
}

// 示例文本数组 - 轮询显示
const SAMPLE_TEXTS = [
  'Artificial Intelligence is transforming the world.',
  'Artificial Intelligence will transform the world.',
  'Artificial Intelligence has the potential to change everything.',
  'Artificial Intelligence is reshaping our future.',
]

function TryItStep({ onFinish }: { onFinish: () => void }) {
  const [subStep, setSubStep] = useState(1) // 1: 输入框测试 2: 普通命令测试, 3: 选中翻译测试
  const [subDirection, setSubDirection] = useState(1)
  const [inputValue1, setInputValue1] = useState('')
  const [inputValue2, setInputValue2] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const [sampleTextIndex, setSampleTextIndex] = useState(0)
  const [sampleText, setSampleText] = useState(SAMPLE_TEXTS[0])

  const [showCommandHotkeyDialog, setShowCommandHotkeyDialog] = useState(false)
  const [isTextSelected, setIsTextSelected] = useState(false)
  const [hasReceivedAudio, setHasReceivedAudio] = useState(false)

  // 恢复示例文本并切换到下一个
  const resetSampleText = useCallback(() => {
    const nextIndex = (sampleTextIndex + 1) % SAMPLE_TEXTS.length
    setSampleTextIndex(nextIndex)
    setSampleText(SAMPLE_TEXTS[nextIndex])
  }, [sampleTextIndex])

  const hotkeySettingStatus = useStatusStore((state) => state.hotKeySettingStatus)
  const holdIPCMessage = useStatusStore((state) => state.holdIPCMessage)
  const { setHotkeySettingStatus } = useStatusStore.getState().actions

  const shortcutKeys = useUserConfigStore((state) => state.shortcutKeys)
  const shortcutCommandKeys = useUserConfigStore((state) => state.shortcutCommandKeys)
  const { setShortcutCommandKeys, loadUserConfig } = useUserConfigStore.getState().actions

  const formattedShortcutKeys = useMemo(
    () => KeyMapper.formatKeys(shortcutKeys),
    [shortcutKeys],
  )

  const formattedShortcutCommandKeys = useMemo(
    () => KeyMapper.formatKeys(shortcutCommandKeys),
    [shortcutCommandKeys],
  )

  const formattedShortcutCommandKeysString = useMemo(
    () => KeyMapper.formatKeysAsString(shortcutCommandKeys),
    [shortcutCommandKeys],
  )

  useEffect(() => {
    setHasReceivedAudio(false)
  }, [subStep])

  useEffect(() => {
    console.log('holdIPCMessage changed:', holdIPCMessage)

    if (
      (subStep === 2 || subStep === 3) &&
      holdIPCMessage?.action === 'user_audio_saved'
    ) {
      const mode = holdIPCMessage?.data?.data?.mode
      const hasSelectedText = holdIPCMessage?.data?.data?.has_text_selected

      if (subStep === 3) {
        setHasReceivedAudio(true)
      }

      if (subStep === 3 && !hasSelectedText) {
        toast.error(`当前未选中文本, 请重新选中文本`)
        delay(1000).then(() => {
          resetSampleText()
        })
        return
      }

      if (subStep === 3 && mode && mode !== 'command') {
        toast.error(`请按住 ${formattedShortcutCommandKeysString} 使用命令模式重新录音`, {
          duration: 5000,
        })
        delay(1000).then(() => {
          resetSampleText()
        })
        return
      }

      if (mode && mode !== 'command') {
        toast.error(`请按住 ${formattedShortcutCommandKeysString} 使用命令模式重新录音`, {
          duration: 5000,
        })
        if (subStep === 3) {
          delay(1000).then(() => {
            resetSampleText()
          })
        }
      }
    }
  }, [holdIPCMessage])

  // 处理快捷键设置的 IPC 消息（针对command模式）
  useEffect(() => {
    const action = holdIPCMessage?.action
    const isHotkeyUpdate =
      action === MessageTypes.HOTKEY_SETTING_UPDATE ||
      action === MessageTypes.HOTKEY_SETTING_RESULT

    if (isHotkeyUpdate && holdIPCMessage?.data?.data) {
      const { mode, hotkey_combination } = holdIPCMessage.data.data
      if (mode === 'command' && hotkey_combination && Array.isArray(hotkey_combination)) {
        setShortcutCommandKeys(hotkey_combination)
      }
      if (action === 'hotkey_setting_result') {
        setShowCommandHotkeyDialog(false)
        setHotkeySettingStatus('idle')

        const { is_conflict } = holdIPCMessage.data.data
        if (is_conflict) {
          loadUserConfig().then(() => toast.error('快捷键设置冲突，请重新设置'))
        }
      }
    }
  }, [holdIPCMessage])

  const openCommandHotkeyDialog = async () => {
    setShowCommandHotkeyDialog(true)
    await IPCService.startHotkeySetting('command')
    setHotkeySettingStatus('hotkey_setting')
  }

  const closeCommandHotkeyDialog = async () => {
    await loadUserConfig()
    await IPCService.endHotkeySetting('command')
    setShowCommandHotkeyDialog(false)
    setHotkeySettingStatus('idle')
  }

  const isWaitingHotkey = hotkeySettingStatus === 'hotkey_setting'

  // 自动聚焦输入框
  useEffect(() => {
    if (subStep === 1 && inputRef.current) {
      inputRef.current.focus()
    }
  }, [subStep])

  const handleNextSubStep = () => {
    setSubDirection(1)
    setSubStep((prev) => prev + 1)
  }

  const handleBackSubStep = () => {
    setSubDirection(-1)
    setSubStep((prev) => prev - 1)
  }

  return (
    <div className="relative h-full overflow-hidden">
      <AnimatePresence mode="wait" custom={subDirection}>
        {subStep === 1 && (
          <motion.div
            key="voice-input"
            custom={subDirection}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
            className="absolute inset-0 flex"
          >
            {/* 左侧内容 */}
            <div className="flex-1 flex flex-col justify-center p-8 max-w-xl">
              <h1 className="text-2xl font-semibold mb-3">语音识别</h1>

              {/* 上半部分：示例问题卡片 */}
              <div className="flex items-end justify-center pb-6">
                <div className="w-full max-w-md">
                  {/* 标题 */}
                  <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">试着读出这段话</span>
                  </div>
                  {/* 虚线边框卡片 */}
                  <div className="border-2 border-dashed border-muted-foreground/30 rounded-2xl p-8 bg-background/80">
                    <p className="text-2xl font-bold text-ripple-brand-text dark:text-ripple-brand-text text-center leading-relaxed">
                      "行吧，那我们就约定好明天，
                      <br />
                      那个，明天下午在这见面。"
                    </p>
                  </div>

                  <div className="text-xs text-muted-foreground mt-2 ml-1">
                    秒言会自动帮你去除语气词并整理语义
                  </div>
                </div>
              </div>
              <div className="relative">
                <textarea
                  ref={inputRef}
                  autoFocus
                  value={inputValue1}
                  onChange={(e) => setInputValue1(e.target.value)}
                  placeholder="按住快捷键开始说话..."
                  className={cn(
                    'w-full h-32 p-4 rounded-lg border resize-none placeholder:text-muted-foreground',
                    'focus:outline-none focus:ring-ripple-brand/50 focus:border-ripple-brand',
                    'transition-all duration-200',
                  )}
                />
              </div>

              {/* <p className="text-xs text-muted-foreground mt-2">
                说话时保持清晰，松开快捷键后等待片刻即可看到转写结果
              </p> */}

              <Button onClick={handleNextSubStep} className="w-fit mt-4">
                下一步
              </Button>
            </div>

            {/* 右侧提示区域 */}
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-950/20 p-8">
              <div className="text-center flex flex-col gap-3 items-center justify-center">
                <div className="mb-6">
                  <KbdGroup className="gap-12">
                    {formattedShortcutKeys.map((key, index) => (
                      <Kbd
                        key={`${key}-${index}`}
                        className={cn('scale-250', 'bg-ripple-brand', 'text-foreground')}
                      >
                        {key === 'Space' ? <Space size={14} strokeWidth={2.6} /> : key}
                      </Kbd>
                    ))}
                  </KbdGroup>
                </div>
                <p className="text-sm text-muted-foreground">
                  {'按住以上快捷键开始录音'}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {subStep === 2 && (
          <motion.div
            key="voice-input-2"
            custom={subDirection}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
            className="absolute inset-0 flex"
          >
            {/* 左侧内容 */}
            <div className="flex-1 flex flex-col justify-center p-8 max-w-xl">
              <h1 className="text-2xl font-semibold mb-3">智能指令</h1>

              {/* 上半部分：示例问题卡片 */}
              <div className="flex items-end justify-center pb-6">
                <div className="w-full max-w-md">
                  {/* 标题 */}
                  <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">试着说出这个指令</span>
                  </div>
                  {/* 虚线边框卡片 */}
                  <div className="border-2 border-dashed border-muted-foreground/30 rounded-2xl p-8 bg-background/80">
                    <p className="text-2xl font-bold text-ripple-brand-text text-center leading-relaxed">
                      “告诉我世界上最高的山是哪座？”
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <textarea
                  ref={inputRef}
                  autoFocus
                  value={inputValue2}
                  onChange={(e) => setInputValue2(e.target.value)}
                  placeholder="按住快捷键开始询问..."
                  className={cn(
                    'w-full h-32 p-4 rounded-lg border resize-none placeholder:text-muted-foreground',
                    'focus:outline-none focus:ring-ripple-brand/50 focus:border-ripple-brand',
                    'transition-all duration-200',
                  )}
                />
              </div>

              {/* <p className="text-xs text-muted-foreground mt-2">
                说话时保持清晰，松开快捷键后等待片刻即可看到转写结果
              </p> */}
              <div className="flex gap-4 mt-4">
                <Button onClick={handleNextSubStep} className="w-fit">
                  下一步
                </Button>
              </div>
            </div>

            {/* 右侧提示区域 */}
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-950/20 p-8">
              {/* 下半部分：快捷键提示 */}
              <div className=" flex items-start justify-center pt-8">
                <div className="text-center flex flex-col gap-3 items-center justify-center">
                  <div className="mb-6 flex items-center justify-center">
                    <KbdGroup className="gap-12">
                      {formattedShortcutCommandKeys.map((key, index) => (
                        <Kbd
                          key={`${key}-${index}`}
                          className={cn(
                            'scale-250',
                            'bg-ripple-brand',
                            'text-foreground',
                          )}
                        >
                          {key === 'Space' ? <Space size={14} strokeWidth={2.6} /> : key}
                        </Kbd>
                      ))}
                    </KbdGroup>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {'按住以上快捷键开始发送指令'}
                  </p>

                  <Button
                    variant="outline"
                    onClick={openCommandHotkeyDialog}
                    className="w-fit text-muted-foreground"
                  >
                    换个快捷键
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {subStep === 3 && (
          <motion.div
            key="translate"
            custom={subDirection}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
            className="absolute inset-0 flex"
          >
            {/* 左侧内容 */}
            <div className="flex-1 flex flex-col justify-center p-8 max-w-xl">
              <h1 className="text-2xl font-semibold mb-3">划词指令</h1>

              {/* 上半部分：示例问题卡片 */}
              <div className="flex items-end justify-center pb-4">
                <div className="w-full max-w-md">
                  {/* 标题 */}
                  <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">选中文字并说出指令</span>
                  </div>
                  {/* 虚线边框卡片 */}
                  <div className="border-2 border-dashed border-muted-foreground/30 rounded-2xl p-8 bg-background/80">
                    <p className="text-2xl font-bold text-ripple-brand-text text-center leading-relaxed">
                      "翻译这句话"
                    </p>
                  </div>
                </div>
              </div>

              {/* 选中文本提示 - 带漂浮动画 */}
              <AnimatePresence>
                {!hasReceivedAudio && (
                  <motion.div
                    initial={{ opacity: 1, height: 'auto', marginBottom: '0.5rem' }}
                    exit={{
                      opacity: 0,
                      height: 0,
                      marginBottom: 0,
                      transition: { duration: 0.3, ease: 'easeInOut' },
                    }}
                    className="flex justify-center overflow-hidden p-2"
                  >
                    <motion.button
                      onClick={() => {
                        if (inputRef.current) {
                          inputRef.current.focus()
                          inputRef.current.select()
                        }
                      }}
                      animate={{
                        y: [0, -8, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-ripple-brand/10 hover:bg-ripple-brand/20 text-ripple-brand-text text-sm transition-colors cursor-pointer shadow-xs"
                    >
                      <AnimatePresence mode="wait">
                        {!isTextSelected ? (
                          <motion.div
                            key="not-selected"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-2"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M9 18h6" />
                              <path d="M10 22h4" />
                              <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
                            </svg>
                            点击选中以下文字
                          </motion.div>
                        ) : (
                          <motion.div
                            key="selected"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-2"
                          >
                            <div className="flex gap-1">
                              {formattedShortcutCommandKeys.map((key, index) => (
                                <Kbd
                                  key={`${key}-${index}`}
                                  className="text-xs bg-ripple-brand text-foreground"
                                >
                                  {key === 'Space' ? (
                                    <Space size={10} strokeWidth={2.6} />
                                  ) : (
                                    key
                                  )}
                                </Kbd>
                              ))}
                            </div>
                            按住快捷键并说出上述指令
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              <textarea
                ref={inputRef}
                autoFocus
                value={sampleText}
                onChange={(e) => setSampleText(e.target.value)}
                onSelect={(e) => {
                  const target = e.target as HTMLTextAreaElement
                  const hasSelection =
                    target.selectionStart !== target.selectionEnd &&
                    target.selectionEnd - target.selectionStart > 0
                  setIsTextSelected(hasSelection)
                }}
                onBlur={() => {
                  // 延迟检查，因为失去焦点时选区会消失
                  setTimeout(() => {
                    if (inputRef.current) {
                      const hasSelection =
                        inputRef.current.selectionStart !== inputRef.current.selectionEnd
                      setIsTextSelected(hasSelection)
                    }
                  }, 100)
                }}
                className={cn(
                  'w-full  p-4 rounded-lg border  resize-none',
                  'focus:outline-none focus:ring-ripple-brand/50 focus:border-ripple-brand',
                  'transition-all duration-200 leading-relaxed',
                )}
              />

              <div className="flex gap-4 mt-6">
                <Button onClick={onFinish} className="w-fit">
                  完成
                </Button>
              </div>
            </div>

            {/* 右侧提示区域 */}
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-950/20 p-8">
              {/* 下半部分：快捷键提示 */}
              <div className=" flex items-start justify-center pt-8">
                <div className="text-center flex flex-col gap-3 items-center justify-center">
                  <div className="mb-6 flex items-center justify-center">
                    <KbdGroup className="gap-12">
                      {formattedShortcutCommandKeys.map((key, index) => (
                        <Kbd
                          key={`${key}-${index}`}
                          className={cn(
                            'scale-250',
                            'bg-ripple-brand',
                            'text-foreground',
                          )}
                        >
                          {key === 'Space' ? <Space size={14} strokeWidth={2.6} /> : key}
                        </Kbd>
                      ))}
                    </KbdGroup>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {'按住以上快捷键开始发送指令'}
                  </p>

                  <Button
                    variant="outline"
                    onClick={openCommandHotkeyDialog}
                    className="w-fit text-muted-foreground"
                  >
                    换个快捷键
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 命令模式快捷键设置 Dialog */}
      <Dialog
        open={showCommandHotkeyDialog}
        onOpenChange={(open) => !open && closeCommandHotkeyDialog()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>设置命令快捷键</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col space-y-4">
            <span className="text-sm text-muted-foreground">
              按住该快捷键触发命令模式, 至少包含一个修饰键
            </span>
            <div
              className="border-input flex h-9 w-full items-center gap-2 rounded-md border bg-transparent px-3 shadow-xs transition-colors duration-300"
              style={{ borderColor: 'var(--color-ripple-green-text)' }}
            >
              <div className="grid [&>*]:col-start-1 [&>*]:row-start-1 items-center">
                <AnimatePresence initial={false}>
                  {isWaitingHotkey && (
                    <motion.span
                      key="waiting"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-muted-foreground text-sm"
                    >
                      等待按键...
                    </motion.span>
                  )}
                  {!isWaitingHotkey && (
                    <motion.div
                      key="keys"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <KeyDisplay keys={formattedShortcutCommandKeys} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <div>修饰键列表:</div>
              <KeyDisplay
                keys={KeyMapper.formatKeys([
                  'Fn',
                  'Left Command',
                  'Left Shift',
                  'Left Option',
                  'Left Control',
                ])}
              />
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// 通用步骤容器
function StepContainer({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-start justify-center p-8 max-w-2xl mx-8 my-auto h-full">
      <h1 className="text-2xl font-bold mb-8">{title}</h1>
      {children}
    </div>
  )
}

// 权限卡片组件
function PermissionCard({
  title,
  description,
  granted,
  onRequest,
  infoTooltip,
}: {
  title: string
  description: string
  granted: boolean
  onRequest: () => void
  infoTooltip: string
}) {
  return (
    <div className="border rounded-lg p-4">
      <div className="font-medium mb-1">{title}</div>
      <div className="text-sm text-muted-foreground mb-3">{description}</div>
      <div className="flex items-center gap-2 h-8 relative">
        {granted ? (
          <div className="flex items-center gap-1.5 text-sm text-green-600 dark:text-ripple-brand-text">
            <Check className="w-4 h-4" />
            已授权
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={onRequest}>
              允许
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon-sm" variant="ghost">
                  <Info className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{infoTooltip}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  )
}
