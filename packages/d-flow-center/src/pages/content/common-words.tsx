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
import { Search } from 'lucide-react'

const shortKeys = [
  {
    key: 'shadcn',
  },
  {
    key: 'maxleiter',
  },
  {
    key: 'evilrabbit',
  },
]

const ContestPage: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  return (
    <>
      <div className="flex w-full flex-col mb-4 gap-6">
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
