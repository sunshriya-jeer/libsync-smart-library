import { useEffect, useState } from 'react'
import { Users, Armchair, UserCheck, BookOpen } from 'lucide-react'
import { StatCard } from '../ui/StatCard'
import { fetchSeats } from '../../services/seatService'
import { fetchLibrarySessions, fetchActiveSessions } from '../../services/sessionService'

export interface DashboardStatsProps {
  studentsInside?: number
  availableSeats?: number
  occupiedSeats?: number
  totalSeats?: number
  todayVisits?: number
  isLoading?: boolean
}

export function DashboardStats({
  studentsInside: propStudentsInside,
  availableSeats: propAvailableSeats,
  occupiedSeats: propOccupiedSeats,
  totalSeats: propTotalSeats,
  todayVisits: propTodayVisits,
  isLoading: propIsLoading,
}: DashboardStatsProps = {}) {
  // If props are not provided, fetch real data as fallback (e.g. for Admin DashboardPage)
  const hasProps = propTotalSeats !== undefined || propStudentsInside !== undefined

  const [internalSeats, setInternalSeats] = useState<{
    total: number
    free: number
    occupied: number
  }>({ total: 0, free: 0, occupied: 0 })
  const [internalInside, setInternalInside] = useState(0)
  const [internalVisits, setInternalVisits] = useState(0)
  const [internalLoading, setInternalLoading] = useState(!hasProps)

  useEffect(() => {
    if (hasProps) return

    let isMounted = true

    const loadData = () => {
      Promise.allSettled([fetchSeats(), fetchLibrarySessions(), fetchActiveSessions()]).then(
        ([seatsRes, sessionsRes, activeRes]) => {
          if (!isMounted) return

          if (seatsRes.status === 'fulfilled') {
            const seats = seatsRes.value
            setInternalSeats({
              total: seats.length,
              free: seats.filter((s) => s.status === 'free').length,
              occupied: seats.filter((s) => s.status === 'occupied').length,
            })
          }

          if (activeRes.status === 'fulfilled') {
            setInternalInside(activeRes.value.uniqueStudentCount)
          } else if (sessionsRes.status === 'fulfilled') {
            const sessions = sessionsRes.value
            const activeStudents = new Set(
              sessions
                .filter((s) => (s.student_id || s.studentId) && (!s.exitTime && !s.exit_time))
                .map((s) => s.student_id || s.studentId)
                .filter((id) => id && id !== '—')
            )
            setInternalInside(activeStudents.size)
          }

          if (sessionsRes.status === 'fulfilled') {
            const sessions = sessionsRes.value
            const today = new Date()
            const visits = sessions.filter((s) => {
              const entry = s.entryTime || s.entry_time
              if (!entry) return false
              const d = new Date(entry)
              return (
                d.getFullYear() === today.getFullYear() &&
                d.getMonth() === today.getMonth() &&
                d.getDate() === today.getDate()
              )
            }).length
            setInternalVisits(visits)
          }

          setInternalLoading(false)
        }
      )
    }

    loadData()

    const handleSessionChange = () => {
      loadData()
    }
    window.addEventListener('libsync:session-change', handleSessionChange)

    return () => {
      isMounted = false
      window.removeEventListener('libsync:session-change', handleSessionChange)
    }
  }, [hasProps])

  const isLoading = propIsLoading ?? internalLoading
  const totalSeats = propTotalSeats ?? internalSeats.total
  const availableSeats = propAvailableSeats ?? internalSeats.free
  const occupiedSeats = propOccupiedSeats ?? internalSeats.occupied
  const studentsInside = propStudentsInside ?? internalInside
  const todayVisits = propTodayVisits ?? internalVisits

  const freePercent = totalSeats > 0 ? Math.round((availableSeats / totalSeats) * 100) : 0
  const occPercent = totalSeats > 0 ? Math.round((occupiedSeats / totalSeats) * 100) : 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* 1. Students Currently Inside */}
      <StatCard
        title="Students Currently Inside"
        value={isLoading ? '—' : studentsInside}
        icon={<Users className="w-5 h-5 text-indigo-600" />}
        iconBgClass="bg-indigo-50"
        trend={{
          value: isLoading ? 'Syncing...' : `${studentsInside} active`,
          isPositive: studentsInside > 0,
        }}
        description="Students currently in library"
      />

      {/* 2. Available Seats */}
      <StatCard
        title="Available Seats"
        value={isLoading ? '—' : availableSeats}
        icon={<Armchair className="w-5 h-5 text-emerald-600" />}
        iconBgClass="bg-emerald-50"
        trend={{
          value: isLoading ? 'Syncing...' : `${freePercent}% free`,
          isNeutral: true,
        }}
        description="Available for check-in"
      />

      {/* 3. Occupied Seats */}
      <StatCard
        title="Occupied Seats"
        value={isLoading ? '—' : occupiedSeats}
        icon={<UserCheck className="w-5 h-5 text-amber-600" />}
        iconBgClass="bg-amber-50"
        trend={{
          value: isLoading ? 'Syncing...' : `${occPercent}% full`,
          isNeutral: true,
        }}
        description="Currently occupied desks"
      />

      {/* 4. Total Seats */}
      <StatCard
        title="Total Seats"
        value={isLoading ? '—' : totalSeats}
        icon={<BookOpen className="w-5 h-5 text-sky-600" />}
        iconBgClass="bg-sky-50"
        trend={{
          value: isLoading ? 'Syncing...' : `${todayVisits} today`,
          isNeutral: true,
        }}
        description="Total library capacity"
      />
    </div>
  )
}
