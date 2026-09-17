import type { LibrarySeat, LibrarySession, ReportPeriod } from '../types'
import { fetchLibrarySessions } from './sessionService'
import { fetchSeats } from './seatService'

export interface VisitDataPoint {
  label: string
  visits: number
}

export interface PeakHourData {
  label: string
  visits: number
}

export interface SectionUsageData {
  section: 'A' | 'B' | 'C' | 'D'
  visits: number
}

export interface ReportSummaryMetrics {
  totalVisits: number
  averageDuration: number
  peakOccupancy: number
  utilization: number
}

export interface ReportAnalytics {
  period: ReportPeriod
  periodLabel: string
  summary: ReportSummaryMetrics
  visits: VisitDataPoint[]
  peakHours: PeakHourData[]
  sectionUsage: SectionUsageData[]
  periodSessions: LibrarySession[]
  seats: LibrarySeat[]
  busiestHour: string
  busiestSection: string
  averageDuration: number
}

export const PERIOD_LABELS: Record<ReportPeriod, string> = {
  today: 'Today',
  sevenDays: 'Last 7 Days',
  thirtyDays: 'Last 30 Days',
}

const IST_TIMEZONE = 'Asia/Kolkata'

export interface IstDateParts {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
  weekday: string
}

/**
 * Extracts date parts in Asia/Kolkata timezone without manual offset math.
 */
export function getIstParts(date: Date): IstDateParts {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: IST_TIMEZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    weekday: 'short',
    hourCycle: 'h23',
  })

  const parts: Record<string, string> = {}
  for (const part of formatter.formatToParts(date)) {
    parts[part.type] = part.value
  }

  return {
    year: parseInt(parts.year, 10),
    month: parseInt(parts.month, 10),
    day: parseInt(parts.day, 10),
    hour: parseInt(parts.hour, 10),
    minute: parseInt(parts.minute, 10),
    second: parseInt(parts.second, 10),
    weekday: parts.weekday,
  }
}

/**
 * Formats a Date as YYYY-MM-DD in Asia/Kolkata.
 */
export function getIstDateString(date: Date): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: IST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  return formatter.format(date)
}

/**
 * Computes calendar day difference between two dates in Asia/Kolkata.
 * 0 = same day, 1 = target is 1 calendar day before fromDate, etc.
 */
export function getIstDayDifference(fromDate: Date, targetDate: Date): number {
  const fromStr = getIstDateString(fromDate)
  const targetStr = getIstDateString(targetDate)
  const msDiff = Date.parse(`${fromStr}T00:00:00Z`) - Date.parse(`${targetStr}T00:00:00Z`)
  return Math.round(msDiff / (24 * 60 * 60 * 1000))
}

/**
 * Checks if a session's entry_time falls within the requested period in IST.
 */
export function isSessionInPeriod(
  entryTime: string,
  period: ReportPeriod,
  now: Date = new Date()
): boolean {
  const sessionDate = new Date(entryTime)
  if (isNaN(sessionDate.getTime())) return false

  if (sessionDate.getTime() > now.getTime()) return false

  const diff = getIstDayDifference(now, sessionDate)
  if (diff < 0) return false

  if (period === 'today') {
    return diff === 0
  }
  if (period === 'sevenDays') {
    return diff < 7
  }
  if (period === 'thirtyDays') {
    return diff < 30
  }
  return false
}

/**
 * Formats an hour integer (0-23) into a user-friendly label (e.g. '9 AM', '12 PM', '5 PM').
 */
export function formatHourLabel(hour: number): string {
  if (hour === 0) return '12 AM'
  if (hour < 12) return `${hour} AM`
  if (hour === 12) return '12 PM'
  return `${hour - 12} PM`
}

/**
 * Peak occupancy percentage = maximum concurrent active sessions / total seat capacity * 100.
 * Sweep-line algorithm over interval overlaps.
 */
export function calculatePeakOccupancy(
  periodSessions: LibrarySession[],
  totalSeats: number,
  now: Date = new Date()
): { peakOccupancy: number; maxConcurrent: number } {
  if (totalSeats <= 0 || periodSessions.length === 0) {
    return { peakOccupancy: 0, maxConcurrent: 0 }
  }

  interface TimeEvent {
    time: number
    delta: number
  }
  const events: TimeEvent[] = []

  for (const session of periodSessions) {
    const entryMs = new Date(session.entryTime).getTime()
    if (isNaN(entryMs)) continue

    let exitMs: number
    if (session.exitTime) {
      exitMs = new Date(session.exitTime).getTime()
      if (isNaN(exitMs)) exitMs = now.getTime()
    } else {
      exitMs = now.getTime()
    }

    if (exitMs < entryMs) {
      exitMs = entryMs
    }

    events.push({ time: entryMs, delta: 1 })
    events.push({ time: exitMs, delta: -1 })
  }

  events.sort((a, b) => {
    if (a.time !== b.time) return a.time - b.time
    return a.delta - b.delta // exits (-1) process before entries (+1) on tie
  })

  let current = 0
  let maxConcurrent = 0

  for (const event of events) {
    current += event.delta
    if (current > maxConcurrent) {
      maxConcurrent = current
    }
  }

  const peakOccupancy = Math.min(100, Math.round((maxConcurrent / totalSeats) * 100))
  return { peakOccupancy, maxConcurrent }
}

/**
 * Calculates all analytical metrics for a given period from real session & seat datasets.
 */
export function calculateReportAnalytics(
  allSessions: LibrarySession[],
  seats: LibrarySeat[],
  period: ReportPeriod,
  now: Date = new Date()
): ReportAnalytics {
  const periodSessions = allSessions.filter((s) => isSessionInPeriod(s.entryTime, period, now))
  const totalVisits = periodSessions.length

  // 1. Current Seat Utilization (from real seats table)
  const totalSeats = seats.length
  const occupiedSeats = seats.filter((s) => s.status === 'occupied').length
  const utilization = totalSeats > 0 ? Math.round((occupiedSeats / totalSeats) * 100) : 0

  // 2. Completed Sessions Duration
  const completedSessions = periodSessions.filter(
    (s) => s.status === 'completed' && Boolean(s.exitTime)
  )
  const totalDuration = completedSessions.reduce((sum, s) => {
    const duration = s.durationMinutes ?? 0
    return sum + duration
  }, 0)
  const averageDuration =
    completedSessions.length > 0 ? Math.round(totalDuration / completedSessions.length) : 0

  // 3. Peak Occupancy
  const { peakOccupancy } = calculatePeakOccupancy(periodSessions, totalSeats, now)

  // 4. Visits Over Time Chart Data
  let visits: VisitDataPoint[]

  if (period === 'today') {
    // Hourly buckets for operating hours (9 AM - 6 PM, or expanded if sessions occur earlier/later)
    const sessionHours = periodSessions.map((s) => getIstParts(new Date(s.entryTime)).hour)
    const minHour = sessionHours.length > 0 ? Math.min(9, Math.min(...sessionHours)) : 9
    const maxHour = sessionHours.length > 0 ? Math.max(18, Math.max(...sessionHours)) : 18

    const hourMap = new Map<number, number>()
    for (let h = minHour; h <= maxHour; h++) {
      hourMap.set(h, 0)
    }
    for (const h of sessionHours) {
      hourMap.set(h, (hourMap.get(h) ?? 0) + 1)
    }

    visits = Array.from(hourMap.entries()).map(([h, count]) => ({
      label: formatHourLabel(h),
      visits: count,
    }))
  } else if (period === 'sevenDays') {
    // 7 days ending today (chronological order: 6 days ago -> today)
    const dayMap = new Map<number, { label: string; visits: number }>()

    for (let offset = 6; offset >= 0; offset--) {
      const dayDate = new Date(now.getTime() - offset * 24 * 60 * 60 * 1000)
      const parts = getIstParts(dayDate)
      dayMap.set(offset, { label: parts.weekday, visits: 0 })
    }

    for (const s of periodSessions) {
      const sDate = new Date(s.entryTime)
      const diff = getIstDayDifference(now, sDate)
      if (diff >= 0 && diff < 7) {
        const item = dayMap.get(diff)
        if (item) item.visits++
      }
    }

    // Sort chronologically (offset 6 down to 0)
    visits = Array.from(dayMap.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([, data]) => data)
  } else {
    // 30 Days -> 4 Week Buckets
    const weekBuckets = [
      { label: 'Week 1', minDiff: 22, maxDiff: 29, visits: 0 },
      { label: 'Week 2', minDiff: 15, maxDiff: 21, visits: 0 },
      { label: 'Week 3', minDiff: 8, maxDiff: 14, visits: 0 },
      { label: 'Week 4', minDiff: 0, maxDiff: 7, visits: 0 },
    ]

    for (const s of periodSessions) {
      const sDate = new Date(s.entryTime)
      const diff = getIstDayDifference(now, sDate)
      for (const bucket of weekBuckets) {
        if (diff >= bucket.minDiff && diff <= bucket.maxDiff) {
          bucket.visits++
          break
        }
      }
    }

    visits = weekBuckets.map((b) => ({ label: b.label, visits: b.visits }))
  }

  // 5. Peak Hours Chart Data
  const defaultPeakHours = [9, 10, 11, 12, 13, 14, 15, 16, 17] // 9 AM to 5 PM
  const periodEntryHours = periodSessions.map((s) => getIstParts(new Date(s.entryTime)).hour)
  const allActiveHours = Array.from(new Set([...defaultPeakHours, ...periodEntryHours])).sort(
    (a, b) => a - b
  )

  const peakHourCounts = new Map<number, number>()
  for (const h of allActiveHours) {
    peakHourCounts.set(h, 0)
  }
  for (const h of periodEntryHours) {
    peakHourCounts.set(h, (peakHourCounts.get(h) ?? 0) + 1)
  }

  const peakHours: PeakHourData[] = Array.from(peakHourCounts.entries()).map(([h, count]) => ({
    label: formatHourLabel(h),
    visits: count,
  }))

  let busiestHour = '—'
  let maxHourVisits = 0
  for (const point of peakHours) {
    if (point.visits > maxHourVisits) {
      maxHourVisits = point.visits
      busiestHour = point.label
    }
  }

  // 6. Section-Wise Usage
  const sectionCounts: Record<'A' | 'B' | 'C' | 'D', number> = {
    A: 0,
    B: 0,
    C: 0,
    D: 0,
  }

  for (const s of periodSessions) {
    const sec = s.section
    if (sec === 'A' || sec === 'B' || sec === 'C' || sec === 'D') {
      sectionCounts[sec]++
    }
  }

  const sectionUsage: SectionUsageData[] = [
    { section: 'A', visits: sectionCounts.A },
    { section: 'B', visits: sectionCounts.B },
    { section: 'C', visits: sectionCounts.C },
    { section: 'D', visits: sectionCounts.D },
  ]

  let busiestSection = '—'
  let maxSectionVisits = 0
  for (const item of sectionUsage) {
    if (item.visits > maxSectionVisits) {
      maxSectionVisits = item.visits
      busiestSection = item.section
    }
  }

  return {
    period,
    periodLabel: PERIOD_LABELS[period],
    summary: {
      totalVisits,
      averageDuration,
      peakOccupancy,
      utilization,
    },
    visits,
    peakHours,
    sectionUsage,
    periodSessions,
    seats,
    busiestHour,
    busiestSection,
    averageDuration,
  }
}

/**
 * Fetches real Supabase data and computes report analytics for the specified period.
 */
export async function fetchReportData(period: ReportPeriod = 'sevenDays'): Promise<{
  analytics: ReportAnalytics
  allSessions: LibrarySession[]
  seats: LibrarySeat[]
}> {
  const [allSessions, seats] = await Promise.all([fetchLibrarySessions(), fetchSeats()])

  const analytics = calculateReportAnalytics(allSessions, seats, period)

  return {
    analytics,
    allSessions,
    seats,
  }
}
