import { Users, Armchair, UserCheck, Activity } from 'lucide-react'
import { StatCard } from '../ui/StatCard'

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* 1. Students Inside */}
      <StatCard
        title="Students Inside"
        value="142"
        icon={<Users className="w-5 h-5 text-indigo-600" />}
        iconBgClass="bg-indigo-50"
        trend={{
          value: '+12% vs last hour',
          isPositive: true,
        }}
        description="Peak capacity estimated at 2:00 PM"
      />

      {/* 2. Available Seats */}
      <StatCard
        title="Available Seats"
        value="58"
        icon={<Armchair className="w-5 h-5 text-emerald-600" />}
        iconBgClass="bg-emerald-50"
        trend={{
          value: '29% free',
          isNeutral: true,
        }}
        description="Zones A & C have immediate seating"
      />

      {/* 3. Occupied Seats */}
      <StatCard
        title="Occupied Seats"
        value="142"
        icon={<UserCheck className="w-5 h-5 text-amber-600" />}
        iconBgClass="bg-amber-50"
        trend={{
          value: '71% full',
          isNeutral: true,
        }}
        description="200 total active study desks"
      />

      {/* 4. Today's Visits */}
      <StatCard
        title="Today's Visits"
        value="384"
        icon={<Activity className="w-5 h-5 text-sky-600" />}
        iconBgClass="bg-sky-50"
        trend={{
          value: '+18% vs yesterday',
          isPositive: true,
        }}
        description="Cumulative check-ins recorded"
      />
    </div>
  )
}
