import { useEffect, RefObject } from 'react'

/**
 * 监听点击外部事件的 Hook
 * @param ref - 要监听的元素引用（单个或多个）
 * @param handler - 点击外部时的回调函数
 * @param enabled - 是否启用监听（默认为 true）
 */
export function useClickOutside(
  ref: RefObject<HTMLElement> | RefObject<HTMLElement>[],
  handler: (event: MouseEvent | TouchEvent) => void,
  enabled: boolean = true,
) {
  useEffect(() => {
    if (!enabled) return

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const refs = Array.isArray(ref) ? ref : [ref]

      const isClickInside = refs.some((r) => r.current && r.current.contains(event.target as Node))

      if (!isClickInside) {
        handler(event)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [ref, handler, enabled])
}
