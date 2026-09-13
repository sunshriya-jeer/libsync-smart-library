import { Clock, Timer, UserCheck, AlertCircle } from 'lucide-react'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'

export function SessionsPage() {
  const mockSessions = [
    { id: 'SES-9401', studentMask: 'STU-****4891', seat: 'Seat A-24', zone: 'Silent Study', startTime: '08:30 AM', elapsed: '2h 15m', maxAllowed: '4h 00m', status: 'active' },
    { id: 'SES-9402', studentMask: 'STU-****8823', seat: 'Seat B-12', zone: 'Main Hall', startTime: '09:00 AM', elapsed: '1h 45m', maxAllowed: '4h 00m', status: 'active' },
    { id: 'SES-9403', studentMask: 'STU-****3311', seat: 'Seat C-04', zone: 'Collaboration', startTime: '07:15 AM', elapsed: '3h 30m', maxAllowed: '4h 00m', status: 'warning' },
    { id: 'SES-9404', studentMask: 'STU-****9012', seat: 'Seat A-02', zone: 'Silent Study', startTime: '09:45 AM', elapsed: '1h 00m', maxAllowed: '4h 00m', status: 'active' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Active Study Sessions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time tracking of current library occupant stay duration and seat timers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="md" icon={<Clock className="w-4 h-4" />}>
            Export Timesheet
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-medium">Active Sessions</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">142</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-medium">Avg. Stay Duration</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">2h 18m</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Timer className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-medium">Near Limit (&gt;3.5h)</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">6 students</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Current Active Check-in Timers"
          subtitle="Monitored for automated seat turnover policies"
        />

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 sm:px-6">Session ID</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Seat &amp; Wing</th>
                  <th className="py-3 px-4">Checked In At</th>
                  <th className="py-3 px-4">Time Elapsed</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {mockSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-mono text-xs text-slate-700">
                      {session.id}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-xs text-slate-900">
                      {session.studentMask}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-700">
                      <span className="font-semibold">{session.seat}</span> • {session.zone}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {session.startTime}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono font-semibold text-slate-900">
                      {session.elapsed}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      {session.status === 'warning' ? (
                        <Badge variant="warning" dot size="sm">Near Limit</Badge>
                      ) : (
                        <Badge variant="success" dot size="sm">Active</Badge>
                      )}
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
