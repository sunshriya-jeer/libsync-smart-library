import { Armchair, Clock3, Gauge, Users } from 'lucide-react'
import { StatCard } from '../ui/StatCard'

interface ReportSummaryCardsProps { totalVisits: number; averageDuration: number; peakOccupancy: number; utilization: number }

export function ReportSummaryCards({ totalVisits, averageDuration, peakOccupancy, utilization }: ReportSummaryCardsProps) {
  return <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5"><StatCard title="Total Visits" value={totalVisits.toLocaleString()} icon={<Users className="h-5 w-5 text-indigo-600" />} iconBgClass="bg-indigo-50" trend={{ value: 'Selected period', isNeutral: true }} description="Recorded library visits" /><StatCard title="Avg. Session Duration" value={formatDuration(averageDuration)} icon={<Clock3 className="h-5 w-5 text-emerald-600" />} iconBgClass="bg-emerald-50" trend={{ value: 'Completed sessions', isPositive: true }} description="Across local history" /><StatCard title="Peak Occupancy" value={`${peakOccupancy}%`} icon={<Gauge className="h-5 w-5 text-amber-600" />} iconBgClass="bg-amber-50" trend={{ value: 'Busiest interval', isNeutral: true }} description="Based on seat capacity" /><StatCard title="Seat Utilization" value={`${utilization}%`} icon={<Armchair className="h-5 w-5 text-sky-600" />} iconBgClass="bg-sky-50" trend={{ value: 'Current snapshot', isPositive: true }} description="Occupied seats / total" /></div>
}

function formatDuration(minutes: number) { return minutes ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : '—' }
