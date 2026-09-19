import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  QrCode,
  Armchair,
  Clock,
  CheckCircle,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import { DashboardStats } from '../components/dashboard/DashboardStats'
import { LiveSeatMapPreview } from '../components/dashboard/LiveSeatMapPreview'
import { RecentActivityFeed } from '../components/dashboard/RecentActivityFeed'
import { QuickScanCard } from '../components/dashboard/QuickScanCard'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import type { LibrarySeat, LibrarySession } from '../types'
import { fetchSeats } from '../services/seatService'
import {
  fetchLibrarySessions,
  fetchRecentScans,
  fetchActiveSessions,
  type RecentScanRecord,
} from '../services/sessionService'
import { cn } from '../utils/cn'

export function LibrarianDashboardPage() {
  const [seats, setSeats] = useState<LibrarySeat[]>([])
  const [sessions, setSessions] = useState<LibrarySession[]>([])
  const [recentScans, setRecentScans] = useState<RecentScanRecord[]>([])
  const [activeInsideCount, setActiveInsideCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshDashboardData = useCallback(async () => {
    try {
      setIsRefreshing(true)
      setError(null)

      const [seatsData, sessionsData, scansData, activeData] = await Promise.all([
        fetchSeats(),
        fetchLibrarySessions(),
        fetchRecentScans(10),
        fetchActiveSessions(),
      ])

      setSeats(seatsData)
      setSessions(sessionsData)
      setRecentScans(scansData)
      setActiveInsideCount(activeData.uniqueStudentCount)
    } catch (err: unknown) {
      console.error('[LibrarianDashboardPage] Failed to refresh data:', err)
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to connect to the library database. Please check your connection and try again.'
      )
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadInitialData = async () => {
      try {
        const [seatsData, sessionsData, scansData, activeData] = await Promise.all([
          fetchSeats(),
          fetchLibrarySessions(),
          fetchRecentScans(10),
          fetchActiveSessions(),
        ])

        if (isMounted) {
          setSeats(seatsData)
          setSessions(sessionsData)
          setRecentScans(scansData)
          setActiveInsideCount(activeData.uniqueStudentCount)
          setError(null)
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.error('[LibrarianDashboardPage] Failed to load data:', err)
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to connect to the library database. Please check your connection and try again.'
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadInitialData()

    // Automatically refresh on window focus and tab visibility change
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        void refreshDashboardData()
      }
    }

    // Automatically refresh when an entry or exit completes across the app
    const handleSessionChange = () => {
      void refreshDashboardData()
    }

    window.addEventListener('visibilitychange', handleVisibilityOrFocus)
    window.addEventListener('focus', handleVisibilityOrFocus)
    window.addEventListener('libsync:session-change', handleSessionChange)

    // Periodic live sync every 10 seconds while dashboard tab is visible
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        void refreshDashboardData()
      }
    }, 10000)

    return () => {
      isMounted = false
      window.removeEventListener('visibilitychange', handleVisibilityOrFocus)
      window.removeEventListener('focus', handleVisibilityOrFocus)
      window.removeEventListener('libsync:session-change', handleSessionChange)
      clearInterval(interval)
    }
  }, [refreshDashboardData])

  // Real database metrics computation
  const totalSeats = seats.length
  const freeSeats = seats.filter((s) => s.status === 'free').length
  const occupiedSeats = seats.filter((s) => s.status === 'occupied').length

  // Fallback: unique students with active sessions (exit_time is null)
  const activeSessionsFromSessions = sessions.filter(
    (s) => (s.student_id || s.studentId) && !s.exitTime && !s.exit_time
  )
  const uniqueStudentsFromSessions = new Set(
    activeSessionsFromSessions
      .map((s) => s.student_id || s.studentId)
      .filter((id) => id && id !== '—')
  ).size

  const studentsInside = activeInsideCount ?? uniqueStudentsFromSessions

  const today = new Date()
  const todayVisits = sessions.filter((s) => {
    if (!s.entryTime) return false
    const entryDate = new Date(s.entryTime)
    return (
      entryDate.getFullYear() === today.getFullYear() &&
      entryDate.getMonth() === today.getMonth() &&
      entryDate.getDate() === today.getDate()
    )
  }).length

  const capacityStatusText =
    freeSeats === 0 ? 'Full' : freeSeats <= 5 ? 'Limited' : 'Optimal'
  const capacityBadgeVariant =
    freeSeats === 0 ? 'warning' : freeSeats <= 5 ? 'warning' : 'primary'

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Operations Desk Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="success" dot size="sm">
              Circulation Desk: Active Shift
            </Badge>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">Daily Operations Control</span>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
            Librarian Operations Desk
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Monitor real-time student entry, seat availability, and rapid check-in / check-out workflows.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
          <Link to="/scanner">
            <Button variant="primary" size="md" icon={<QrCode className="w-4 h-4" />}>
              Open Desk Scanner
            </Button>
          </Link>
          <Link to="/seats">
            <Button variant="outline" size="md" icon={<Armchair className="w-4 h-4" />}>
              Live Seat Map
            </Button>
          </Link>
          <Link to="/sessions">
            <Button variant="ghost" size="md" icon={<Clock className="w-4 h-4" />}>
              Active Sessions
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="md"
            onClick={() => void refreshDashboardData()}
            disabled={isLoading || isRefreshing}
            icon={<RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />}
            title="Refresh dashboard data"
          >
            {isRefreshing ? 'Syncing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Error Alert Banner */}
      {error && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between gap-3 text-xs sm:text-sm"
        >
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="truncate">{error}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refreshDashboardData()}
            className="shrink-0"
          >
            Retry
          </Button>
        </div>
      )}

      {/* 4 Key Operational Metrics */}
      <section aria-labelledby="librarian-stats-heading">
        <h2 id="librarian-stats-heading" className="sr-only">
          Circulation Key Metrics
        </h2>
        <DashboardStats
          studentsInside={studentsInside}
          availableSeats={freeSeats}
          occupiedSeats={occupiedSeats}
          totalSeats={totalSeats}
          todayVisits={todayVisits}
          isLoading={isLoading}
        />
      </section>

      {/* Main Floor & Desk Management Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Rapid Scanner & Quick Operations - 5 cols */}
        <div className="lg:col-span-5 space-y-6 min-w-0">
          <QuickScanCard />

          {/* Desk Quick Ops Card */}
          <Card>
            <CardHeader
              title="Desk Quick Operations"
              subtitle="Daily shift procedures and fast actions"
              action={
                <Badge variant="primary" size="sm">
                  Ready
                </Badge>
              }
            />
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs min-w-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate">Entrance Kiosks Synced</p>
                    <p className="text-slate-500 text-[11px] truncate">Kiosks A1, B1 online and scanning</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0 ml-2">
                  Online
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs min-w-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate">Seat Capacity Status</p>
                    <p className="text-slate-500 text-[11px] truncate">
                      {isLoading ? 'Syncing seats...' : `${freeSeats} free seats for incoming students`}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md shrink-0 ml-2">
                  <Badge variant={capacityBadgeVariant} size="sm">
                    {capacityStatusText}
                  </Badge>
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs min-w-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold shrink-0">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate">Current Occupancy</p>
                    <p className="text-slate-500 text-[11px] truncate">
                      {isLoading
                        ? 'Syncing active sessions...'
                        : `${studentsInside} verified students currently inside`}
                    </p>
                  </div>
                </div>
                <Link
                  to="/students"
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 underline shrink-0 ml-2"
                >
                  View Roster
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Seat Map Preview - 7 cols */}
        <div className="lg:col-span-7 space-y-6 min-w-0">
          <LiveSeatMapPreview seats={seats} isLoading={isLoading} />
        </div>
      </div>

      {/* Real-time Activity Stream */}
      <section aria-labelledby="activity-stream-heading">
        <h2 id="activity-stream-heading" className="sr-only">
          Live Library Activity Stream
        </h2>
        <RecentActivityFeed
          scans={recentScans}
          isLoading={isLoading}
          onRefresh={() => void refreshDashboardData()}
        />
      </section>
    </div>
  )
}
