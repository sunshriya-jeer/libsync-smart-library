import { TrendingUp, Calendar, Download } from 'lucide-react'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'

export function ReportsPage() {
  const weeklyTrends = [
    { day: 'Mon', visits: 412, peak: '84%', busiestHour: '2:00 PM' },
    { day: 'Tue', visits: 489, peak: '92%', busiestHour: '3:00 PM' },
    { day: 'Wed', visits: 520, peak: '96%', busiestHour: '2:30 PM' },
    { day: 'Thu', visits: 470, peak: '88%', busiestHour: '1:30 PM' },
    { day: 'Fri', visits: 395, peak: '76%', busiestHour: '11:00 AM' },
    { day: 'Sat', visits: 240, peak: '52%', busiestHour: '12:00 PM' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Library Analytics &amp; Reports
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Historical attendance trends, peak occupancy intervals, and study zone utilization.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="md" icon={<Calendar className="w-4 h-4" />}>
            This Week
          </Button>
          <Button variant="primary" size="md" icon={<Download className="w-4 h-4" />}>
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <span className="text-xs font-medium text-slate-500">Weekly Total Check-Ins</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">2,526</div>
            <div className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+14.2% from prior week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <span className="text-xs font-medium text-slate-500">Peak Occupancy Recorded</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">96%</div>
            <div className="text-xs text-slate-500 mt-2">
              Wednesday @ 2:30 PM
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <span className="text-xs font-medium text-slate-500">Most Popular Study Zone</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">Zone B</div>
            <div className="text-xs text-slate-500 mt-2">
              Silent Research Hall (91% avg)
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Daily Occupancy Breakdown"
          subtitle="Aggregated check-in volume and peak utilization"
        />

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 sm:px-6">Day</th>
                  <th className="py-3 px-4">Total Visits</th>
                  <th className="py-3 px-4">Peak Occupancy Rate</th>
                  <th className="py-3 px-4">Busiest Hour Window</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {weeklyTrends.map((trend) => (
                  <tr key={trend.day} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900 text-xs">
                      {trend.day}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-700">
                      {trend.visits} visits
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-900">
                      {trend.peak}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {trend.busiestHour}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <Badge variant="primary" size="sm">Normal Distribution</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
