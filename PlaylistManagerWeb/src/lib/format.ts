/**
 * The API stores timestamps in UTC but SQL Server returns them without a zone designator,
 * so treat any bare ISO string as UTC.
 */
export function parseApiDate(value: string): Date {
  const hasZone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(value)
  return new Date(hasZone ? value : `${value}Z`)
}

const dateFormat = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
const relativeFormat = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })

export function formatDate(value: string): string {
  const date = parseApiDate(value)
  return Number.isNaN(date.getTime()) ? '' : dateFormat.format(date)
}

/** "today", "yesterday", "3 days ago"; falls back to a calendar date after a month. */
export function formatRelative(value: string): string {
  const date = parseApiDate(value)
  if (Number.isNaN(date.getTime())) return ''
  const days = Math.round((date.getTime() - Date.now()) / 86_400_000)
  if (days > -1) return 'today'
  if (days > -30) return relativeFormat.format(days, 'day')
  return dateFormat.format(date)
}

export const plural = (count: number, one: string, many = `${one}s`) =>
  `${count.toLocaleString()} ${count === 1 ? one : many}`

export function greeting(now = new Date()): string {
  const hour = now.getHours()
  if (hour < 5) return 'Up late'
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = Array.from(parts[0])[0] ?? ''
  const last = parts.length > 1 ? (Array.from(parts[parts.length - 1])[0] ?? '') : ''
  return (first + last).toUpperCase()
}
