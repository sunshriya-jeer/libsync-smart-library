import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  QrCode,
  Armchair,
  Clock,
  CheckCircle2,
  Sparkles,
  MapPin,
  Calendar,
  ArrowRight,
  TrendingUp,
  LoaderCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { fetchCurrentStudent } from '../services/studentService'
import {
  getActiveSessionForStudent,
  fetchStudentSessions,
  calculateDurationMinutes,
} from '../services/sessionService'
import { fetchSeats } from '../services/seatService'
import type { Student, LibrarySession, LibrarySeat } from '../types'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'

const ZONE_CONFIG: { code: 'A' | 'B' | 'C' | 'D'; name: string; desc: string }[] = [
  { code: 'A', name: 'Zone A - General Reading', desc: 'General Reading' },
  { code: 'B', name: 'Zone B - Quiet Study', desc: 'Quiet Study' },
  { code: 'C', name: 'Zone C - Tech & Laptop Hub', desc: 'Tech & Laptop Hub' },
  { code: 'D', name: 'Zone D - Collaborative Area', desc: 'Collaborative Area' },
]

function formatDuration(minutes: number): string {
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hrs === 0) return `${mins}m`
  return `${hrs}h ${mins}m`
}

export function StudentDashboardPage() {
  const { profile, session } = useAuth()
  const [student, setStudent] = useState<Student | null>(null)
  const [activeSessionInfo, setActiveSessionInfo] = useState<{
    session: LibrarySession
    seat: LibrarySeat
  } | null>(null)
  const [seats, setSeats] = useState<LibrarySeat[]>([])
  const [recentSessions, setRecentSessions] = useState<LibrarySession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [, setTick] = useState(0)

  useEffect(() => {
    let isMounted = true

    const loadDashboardData = async () => {
      try {
        const studentData = await fetchCurrentStudent()
        if (!isMounted) return
        setStudent(studentData)

        if (studentData?.id) {
          const [activeInfo, allSeats, recent] = await Promise.all([
            getActiveSessionForStudent(studentData.id),
            fetchSeats(),
            fetchStudentSessions(studentData.id, 4),
          ])
          if (!isMounted) return
          setActiveSessionInfo(activeInfo)
          setSeats(allSeats)
          setRecentSessions(recent)
        } else {
          const allSeats = await fetchSeats()
          if (!isMounted) return
          setSeats(allSeats)
        }
      } catch (err: unknown) {
        if (!isMounted) return
        console.error('[StudentDashboard] Error loading dashboard data:', err)
        setErrorMessage(
          err instanceof Error ? err.message : 'Unable to load dashboard data. Please try again.'
        )
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadDashboardData()

    return () => {
      isMounted = false
    }
  }, [])

  // Periodically refresh active duration display every 30 seconds if inside
  useEffect(() => {
    if (!activeSessionInfo) return
    const interval = setInterval(() => {
      setTick((t) => t + 1)
    }, 30000)
    return () => clearInterval(interval)
  }, [activeSessionInfo])

  const handleRetry = () => {
    setIsLoading(true)
    setErrorMessage(null)
    fetchCurrentStudent()
      .then(async (studentData) => {
        setStudent(studentData)
        if (studentData?.id) {
          const [activeInfo, allSeats, recent] = await Promise.all([
            getActiveSessionForStudent(studentData.id),
            fetchSeats(),
            fetchStudentSessions(studentData.id, 4),
          ])
          setActiveSessionInfo(activeInfo)
          setSeats(allSeats)
          setRecentSessions(recent)
        } else {
          const allSeats = await fetchSeats()
          setSeats(allSeats)
        }
      })
      .catch((err: unknown) => {
        setErrorMessage(
          err instanceof Error ? err.message : 'Unable to load dashboard data. Please try again.'
        )
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const isInside = Boolean(activeSessionInfo)
  const studentName =
    student?.fullName ||
    student?.full_name ||
    profile?.full_name ||
    session?.user.email?.split('@')[0] ||
    'Student'

  const totalSeats = seats.length
  const freeSeats = seats.filter((seat) => seat.status === 'free').length
  const percentFree = totalSeats > 0 ? Math.round((freeSeats / totalSeats) * 100) : 0

  const zones = ZONE_CONFIG.map((zone) => ({
    ...zone,
    free: seats.filter((s) => s.section === zone.code && s.status === 'free').length,
  }))

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <LoaderCircle className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
        <p className="text-sm font-medium text-slate-600">Loading student dashboard...</p>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <Card className="border-rose-200 bg-rose-50/50 my-6">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-rose-900">Failed to load dashboard data</h3>
              <p className="text-xs text-rose-700 mt-0.5">{errorMessage}</p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRetry}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  const currentSeat = activeSessionInfo?.seat
  const currentSession = activeSessionInfo?.session
  const elapsedMinutes = currentSession?.entryTime
    ? calculateDurationMinutes(currentSession.entryTime)
    : 0

  const entryDate = currentSession?.entryTime ? new Date(currentSession.entryTime) : null
  const entryTimeFormatted = entryDate
    ? entryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '—'
  const entryDateFormatted = entryDate
    ? entryDate.toLocaleDateString([], { month: 'short', day: 'numeric' })
    : '—'

  const activeZoneConfig = currentSeat
    ? ZONE_CONFIG.find((z) => z.code === currentSeat.section)
    : null

  return (
    <div className="space-y-6">
      {/* Student Welcome Card */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                <Sparkles className="w-3 h-3 mr-1" />
                Student Portal
              </span>
              <span className="text-xs text-indigo-300">• Central Library</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back, {studentName}
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 mt-1">
              Smart library seat allocation &amp; digital attendance
            </p>
          </div>

          <div className="shrink-0 self-start sm:self-auto">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                isInside
                  ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'
                  : 'bg-slate-800/60 text-slate-300 border-slate-700/60'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isInside ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
                }`}
              />
              {isInside ? 'Inside Library' : 'Outside Library'}
            </span>
          </div>
        </div>
      </div>

      {/* Current Status Card */}
      <Card className="border-indigo-100/80 shadow-xs">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div
                className={`w-3.5 h-3.5 rounded-full ${
                  isInside ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                }`}
              />
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Library Status
                </p>
                <p className="text-lg font-bold text-slate-900">
                  {isInside ? 'Currently Inside Library' : 'Currently Outside'}
                </p>
              </div>
            </div>

            <Badge variant={isInside ? 'success' : 'default'} size="md">
              {isInside ? 'Active Study Session' : 'No Active Session'}
            </Badge>
          </div>

          {isInside && currentSeat ? (
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <Armchair className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-medium">Assigned Seat</p>
                  <p className="text-sm font-bold text-slate-900">Seat {currentSeat.seatNumber}</p>
                  <p className="text-[11px] text-slate-400">
                    Zone {currentSeat.section} ({activeZoneConfig?.desc || 'Study Zone'})
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-medium">Check-in Time</p>
                  <p className="text-sm font-bold text-slate-900">{entryTimeFormatted}</p>
                  <p className="text-[11px] text-slate-400">{entryDateFormatted}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-medium">Session Duration</p>
                  <p className="text-sm font-bold text-slate-900">
                    {formatDuration(elapsedMinutes)}
                  </p>
                  <p className="text-[11px] text-emerald-600 font-semibold">Active now</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-sm text-slate-600">
                Ready to study? Head to the entrance kiosk and scan your student QR pass to be
                allocated a seat.
              </p>
              <Link to="/student/scan" className="shrink-0">
                <Button variant="primary" size="md" icon={<QrCode className="w-4 h-4" />}>
                  Show QR Pass
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Two Column Section: Quick QR Pass & Available Seats */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Quick QR Card - 5 cols */}
        <div className="md:col-span-5">
          <Card className="h-full flex flex-col justify-between">
            <CardHeader
              title="Student QR Pass"
              subtitle="Quick kiosk check-in & check-out"
            />
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-xs text-indigo-600 mb-3">
                  <QrCode className="w-16 h-16 stroke-[1.5]" />
                </div>
                <p className="font-bold text-slate-900 text-sm">{studentName}</p>
                <p className="text-xs font-mono text-slate-500 mt-0.5">
                  Token:{' '}
                  {student?.qr_token
                    ? student.qr_token.slice(0, 16) + '...'
                    : student?.college_barcode || 'LIB-STU'}
                </p>
                {student?.student_id && (
                  <p className="text-[11px] text-slate-400 font-mono">ID: {student.student_id}</p>
                )}
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-2">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Scanner
                </span>
              </div>

              <Link to="/student/scan" className="block">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  icon={<QrCode className="w-4 h-4" />}
                >
                  Open Full Pass
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Available Seats Overview - 7 cols */}
        <div className="md:col-span-7">
          <Card className="h-full">
            <CardHeader
              title="Available Seats Overview"
              subtitle={
                totalSeats > 0
                  ? `${freeSeats} of ${totalSeats} total library seats currently free`
                  : 'Checking seat availability...'
              }
              action={
                totalSeats > 0 ? (
                  <Badge variant="success" size="sm">
                    {percentFree}% Free
                  </Badge>
                ) : null
              }
            />
            <CardContent className="space-y-3">
              {zones.map((zone) => (
                <div
                  key={zone.code}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 hover:bg-slate-100/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                      {zone.code}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{zone.name}</p>
                      <p className="text-[11px] text-slate-400">Optimal study environment</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900">{zone.free} free</span>
                    <p className="text-[10px] text-emerald-600 font-medium">Available</p>
                  </div>
                </div>
              ))}

              <div className="pt-1">
                <Link
                  to="/student/seat"
                  className="flex items-center justify-end gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  <span>View seat guidelines &amp; map</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Visit History */}
      <Card>
        <CardHeader
          title="Recent Visit History"
          subtitle="Your library sessions and study records"
          action={
            <Link to="/student/history">
              <Button variant="ghost" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                View All
              </Button>
            </Link>
          }
        />
        <CardContent>
          {recentSessions.length === 0 ? (
            <div className="py-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700">No session history yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                When you check in at the entrance kiosk, your visits and study durations will be
                recorded here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentSessions.map((ses) => (
                <div key={ses.id} className="py-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        Seat {ses.seatNumber} • Zone {ses.section}
                      </p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>
                          {new Date(ses.entryTime).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-xs font-medium text-slate-700">
                        {ses.status === 'active'
                          ? 'Active'
                          : ses.durationMinutes
                            ? `${ses.durationMinutes} mins`
                            : '< 1 min'}
                      </p>
                      <p className="text-[10px] text-slate-400">Duration</p>
                    </div>
                    <Badge variant={ses.status === 'active' ? 'primary' : 'default'} size="sm">
                      {ses.status === 'active' ? 'Active' : 'Completed'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
