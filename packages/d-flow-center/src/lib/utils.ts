import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 将快捷键名称转换为显示文本（符号）
 * @param keyName 快捷键名称
 * @returns 显示文本
 */
export function getKeyDisplayText(keyName: string): string {
  if (keyName.includes('Command') || keyName.includes('⌘') || keyName.includes('Cmd')) {
    return '⌘'
  } else if (
    keyName.includes('Option') ||
    keyName.includes('⌥') ||
    keyName.includes('Alt')
  ) {
    return '⌥'
  } else if (
    keyName.includes('Control') ||
    keyName.includes('⌃') ||
    keyName.includes('Ctrl')
  ) {
    return '⌃'
  } else if (keyName.includes('Shift') || keyName.includes('⇧')) {
    return '⇧'
  } else if (keyName === 'Space') {
    return 'Space'
  } else if (keyName === 'Return' || keyName === 'Enter') {
    return '↩'
  } else if (keyName === 'Delete' || keyName === 'Backspace') {
    return '⌫'
  } else if (keyName === 'Escape' || keyName === 'Esc') {
    return '⎋'
  } else if (keyName === 'Tab') {
    return '⇥'
  } else if (keyName === 'Fn') {
    return 'Fn'
  } else {
    return keyName
  }
}
