const toDate = (timestamp: number): Date => new Date(timestamp * 1000)

const formatDateGroup = (timestamp: number): string => {
  const date = toDate(timestamp)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()

  if (isSameDay(date, today)) return '今天'
  if (isSameDay(date, yesterday)) return '昨天'
  return `${date.getMonth() + 1} 月 ${date.getDate()} 日`
}

const formatTime = (timestamp: number): string => {
  const date = toDate(timestamp)
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const period = hours >= 12 ? '下午' : '上午'
  const hour12 = hours % 12 || 12
  const hourStr = hour12.toString().padStart(2, '0')
  const minuteStr = minutes.toString().padStart(2, '0')
  return `${hourStr}:${minuteStr} \u00A0${period}`
}

const getDateKey = (timestamp: number): string => {
  const date = toDate(timestamp)
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

export { formatDateGroup, formatTime, getDateKey }
