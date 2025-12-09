import { useEffect, useMemo } from 'react'
import { Kbd, KbdGroup } from '@/components/ui/kbd.tsx'
import { Languages, Globe, Terminal, MonitorCog, LucideLogOut } from 'lucide-react'
import { toast } from 'sonner'
import useUserConfigStore from '@/store/user-config-store.ts'
import { getKeyDisplayText } from '@/lib/utils.ts'
import CurrencyRipple from '@/components/currency-ripple.tsx'
import { Label } from '@/components/ui/label'
import { IconBell } from '@tabler/icons-react'
import { Button } from '@/components/ui/button.tsx'
import { Spinner } from '@/components/ui/spinner.tsx'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { KeyMapper } from '@/utils/key'

const exampleList = [
  {
    id: 1,
    icon: Languages,
    iconColor: 'text-ripple-brand-text',
    title: '文本翻译',
    description:
      '选中文本后使用命令模式，说 "帮我翻译成英文"，或者点击底部圆形图标并开启翻译模式。',
  },
  {
    id: 2,
    icon: Globe,
    iconColor: 'text-ripple-brand-text',
    title: '网址搜索',
    description: '在浏览器地址栏使用命令模式，说 "帮我打开在线去水印的网站"',
  },
  {
    id: 3,
    icon: Terminal,
    iconColor: 'text-ripple-brand-text',
    title: 'Linux命令',
    description: '在终端使用命令模式，说 "帮我查看当前目录下的文件"',
  },
]

const ContentPage: React.FC = () => {
  const shortcutKeys = useUserConfigStore((state) => state.shortcutKeys)
  const shortcutCommandKeys = useUserConfigStore((state) => state.shortcutCommandKeys)
  const { loadUserConfig } = useUserConfigStore((state) => state.actions)

  useEffect(() => {
    loadUserConfig().then()
  }, [])

  const formattedNormalKeys = useMemo(
    () => KeyMapper.formatKeys(shortcutKeys),
    [shortcutKeys],
  )
  const formattedCommandKeys = useMemo(
    () => KeyMapper.formatKeys(shortcutCommandKeys),
    [shortcutCommandKeys],
  )

  return (
    <div className="max-w-9/12 flex flex-col justify-between gap-5">
      <div className="mb-3 flex flex-col justify-between space-y-2 gap-x-4">
        <div className="flex flex-col justify-center  space-y-1">
          <span className="text-[15px] font-medium">如何使用</span>
          <span className="text-sm text-muted-foreground">
            按住快捷键说话，松开后内容自动输入到当前光标位置
          </span>
        </div>

        <div className="flex flex-col gap-5 border border-border between w-full rounded-xl p-3">
          <div className="flex items-center px-2">
            <div className="flex flex-col space-y-2">
              <Label>
                <div className="text-sm font-medium">
                  <div className="flex flex-col gap-4">
                    <p>普通模式</p>
                  </div>
                </div>
              </Label>
              <div className="text-sm text-muted-foreground flex flex-row gap-1">
                <span>长按</span>
                <KbdGroup className="mx-1">
                  {formattedNormalKeys.map((key) => (
                    <Kbd key={key}>{key}</Kbd>
                  ))}
                </KbdGroup>
                <span>语音识别：自动识别使用场景，让识别更准确，输出更清晰</span>
              </div>
            </div>
          </div>

          <div className="flex items-center px-2">
            <div className="flex flex-col space-y-2">
              <Label>
                <div className="text-sm font-medium">
                  <div className="flex flex-col gap-4">
                    <p>命令模式</p>
                  </div>
                </div>
              </Label>
              <div className="text-sm text-muted-foreground flex flex-row gap-1">
                <span>长按</span>
                <KbdGroup className="mx-1">
                  {formattedCommandKeys.map((key) => (
                    <Kbd key={key}>{key}</Kbd>
                  ))}
                </KbdGroup>
                语音命令：支持命令识别和智能交互
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-3 flex flex-col justify-between space-y-2 gap-x-4">
        <div className="flex flex-col justify-center  space-y-1">
          <span className="text-[15px] font-medium">试试下面的[命令模式]例子</span>
          <span className="text-sm text-muted-foreground">
            按住快捷键
            <KbdGroup className="mx-1">
              {formattedCommandKeys.map((key) => (
                <Kbd key={key}>{key}</Kbd>
              ))}
            </KbdGroup>
            说话，松开后内容自动输入到当前光标位置
          </span>
        </div>
        <div className="border border-border rounded-xl">
          {exampleList.map((example) => {
            const IconComponent = example.icon
            return (
              <div
                key={example.id}
                className="flex flex-row gap-5 items-center px-5 py-4"
              >
                <div className="flex-shrink-0">
                  <IconComponent className={`w-6 h-6 ${example.iconColor}`} />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="text-sm font-medium">{example.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {example.description}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ContentPage
