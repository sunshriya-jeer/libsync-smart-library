import type { ReportPeriod } from '../../types'

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

export interface ReportPeriodData {
  visits: VisitDataPoint[]
  peakHours: PeakHourData[]
  sectionUsage: SectionUsageData[]
  peakOccupancy: number
}

export const REPORT_PERIOD_DATA: Record<ReportPeriod, ReportPeriodData> = {
  today: {
    peakOccupancy: 87,
    visits: [
      { label: '9 AM', visits: 18 },
      { label: '10 AM', visits: 31 },
      { label: '11 AM', visits: 42 },
      { label: '12 PM', visits: 36 },
      { label: '1 PM', visits: 28 },
      { label: '2 PM', visits: 44 },
      { label: '3 PM', visits: 39 },
      { label: '4 PM', visits: 27 },
      { label: '5 PM', visits: 19 },
    ],
    peakHours: [
      { label: '9 AM', visits: 18 }, { label: '10 AM', visits: 31 }, { label: '11 AM', visits: 42 },
      { label: '12 PM', visits: 36 }, { label: '1 PM', visits: 28 }, { label: '2 PM', visits: 44 },
      { label: '3 PM', visits: 39 }, { label: '4 PM', visits: 27 }, { label: '5 PM', visits: 19 },
    ],
    sectionUsage: [{ section: 'A', visits: 72 }, { section: 'B', visits: 64 }, { section: 'C', visits: 58 }, { section: 'D', visits: 54 }],
  },
  sevenDays: {
    peakOccupancy: 92,
    visits: [
      { label: 'Mon', visits: 312 }, { label: 'Tue', visits: 348 }, { label: 'Wed', visits: 376 },
      { label: 'Thu', visits: 341 }, { label: 'Fri', visits: 298 }, { label: 'Sat', visits: 214 }, { label: 'Sun', visits: 184 },
    ],
    peakHours: [
      { label: '9 AM', visits: 126 }, { label: '10 AM', visits: 182 }, { label: '11 AM', visits: 224 },
      { label: '12 PM', visits: 248 }, { label: '1 PM', visits: 196 }, { label: '2 PM', visits: 276 },
      { label: '3 PM', visits: 264 }, { label: '4 PM', visits: 218 }, { label: '5 PM', visits: 151 },
    ],
    sectionUsage: [{ section: 'A', visits: 492 }, { section: 'B', visits: 456 }, { section: 'C', visits: 421 }, { section: 'D', visits: 404 }],
  },
  thirtyDays: {
    peakOccupancy: 96,
    visits: [
      { label: 'Week 1', visits: 1480 }, { label: 'Week 2', visits: 1624 }, { label: 'Week 3', visits: 1748 }, { label: 'Week 4', visits: 1812 },
    ],
    peakHours: [
      { label: '9 AM', visits: 508 }, { label: '10 AM', visits: 716 }, { label: '11 AM', visits: 892 },
      { label: '12 PM', visits: 964 }, { label: '1 PM', visits: 782 }, { label: '2 PM', visits: 1086 },
      { label: '3 PM', visits: 1038 }, { label: '4 PM', visits: 846 }, { label: '5 PM', visits: 622 },
    ],
    sectionUsage: [{ section: 'A', visits: 2348 }, { section: 'B', visits: 2186 }, { section: 'C', visits: 2074 }, { section: 'D', visits: 1984 }],
  },
}

export const PERIOD_LABELS: Record<ReportPeriod, string> = {
  today: 'Today',
  sevenDays: 'Last 7 Days',
  thirtyDays: 'Last 30 Days',
}
