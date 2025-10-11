import { Button } from '@/components/ui/button'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
} from '@/components/ui/item'
import React, { useState } from 'react'
import { HamburgerMenu, Edit, Trash } from 'iconsax-reactjs'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Search, Info, PopcornIcon, X } from 'lucide-react'
import ipcService from '@/services/ipc-service.ts'

const shortKeys = [
  {
    key: '点动星河',
  },
  {
    key: '阿里巴巴',
  },
  {
    key: '字节跳动',
  },
]

const ContestPage: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  return (
    <>
      <div className="flex w-full flex-col gap-6">
        <div className="flex items-center justify-between gap-4 w-full">
          <InputGroup className="max-w-md">
            <InputGroupInput
              placeholder="搜索常用词..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupAddon align="inline-end">0 results</InputGroupAddon>
          </InputGroup>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>添加常用词</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>添加新常用词</DialogTitle>
                <DialogDescription>在这里添加您的常用词内容</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <InputGroup>
                  <InputGroupInput placeholder="请输入常用词..." />
                </InputGroup>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  取消
                </Button>
                <Button onClick={() => setOpen(false)}>确定</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Alert className="max-w-md my-4">
        <PopcornIcon />
        <AlertTitle>让秒言更懂你</AlertTitle>
        <AlertDescription>
          添加常用的人名、地名或术语，系统会优先识别，避免识别错误或遗漏。
        </AlertDescription>
        <button className="absolute top-3 right-3" onClick={() => {}}>
          <X className="h-4 w-4" />
        </button>
      </Alert>
      <div className="flex w-full max-w-md flex-col gap-6">
        <ItemGroup className="border border-border rounded-md">
          {shortKeys.map((item, index) => (
            <React.Fragment key={item.key}>
              <Item className="p-3">
                <ItemContent className="gap-1">
                  <ItemTitle>{item.key}</ItemTitle>
                </ItemContent>
                <ItemActions>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <HamburgerMenu />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="start">
                        <DropdownMenuLabel>提示词操作</DropdownMenuLabel>
                        <DropdownMenuGroup>
                          <DropdownMenuItem>
                            编辑
                            <DropdownMenuShortcut>
                              <Edit />
                            </DropdownMenuShortcut>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          删除
                          <DropdownMenuShortcut>
                            <Trash />
                          </DropdownMenuShortcut>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </Button>
                </ItemActions>
              </Item>
              {index !== shortKeys.length - 1 && <ItemSeparator />}
            </React.Fragment>
          ))}
        </ItemGroup>
      </div>
    </>
  )
}

export default ContestPage
