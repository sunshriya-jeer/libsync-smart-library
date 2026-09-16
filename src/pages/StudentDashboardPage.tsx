import { useState } from 'react'
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
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { INITIAL_MOCK_SEATS } from '../components/seats/mockSeats'
import { INITIAL_MOCK_SESSIONS } from '../components/sessions/mockSessions'

export function StudentDashboardPage() {
  const { profile, session } = useAuth()
  // Mock status state: supports toggling between Inside / Outside for demo/testing purposes
  const [isInside, setIsInside] = useState(true)

  const studentName = profile?.full_name || session?.user.email?.split('@')[0] || 'Student'
  const freeSeats = INITIAL_MOCK_SEATS.filter((seat) => seat.status === 'free').length
  const totalSeats = INITIAL_MOCK_SEATS.length

  const zones = [
    { code: 'A', name: 'Zone A - General Reading', free: INITIAL_MOCK_SEATS.filter((s) => s.section === 'A' && s.status === 'free').length },
    { code: 'B', name: 'Zone B - Quiet Study', free: INITIAL_MOCK_SEATS.filter((s) => s.section === 'B' && s.status === 'free').length },
    { code: 'C', name: 'Zone C - Tech & Laptop Hub', free: INITIAL_MOCK_SEATS.filter((s) => s.section === 'C' && s.status === 'free').length },
    { code: 'D', name: 'Zone D - Collaborative Area', free: INITIAL_MOCK_SEATS.filter((s) => s.section === 'D' && s.status === 'free').length },
  ]

  // Recent 3 visits from mock sessions
  const studentSessions = INITIAL_MOCK_SESSIONS.slice(0, 4)

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

          {/* Demo toggle for test verification */}
          <div className="flex items-center gap-2 bg-indigo-950/60 p-1.5 rounded-xl border border-indigo-700/50 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setIsInside(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isInside
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-indigo-200 hover:text-white'
              }`}
            >
              Inside
            </button>
            <button
              type="button"
              onClick={() => setIsInside(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                !isInside
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'text-indigo-200 hover:text-white'
              }`}
            >
              Outside
            </button>
          </div>
        </div>
      </div>

      {/* Current Status Card */}
      <Card className="border-indigo-100/80 shadow-xs">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div
                className={`w-3.5 h-3.5 rounded-full animate-pulse ${
                  isInside ? 'bg-emerald-500' : 'bg-slate-400'
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

          {isInside ? (
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <Armchair className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-medium">Assigned Seat</p>
                  <p className="text-sm font-bold text-slate-900">Seat B-04</p>
                  <p className="text-[11px] text-slate-400">Zone B (Quiet Study)</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-medium">Check-in Time</p>
                  <p className="text-sm font-bold text-slate-900">10:15 AM</p>
                  <p className="text-[11px] text-slate-400">Today, Sept 15</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-medium">Session Duration</p>
                  <p className="text-sm font-bold text-slate-900">1h 45m</p>
                  <p className="text-[11px] text-emerald-600 font-semibold">Active now</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-sm text-slate-600">
                Ready to study? Head to the entrance kiosk and scan your student QR pass to be allocated a seat.
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
                <p className="text-xs text-slate-500 mt-0.5">Token: LIB-2026-STU</p>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-2">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Scanner
                </span>
              </div>

              <Link to="/student/scan" className="block">
                <Button variant="primary" size="md" className="w-full" icon={<QrCode className="w-4 h-4" />}>
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
              subtitle={`${freeSeats} of ${totalSeats} total library seats currently free`}
              action={
                <Badge variant="success" size="sm">
                  {Math.round((freeSeats / totalSeats) * 100)}% Free
                </Badge>
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
                <Link to="/student/seat" className="flex items-center justify-end gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800">
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
          <div className="divide-y divide-slate-100">
            {studentSessions.map((ses) => (
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
                      <span>{new Date(ses.entryTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-xs font-medium text-slate-700">
                      {ses.durationMinutes ? `${ses.durationMinutes} mins` : 'Active'}
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
        </CardContent>
      </Card>
    </div>
  )
}
