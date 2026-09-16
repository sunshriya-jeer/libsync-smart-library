import { Calendar, MapPin, CheckCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { INITIAL_MOCK_SESSIONS } from '../components/sessions/mockSessions'

export function StudentHistoryPage() {
  const sessions = INITIAL_MOCK_SESSIONS

  const totalStudyMinutes = sessions
    .filter((s) => s.durationMinutes)
    .reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0)

  const totalHours = (totalStudyMinutes / 60).toFixed(1)

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Badge variant="primary" size="sm">
            Activity Log
          </Badge>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-500 font-medium">Session Records</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
          Visit &amp; Study History
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Review your recorded library visits, assigned seats, and total study duration.
        </p>
      </div>

      {/* Summary Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <p className="text-xs text-slate-500 font-medium">Total Visits</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{sessions.length}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">This semester</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <p className="text-xs text-slate-500 font-medium">Recorded Study Time</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalHours} hrs</p>
          <p className="text-[11px] text-indigo-600 font-semibold mt-0.5">Verified attendance</p>
        </div>
        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <p className="text-xs text-slate-500 font-medium">Favorite Zone</p>
          <p className="text-2xl font-black text-slate-900 mt-1">Zone A</p>
          <p className="text-[11px] text-slate-400 mt-0.5">General Reading</p>
        </div>
      </div>

      {/* History List */}
      <Card>
        <CardHeader
          title="Past Sessions"
          subtitle="All check-ins logged by LibSync entrance kiosks"
        />
        <CardContent>
          <div className="divide-y divide-slate-100">
            {sessions.map((ses) => {
              const entryDate = new Date(ses.entryTime)
              const formattedDate = entryDate.toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
              const formattedTime = entryDate.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
              })

              return (
                <div key={ses.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Calendar className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900">
                          Seat {ses.seatNumber}
                        </p>
                        <Badge variant={ses.status === 'active' ? 'primary' : 'default'} size="sm">
                          Zone {ses.section}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{formattedDate} at {formattedTime}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <div className="text-right text-xs">
                      <p className="font-semibold text-slate-800 flex items-center justify-end gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {ses.durationMinutes ? `${ses.durationMinutes} mins` : 'Ongoing'}
                      </p>
                      <p className="text-[10px] text-slate-400">Duration</p>
                    </div>

                    <div className="w-20 text-right">
                      {ses.status === 'active' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700">
                          <CheckCircle className="w-3 h-3" /> Done
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
