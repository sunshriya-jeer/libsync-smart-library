import { Link } from 'react-router-dom'
import { QrCode, Armchair, Clock, CheckCircle, ShieldAlert, Sparkles } from 'lucide-react'
import { DashboardStats } from '../components/dashboard/DashboardStats'
import { LiveSeatMapPreview } from '../components/dashboard/LiveSeatMapPreview'
import { RecentActivityFeed } from '../components/dashboard/RecentActivityFeed'
import { QuickScanCard } from '../components/dashboard/QuickScanCard'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { INITIAL_MOCK_STUDENTS } from '../components/students/mockStudents'
import { INITIAL_MOCK_SEATS } from '../components/seats/mockSeats'

export function LibrarianDashboardPage() {
  const studentsInside = INITIAL_MOCK_STUDENTS.filter((s) => s.status === 'inside').length
  const freeSeats = INITIAL_MOCK_SEATS.filter((s) => s.status === 'free').length

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Operations Desk Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
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

        <div className="flex flex-wrap items-center gap-3 shrink-0">
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
        </div>
      </div>

      {/* 4 Key Operational Metrics */}
      <section aria-labelledby="librarian-stats-heading">
        <h2 id="librarian-stats-heading" className="sr-only">Circulation Key Metrics</h2>
        <DashboardStats />
      </section>

      {/* Main Floor & Desk Management Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Rapid Scanner & Quick Operations - 5 cols */}
        <div className="lg:col-span-5 space-y-6">
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
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Entrance Kiosks Synced</p>
                    <p className="text-slate-500 text-[11px]">Kiosks A1, B1 online and scanning</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Online</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Seat Capacity Status</p>
                    <p className="text-slate-500 text-[11px]">{freeSeats} free seats for incoming students</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">Optimal</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Current Occupancy</p>
                    <p className="text-slate-500 text-[11px]">{studentsInside} verified students currently inside</p>
                  </div>
                </div>
                <Link to="/students" className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 underline">
                  View Roster
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Seat Map Preview - 7 cols */}
        <div className="lg:col-span-7 space-y-6">
          <LiveSeatMapPreview />
        </div>
      </div>

      {/* Real-time Activity Stream */}
      <section aria-labelledby="activity-stream-heading">
        <h2 id="activity-stream-heading" className="sr-only">Live Library Activity Stream</h2>
        <RecentActivityFeed />
      </section>
    </div>
  )
}
