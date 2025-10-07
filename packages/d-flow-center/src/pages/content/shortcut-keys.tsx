import React, { useState } from 'react'
import { Kbd, KbdGroup } from '@/components/ui/kbd.tsx'

const ContestPage: React.FC = () => {
  const [shortcutKeys] = useState(['fn', 'Opt⌥'])
  const [shortcutCommandKeys] = useState(['fn', 'Cmd⌘'])
  return (
    <div className="max-w-1/2 flex flex-col justify-between gap-5">
      <div className="mb-3 flex flex-col justify-between space-y-2 gap-x-4">
        <div className="flex flex-col justify-center  space-y-2">
          <span className="text-base font-medium">普通模式</span>
          <span className="text-sm text-muted-foreground">按住该快捷键会进入普通识别模式</span>
        </div>
        <div
          className="border-input focus-within:border-ring focus-within:ring-ring/50 flex h-9 w-full items-center gap-2 rounded-md border bg-transparent px-3 shadow-xs transition-[color,box-shadow] focus-within:ring-[3px] cursor-pointer"
          tabIndex={0}
        >
          <KbdGroup>
            {shortcutKeys.map((key, index) => (
              <Kbd key={index}>{key}</Kbd>
            ))}
          </KbdGroup>
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
          className="border-input focus-within:border-ring focus-within:ring-ring/50 flex h-9 w-full items-center gap-2 rounded-md border bg-transparent px-3 shadow-xs transition-[color,box-shadow] focus-within:ring-[3px] cursor-pointer"
          tabIndex={0}
        >
          <KbdGroup>
            {shortcutCommandKeys.map((key, index) => (
              <Kbd key={index}>{key}</Kbd>
            ))}
          </KbdGroup>
          <span className="text-muted-foreground text-sm ml-auto">点击修改</span>
        </div>
      </div>
    </div>
  )
}

export default ContestPage
