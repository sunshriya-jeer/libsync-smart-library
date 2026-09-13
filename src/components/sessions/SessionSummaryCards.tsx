import { Activity, CheckCircle2, Clock3, History } from 'lucide-react'
import { StatCard } from '../ui/StatCard'

interface SessionSummaryCardsProps {
  total: number
  active: number
  completed: number
  averageDuration: number
}

export function SessionSummaryCards({ total, active, completed, averageDuration }: SessionSummaryCardsProps) {
  return <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5"><StatCard title="Total Sessions" value={total} icon={<History className="h-5 w-5 text-indigo-600" />} iconBgClass="bg-indigo-50" trend={{ value: 'All recorded', isNeutral: true }} description="Local session history" /><StatCard title="Active Sessions" value={active} icon={<Activity className="h-5 w-5 text-emerald-600" />} iconBgClass="bg-emerald-50" trend={{ value: active ? 'Currently inside' : 'None active', isPositive: Boolean(active) }} description="Open library visits" /><StatCard title="Completed Sessions" value={completed} icon={<CheckCircle2 className="h-5 w-5 text-sky-600" />} iconBgClass="bg-sky-50" trend={{ value: 'Visit history', isNeutral: true }} description="Finished visits" /><StatCard title="Average Duration" value={formatDuration(averageDuration)} icon={<Clock3 className="h-5 w-5 text-amber-600" />} iconBgClass="bg-amber-50" trend={{ value: averageDuration ? 'Across completed' : 'No completed data', isNeutral: !averageDuration }} description="Completed sessions" /></div>
}

function formatDuration(minutes: number) { return minutes ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : '—' }
