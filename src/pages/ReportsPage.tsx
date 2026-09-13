import { useState } from 'react'
import { BarChart3 } from 'lucide-react'
import type { ReportPeriod } from '../types'
import { Badge } from '../components/ui/Badge'
import { ReportInsights } from '../components/reports/ReportInsights'
import { PeakHours } from '../components/reports/PeakHours'
import { ReportPeriodFilter } from '../components/reports/ReportPeriodFilter'
import { ReportSummaryCards } from '../components/reports/ReportSummaryCards'
import { SectionUsage } from '../components/reports/SectionUsage'
import { SeatUtilization } from '../components/reports/SeatUtilization'
import { SessionDuration } from '../components/reports/SessionDuration'
import { VisitsChart } from '../components/reports/VisitsChart'
import { REPORT_PERIOD_DATA, PERIOD_LABELS } from '../components/reports/mockReports'
import { INITIAL_MOCK_SEATS } from '../components/seats/mockSeats'
import { INITIAL_MOCK_SESSIONS } from '../components/sessions/mockSessions'

export function ReportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>('sevenDays')
  const report = REPORT_PERIOD_DATA[period]
  const totalVisits = report.visits.reduce((total, point) => total + point.visits, 0)
  const completedSessions = INITIAL_MOCK_SESSIONS.filter((session) => session.status === 'completed')
  const averageDuration = completedSessions.length ? Math.round(completedSessions.reduce((total, session) => total + (session.durationMinutes ?? 0), 0) / completedSessions.length) : 0
  const peakHour = report.peakHours.reduce((highest, point) => point.visits > highest.visits ? point : highest, report.peakHours[0])
  const busiestSection = report.sectionUsage.reduce((highest, item) => item.visits > highest.visits ? item : highest, report.sectionUsage[0])
  const occupiedSeats = INITIAL_MOCK_SEATS.filter((seat) => seat.status === 'occupied').length
  const utilization = INITIAL_MOCK_SEATS.length ? Math.round((occupiedSeats / INITIAL_MOCK_SEATS.length) * 100) : 0

  return <div className="space-y-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><div className="flex items-center gap-2"><Badge variant="primary" size="sm">Operational analytics</Badge><span className="text-xs text-slate-400">•</span><span className="text-xs font-medium text-slate-500">Mock data snapshot</span></div><h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Reports &amp; Analytics</h2><p className="mt-1 text-xs text-slate-500 sm:text-sm">Understand library usage, occupancy, and seat utilization.</p></div><ReportPeriodFilter period={period} onChange={setPeriod} /></div><ReportSummaryCards totalVisits={totalVisits} averageDuration={averageDuration} peakOccupancy={report.peakOccupancy} utilization={utilization} /><VisitsChart data={report.visits} /><div className="grid grid-cols-1 gap-6 lg:grid-cols-2"><PeakHours data={report.peakHours} /><SeatUtilization seats={INITIAL_MOCK_SEATS} /></div><div className="grid grid-cols-1 gap-6 lg:grid-cols-2"><SectionUsage data={report.sectionUsage} /><SessionDuration sessions={INITIAL_MOCK_SESSIONS} /></div><ReportInsights busiestHour={peakHour.label} busiestSection={busiestSection.section} averageDuration={averageDuration} periodLabel={PERIOD_LABELS[period]} /><div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50 p-3 text-xs text-slate-500"><BarChart3 className="h-4 w-4 text-indigo-600" />Analytics are calculated from the current fictional sessions and seat inventory plus the selected local reporting snapshot.</div></div>
}
