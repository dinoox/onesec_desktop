import { useInView, useMotionValue, animate } from 'motion/react'
import { useCallback, useEffect, useRef } from 'react'

interface CountUpProps {
  to: number
  from?: number
  direction?: 'up' | 'down'
  delay?: number
  duration?: number
  className?: string
  startWhen?: boolean
  separator?: string
  onStart?: () => void
  onEnd?: () => void
  cacheKey?: string // 用于在 sessionStorage 中缓存动画状态
}

export default function CountUp({
  to,
  from = 0,
  direction = 'up',
  delay = 0,
  duration = 2,
  className = '',
  startWhen = true,
  separator = '',
  onStart,
  onEnd,
  cacheKey,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(direction === 'down' ? to : from)

  const isInView = useInView(ref, { once: true, margin: '0px' })

  // 从 sessionStorage 获取上次的值和动画状态
  const getCachedState = useCallback(() => {
    if (!cacheKey) return { previousValue: null, hasAnimated: false }
    try {
      const cached = sessionStorage.getItem(`countup-${cacheKey}`)
      return cached ? JSON.parse(cached) : { previousValue: null, hasAnimated: false }
    } catch {
      return { previousValue: null, hasAnimated: false }
    }
  }, [cacheKey])

  // 保存到 sessionStorage
  const setCachedState = useCallback(
    (value: number) => {
      if (!cacheKey) return
      try {
        sessionStorage.setItem(
          `countup-${cacheKey}`,
          JSON.stringify({ previousValue: value, hasAnimated: true }),
        )
      } catch {
        // 忽略存储错误
      }
    },
    [cacheKey],
  )

  const getDecimalPlaces = (num: number): number => {
    const str = num.toString()
    if (str.includes('.')) {
      const decimals = str.split('.')[1]
      if (parseInt(decimals) !== 0) {
        return decimals.length
      }
    }
    return 0
  }

  const maxDecimals = Math.max(getDecimalPlaces(from), getDecimalPlaces(to))

  const formatValue = useCallback(
    (latest: number) => {
      const hasDecimals = maxDecimals > 0

      const options: Intl.NumberFormatOptions = {
        useGrouping: !!separator,
        minimumFractionDigits: hasDecimals ? maxDecimals : 0,
        maximumFractionDigits: hasDecimals ? maxDecimals : 0,
      }

      const formattedNumber = Intl.NumberFormat('en-US', options).format(latest)

      return separator ? formattedNumber.replace(/,/g, separator) : formattedNumber
    },
    [maxDecimals, separator],
  )

  useEffect(() => {
    if (ref.current) {
      ref.current.textContent = formatValue(direction === 'down' ? to : from)
    }
  }, [from, to, direction, formatValue])

  useEffect(() => {
    const shouldAnimate = isInView && startWhen
    const cachedState = getCachedState()
    const valueChanged = cachedState.previousValue !== null && cachedState.previousValue !== to
    const isFirstTime = !cachedState.hasAnimated

    // 首次加载或数值真正变化时才播放动画
    if (shouldAnimate && (isFirstTime || valueChanged)) {
      if (typeof onStart === 'function') {
        onStart()
      }

      const timeoutId = setTimeout(() => {
        setCachedState(to)

        // 使用 animate 函数进行精确时长控制
        const controls = animate(motionValue, direction === 'down' ? from : to, {
          duration,
          ease: 'easeOut',
          onComplete: () => {
            if (typeof onEnd === 'function') {
              onEnd()
            }
          },
        })

        return () => controls.stop()
      }, delay * 1000)

      return () => {
        clearTimeout(timeoutId)
      }
    } else if (shouldAnimate && !valueChanged && !isFirstTime) {
      // 如果值没变且不是首次，直接设置为最终值，不播放动画
      motionValue.set(to)
    }
  }, [
    isInView,
    startWhen,
    motionValue,
    direction,
    from,
    to,
    delay,
    onStart,
    onEnd,
    duration,
    getCachedState,
    setCachedState,
  ])

  useEffect(() => {
    const unsubscribe = motionValue.on('change', (latest: number) => {
      if (ref.current) {
        ref.current.textContent = formatValue(latest)
      }
    })

    return () => unsubscribe()
  }, [motionValue, formatValue])

  return <span className={className} ref={ref} />
}
