/**
 * 创建一个节流函数，在指定时间间隔内最多执行一次
 * @param fn 要节流的函数
 * @param interval 时间间隔（毫秒）
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  interval: number
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  let lastCallTime = 0

  return (...args: Parameters<T>): ReturnType<T> | undefined => {
    const now = Date.now()
    if (now - lastCallTime >= interval) {
      lastCallTime = now
      return fn(...args) as ReturnType<T>
    }
    return undefined
  }
}
