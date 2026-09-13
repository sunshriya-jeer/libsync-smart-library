import { CalendarDays } from 'lucide-react'
import type { ReportPeriod } from '../../types'
import { Button } from '../ui/Button'
import { PERIOD_LABELS } from './mockReports'

interface ReportPeriodFilterProps {
  period: ReportPeriod
  onChange: (period: ReportPeriod) => void
}

export function ReportPeriodFilter({ period, onChange }: ReportPeriodFilterProps) {
  return <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-slate-400" /><div className="flex rounded-lg border border-slate-200 bg-white p-1"><span className="sr-only">Report period</span>{(Object.keys(PERIOD_LABELS) as ReportPeriod[]).map((option) => <Button key={option} type="button" variant={period === option ? 'primary' : 'ghost'} size="sm" onClick={() => onChange(option)} aria-pressed={period === option}>{PERIOD_LABELS[option]}</Button>)}</div></div>
}
