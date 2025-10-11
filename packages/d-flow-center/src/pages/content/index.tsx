import React, { useEffect } from 'react'
import { Item, ItemContent } from '@/components/ui/item.tsx'
import { Kbd, KbdGroup } from '@/components/ui/kbd.tsx'
import { Languages, Globe, Terminal } from 'lucide-react'
import { toast } from 'sonner'
import useUserConfigStore from '@/store/user-config-store.ts'

const exampleList = [
  {
    id: 1,
    icon: Languages,
    iconColor: 'text-blue-500',
    title: '文本翻译',
    description: '选中文本后使用命令模式，说"帮我翻译成英文"',
  },
  {
    id: 2,
    icon: Globe,
    iconColor: 'text-green-500',
    title: '网址搜索',
    description: '在浏览器地址栏使用命令模式，说"我要访问全球最大的编程社区"',
  },
  {
    id: 3,
    icon: Terminal,
    iconColor: 'text-purple-500',
    title: 'Linux命令',
    description: '在终端使用命令模式，说"帮我查看当前目录下的文件"',
  },
]

const ContestPage: React.FC = () => {
  const shortcutKeys = useUserConfigStore((state) => state.shortcutKeys)
  const shortcutCommandKeys = useUserConfigStore((state) => state.shortcutCommandKeys)
  const { loadUserConfig } = useUserConfigStore((state) => state.actions)

  useEffect(() => {
    loadUserConfig().then()
  }, [])

  return (
    <div className="max-w-9/12 flex flex-col justify-between gap-5">
      <div className="mb-3 flex flex-col justify-between space-y-2 gap-x-4">
        <div className="flex flex-col justify-center  space-y-2">
          <span className="text-base font-medium">如何使用</span>
          <span
            className="text-sm text-muted-foreground"
            onClick={() =>
              toast('Event has been created', {
                description: 'Sunday, December 03, 2023 at 9:00 AM',
                action: {
                  label: 'Undo',
                  onClick: () => console.log('Undo'),
                },
              })
            }
          >
            按住快捷键说话，松开后内容自动输入到当前光标位置
          </span>
        </div>
        <Item
          variant="muted"
          className="hover:border-green-300 transition-all duration-300 cursor-pointer"
        >
          <ItemContent className="flex flex-col gap-2">
            <div className="text-sm font-medium">
              <div className="flex flex-col gap-4">
                <p>
                  长按{' '}
                  <KbdGroup className="mx-1">
                    {shortcutKeys.length > 0 ? (
                      shortcutKeys.map((key, index) => <Kbd key={index}>{key}</Kbd>)
                    ) : (
                      <>
                        <Kbd>fn</Kbd>
                        <Kbd>Opt⌥</Kbd>
                      </>
                    )}
                  </KbdGroup>{' '}
                  开启普通模式
                </p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              语音识别：自动识别使用场景，让识别更准确，输出更清晰
            </div>
          </ItemContent>
        </Item>
        <Item
          variant="muted"
          className="hover:border-green-300 transition-all duration-300 cursor-pointer"
        >
          <ItemContent className="flex flex-col gap-2">
            <div className="text-sm font-medium">
              <div className="flex flex-col gap-4">
                <p>
                  长按{' '}
                  <KbdGroup className="mx-1">
                    {shortcutCommandKeys.length > 0 ? (
                      shortcutCommandKeys.map((key, index) => <Kbd key={index}>{key}</Kbd>)
                    ) : (
                      <>
                        <Kbd>fn</Kbd>
                        <Kbd>cmd⌥</Kbd>
                      </>
                    )}
                  </KbdGroup>{' '}
                  开启命令模式
                </p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">语音命令：支持命令识别和智能交互</div>
          </ItemContent>
        </Item>
      </div>

      <div className="mb-3 flex flex-col justify-between space-y-2 gap-x-4">
        <div className="flex flex-col justify-center  space-y-2">
          <span className="text-base font-medium">试试下面的例子</span>
          <span className="text-sm text-muted-foreground">
            按住快捷键说话，松开后内容自动输入到当前光标位置
          </span>
        </div>
        <div className="flex flex-col gap-4">
          {exampleList.map((example) => {
            const IconComponent = example.icon
            return (
              <Item key={example.id} variant="outline">
                <ItemContent className="flex flex-row gap-5 items-center">
                  <div className="flex-shrink-0">
                    <IconComponent className={`w-6 h-6 ${example.iconColor}`} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="text-sm font-medium">{example.title}</div>
                    <div className="text-sm text-muted-foreground">{example.description}</div>
                  </div>
                </ItemContent>
              </Item>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ContestPage
