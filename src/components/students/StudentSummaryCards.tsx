import { Users, UserCheck, MapPin, UserX } from 'lucide-react'
import { StatCard } from '../ui/StatCard'

interface StudentSummaryCardsProps {
  totalCount?: number
  insideCount?: number
  activeCount?: number
  inactiveCount?: number
}

export function StudentSummaryCards({
  totalCount = 1280,
  insideCount = 142,
  activeCount = 1138,
  inactiveCount = 142,
}: StudentSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* 1. Total Students */}
      <StatCard
        title="Total Students"
        value={totalCount.toLocaleString()}
        icon={<Users className="w-5 h-5 text-indigo-600" />}
        iconBgClass="bg-indigo-50"
        trend={{
          value: 'All Registered',
          isNeutral: true,
        }}
        description="Campus library database"
      />

      {/* 2. Active Students */}
      <StatCard
        title="Active Students"
        value={activeCount.toLocaleString()}
        icon={<UserCheck className="w-5 h-5 text-emerald-600" />}
        iconBgClass="bg-emerald-50"
        trend={{
          value: '88.9% eligible',
          isPositive: true,
        }}
        description="Valid RFID & digital passes"
      />

      {/* 3. Currently Inside */}
      <StatCard
        title="Currently Inside"
        value={insideCount.toLocaleString()}
        icon={<MapPin className="w-5 h-5 text-sky-600" />}
        iconBgClass="bg-sky-50"
        trend={{
          value: 'Live Occupancy',
          isPositive: true,
        }}
        description="Students with active sessions"
      />

      {/* 4. Inactive Students */}
      <StatCard
        title="Inactive Students"
        value={inactiveCount.toLocaleString()}
        icon={<UserX className="w-5 h-5 text-rose-600" />}
        iconBgClass="bg-rose-50"
        trend={{
          value: 'Requires renewal',
          isNeutral: true,
        }}
        description="Deactivated or expired passes"
      />
    </div>
  )
}
