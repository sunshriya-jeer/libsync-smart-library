import { Armchair, Zap, Wifi, VolumeX, AlertCircle, Compass } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { INITIAL_MOCK_SEATS } from '../components/seats/mockSeats'

export function StudentSeatPage() {
  const freeSeatsCount = INITIAL_MOCK_SEATS.filter((s) => s.status === 'free').length

  const zones = [
    { section: 'A', name: 'General Reading Room', floor: 'Floor 1', noise: 'Whisper Only', seats: 'A01 - A06', total: 6, free: 4 },
    { section: 'B', name: 'Silent Study Wing', floor: 'Floor 2', noise: 'Strict Silence', seats: 'B01 - B06', total: 6, free: 3 },
    { section: 'C', name: 'Tech & Laptop Hub', floor: 'Floor 2', noise: 'Collaborative', seats: 'C01 - C06', total: 6, free: 5 },
    { section: 'D', name: 'Project & Group Discussion', floor: 'Floor 3', noise: 'Collaborative', seats: 'D01 - D06', total: 6, free: 4 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Badge variant="primary" size="sm">
            Seat Guidance
          </Badge>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-500 font-medium">Floor 1-3</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
          Current Seat &amp; Zones
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Review your current seat assignment and view library zone capacities.
        </p>
      </div>

      {/* Active Seat Details */}
      <Card className="border-indigo-100/90 shadow-sm">
        <CardHeader
          title="Current Active Assignment"
          subtitle="Seat assigned during entrance scan"
          action={
            <Badge variant="success" dot size="sm">
              Occupied by You
            </Badge>
          }
        />
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Armchair className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                  Assigned Seat
                </p>
                <h2 className="text-2xl font-black text-slate-900">Seat B-04</h2>
                <p className="text-xs text-slate-600">Floor 2 • Silent Study Wing (Zone B)</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium">
                <Zap className="w-3.5 h-3.5 text-amber-500" /> Power Outlet
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium">
                <Wifi className="w-3.5 h-3.5 text-indigo-500" /> High-Speed Wi-Fi 6
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium">
                <VolumeX className="w-3.5 h-3.5 text-rose-500" /> Silent Zone
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p>
              Need to relocate? Scan your pass at the circulation desk or any floor kiosk to transfer to an open seat in another zone.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Library Zones Directory */}
      <Card>
        <CardHeader
          title="Library Zones Directory"
          subtitle={`${freeSeatsCount} seats currently available across all zones`}
          action={
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-indigo-600" /> 4 Study Zones
            </span>
          }
        />
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {zones.map((zone) => (
              <div key={zone.section} className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    Zone {zone.section}
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {zone.free} free
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-800">{zone.name}</h3>
                <div className="text-[11px] text-slate-500 space-y-0.5">
                  <p>{zone.floor} • {zone.noise}</p>
                  <p>Seats: {zone.seats} ({zone.total} total)</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
