/**
 * Date and time formatting utilities for LibSync Smart Library.
 * Enforces India Standard Time (IST, Asia/Kolkata, UTC+05:30) across all user-facing displays.
 */

/**
 * Formats an ISO / UTC timestamp string or Date object into a readable
 * India Standard Time (IST, Asia/Kolkata) string.
 * Example output: "15 Sep 2026, 6:42 PM"
 */
export function formatIstDateTime(isoString?: string | Date | null): string {
  if (!isoString) return 'Not recorded'
  const date = typeof isoString === 'string' ? new Date(isoString) : isoString
  if (isNaN(date.getTime())) {
    return typeof isoString === 'string' ? isoString : 'Invalid date'
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  const parts: Record<string, string> = {}
  for (const part of formatter.formatToParts(date)) {
    parts[part.type] = part.value
  }

  const period = (parts.dayPeriod || '').toUpperCase()
  return `${parts.day} ${parts.month} ${parts.year}, ${parts.hour}:${parts.minute} ${period}`.trim()
}
