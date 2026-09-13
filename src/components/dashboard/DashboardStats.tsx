import { Users, Armchair, UserCheck, Activity } from 'lucide-react'
import { StatCard } from '../ui/StatCard'
import { INITIAL_MOCK_SEATS } from '../seats/mockSeats'
import { INITIAL_MOCK_STUDENTS } from '../students/mockStudents'

export function DashboardStats() {
  const studentsInside = INITIAL_MOCK_STUDENTS.filter((student) => student.status === 'inside').length
  const availableSeats = INITIAL_MOCK_SEATS.filter((seat) => seat.status === 'free').length
  const occupiedSeats = INITIAL_MOCK_SEATS.filter((seat) => seat.status === 'occupied').length
  const totalSeats = INITIAL_MOCK_SEATS.length

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* 1. Students Inside */}
      <StatCard
        title="Students Inside"
        value={studentsInside}
        icon={<Users className="w-5 h-5 text-indigo-600" />}
        iconBgClass="bg-indigo-50"
        trend={{
          value: '+12% vs last hour',
          isPositive: true,
        }}
        description="Current local occupancy"
      />

      {/* 2. Available Seats */}
      <StatCard
        title="Available Seats"
        value={availableSeats}
        icon={<Armchair className="w-5 h-5 text-emerald-600" />}
        iconBgClass="bg-emerald-50"
        trend={{
          value: `${Math.round((availableSeats / totalSeats) * 100)}% free`,
          isNeutral: true,
        }}
        description="Available across Sections A-D"
      />

      {/* 3. Occupied Seats */}
      <StatCard
        title="Occupied Seats"
        value={occupiedSeats}
        icon={<UserCheck className="w-5 h-5 text-amber-600" />}
        iconBgClass="bg-amber-50"
        trend={{
          value: `${Math.round((occupiedSeats / totalSeats) * 100)}% full`,
          isNeutral: true,
        }}
        description={`${totalSeats} total library seats`}
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
