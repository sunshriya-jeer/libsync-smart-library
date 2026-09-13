import { Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DashboardStats } from '../components/dashboard/DashboardStats'
import { LiveSeatMapPreview } from '../components/dashboard/LiveSeatMapPreview'
import { RecentActivityFeed } from '../components/dashboard/RecentActivityFeed'
import { QuickScanCard } from '../components/dashboard/QuickScanCard'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'

export function DashboardPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Badge variant="primary" dot size="sm">
              Operational Status: Optimal
            </Badge>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">Academic Term 2026</span>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
            Library Operations Dashboard
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            <span className="text-indigo-600 font-semibold">LibSync</span> — Scan. Sit. Study. Sync. Local seat allocation &amp; student flow.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link to="/scanner">
            <Button variant="primary" size="md" icon={<Sparkles className="w-4 h-4" />}>
              Open Scanner
            </Button>
          </Link>
          <Link to="/seats">
            <Button variant="outline" size="md">
              View All Seats
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">Library Key Metrics</h2>
        <DashboardStats />
      </section>

      {/* Main Floor Map & Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live Seat Map Preview - 7 columns on desktop */}
        <div className="lg:col-span-7">
          <LiveSeatMapPreview />
        </div>

        {/* Quick Scan Card - 5 columns on desktop */}
        <div className="lg:col-span-5">
          <QuickScanCard />
        </div>
      </div>

      {/* Recent Activity Full-width Feed */}
      <section aria-labelledby="activity-heading">
        <h2 id="activity-heading" className="sr-only">Recent Activity Stream</h2>
        <RecentActivityFeed />
      </section>
    </div>
  )
}
