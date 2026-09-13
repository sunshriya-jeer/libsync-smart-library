import { Armchair, CheckCircle2, Construction, Users } from 'lucide-react'
import { StatCard } from '../ui/StatCard'

interface SeatSummaryCardsProps {
  total: number
  free: number
  occupied: number
  maintenance: number
}

export function SeatSummaryCards({ total, free, occupied, maintenance }: SeatSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
      <StatCard title="Total Seats" value={total} icon={<Armchair className="h-5 w-5 text-indigo-600" />} iconBgClass="bg-indigo-50" trend={{ value: 'All sections', isNeutral: true }} description="Library seating inventory" />
      <StatCard title="Available" value={free} icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />} iconBgClass="bg-emerald-50" trend={{ value: `${Math.round((free / total) * 100)}% free`, isPositive: true }} description="Ready for allocation" />
      <StatCard title="Occupied" value={occupied} icon={<Users className="h-5 w-5 text-amber-600" />} iconBgClass="bg-amber-50" trend={{ value: `${Math.round((occupied / total) * 100)}% full`, isNeutral: true }} description="Active study sessions" />
      <StatCard title="Maintenance" value={maintenance} icon={<Construction className="h-5 w-5 text-rose-600" />} iconBgClass="bg-rose-50" trend={{ value: maintenance ? 'Needs attention' : 'Clear', isNeutral: !maintenance }} description="Temporarily unavailable" />
    </div>
  )
}
