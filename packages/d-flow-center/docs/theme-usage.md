# 🎨 主题切换使用指南

## 一、基本用法

### 1. 导入 useTheme Hook

```typescript
import { useTheme } from '@/components/theme-provider'
```

### 2. 在组件中使用

```typescript
function MyComponent() {
  const { theme, setTheme } = useTheme()
  
  return (
    <div>
      <p>当前主题: {theme}</p>
      <button onClick={() => setTheme('dark')}>切换到深色</button>
      <button onClick={() => setTheme('light')}>切换到浅色</button>
      <button onClick={() => setTheme('system')}>跟随系统</button>
    </div>
  )
}
```

## 二、可用主题选项

- `'light'` - 浅色主题
- `'dark'` - 深色主题
- `'system'` - 跟随系统设置

## 三、常见使用场景

### 1. 简单切换按钮（深色/浅色）

```typescript
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/theme-provider'

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      {theme === 'light' ? <Moon /> : <Sun />}
    </Button>
  )
}
```

### 2. 循环切换（浅色 → 深色 → 系统）

```typescript
function ThemeToggleCycle() {
  const { theme, setTheme } = useTheme()
  
  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }
  
  return (
    <Button onClick={toggleTheme}>
      切换主题 ({theme})
    </Button>
  )
}
```

### 3. 下拉选择菜单

```typescript
import { Select } from '@/components/ui/select'
import { useTheme } from '@/components/theme-provider'

function ThemeSelect() {
  const { theme, setTheme } = useTheme()
  
  return (
    <Select value={theme} onValueChange={setTheme}>
      <option value="light">浅色</option>
      <option value="dark">深色</option>
      <option value="system">跟随系统</option>
    </Select>
  )
}
```

### 4. 带图标的下拉菜单

```typescript
import { Moon, Sun, Monitor } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/theme-provider'

function ThemeDropdown() {
  const { theme, setTheme } = useTheme()
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          {theme === 'light' && <Sun />}
          {theme === 'dark' && <Moon />}
          {theme === 'system' && <Monitor />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="mr-2 h-4 w-4" />
          <span>浅色</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="mr-2 h-4 w-4" />
          <span>深色</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Monitor className="mr-2 h-4 w-4" />
          <span>跟随系统</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

## 四、主题工作原理

1. **存储**: 主题偏好保存在 `localStorage` 中（默认 key: `vite-ui-theme`）
2. **应用**: 通过在 `<html>` 根元素添加 `light` 或 `dark` class 来应用主题
3. **系统主题**: 当选择 `system` 时，会根据系统的 `prefers-color-scheme` 媒体查询自动应用对应主题

## 五、注意事项

1. **必须在 ThemeProvider 内使用**: 
   - `useTheme` 必须在 `<ThemeProvider>` 组件内部使用
   - 否则会抛出错误: "useTheme must be used within a ThemeProvider"

2. **确保 CSS 配置正确**: 
   - 你的全局 CSS 应该有 `.light` 和 `.dark` 类的样式定义
   - Tailwind CSS 需要配置 `darkMode: 'class'`

3. **默认主题**: 
   - 可以在 `<ThemeProvider>` 中通过 `defaultTheme` prop 设置默认主题
   - 例: `<ThemeProvider defaultTheme="dark">...</ThemeProvider>`

## 六、当前项目实现

在 Header 组件中已经实现了循环切换功能：
- 点击太阳/月亮图标可以切换主题
- 浅色 → 深色 → 系统 → 浅色...循环切换
- 鼠标悬停显示当前主题提示

```typescript
// 位置: src/components/header.tsx
const { theme, setTheme } = useTheme()

const toggleTheme = () => {
  if (theme === 'light') {
    setTheme('dark')
  } else if (theme === 'dark') {
    setTheme('system')
  } else {
    setTheme('light')
  }
}
```

