import { Link } from 'react-router-dom'
import { ArrowUpRight, VolumeX, Users, Laptop } from 'lucide-react'
import type { LibrarySeatStatus } from '../../types'
import { Card, CardHeader, CardContent } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { INITIAL_MOCK_SEATS } from '../seats/mockSeats'

interface ZoneCardData {
  id: string
  name: string
  floor: string
  type: string
  icon: typeof VolumeX
  totalSeats: number
  occupiedSeats: number
  availableSeats: number
  noiseLevel: 'Silent Zone' | 'Collaboration' | 'Quiet Study'
  badgeVariant: 'primary' | 'success' | 'warning'
  sampleSeats: LibrarySeatStatus[]
}

const ZONES: ZoneCardData[] = (['A', 'B', 'C', 'D'] as const).map((section) => {
  const sectionSeats = INITIAL_MOCK_SEATS.filter((seat) => seat.section === section)
  const Icon = section === 'C' ? Users : section === 'B' ? Laptop : VolumeX
  const occupiedSeats = sectionSeats.filter((seat) => seat.status === 'occupied').length
  return {
    id: `section-${section.toLowerCase()}`,
    name: `Section ${section}`,
    floor: `Library section ${section}`,
    type: section === 'C' ? 'Collaboration' : 'Quiet Study',
    icon: Icon,
    totalSeats: sectionSeats.length,
    occupiedSeats,
    availableSeats: sectionSeats.filter((seat) => seat.status === 'free').length,
    noiseLevel: section === 'C' ? 'Collaboration' : section === 'B' ? 'Silent Zone' : 'Quiet Study',
    badgeVariant: section === 'C' ? 'success' : section === 'B' ? 'warning' : 'primary',
    sampleSeats: sectionSeats.map((seat) => seat.status),
  }
})

export function LiveSeatMapPreview() {
  const totals = ZONES.reduce((summary, zone) => ({
    total: summary.total + zone.totalSeats,
    occupied: summary.occupied + zone.occupiedSeats,
    available: summary.available + zone.availableSeats,
  }), { total: 0, occupied: 0, available: 0 })

  return (
    <Card className="h-full flex flex-col">
      <CardHeader
        title="Live Seat Map"
        subtitle="Current occupancy across library sections"
        action={
          <Link
            to="/seats"
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <span>Full Floor Plan</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        }
      />

      <CardContent className="flex-1 flex flex-col justify-between space-y-5">
        {/* Status Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            <span>Available ({totals.available})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600" />
            <span>Occupied ({totals.occupied})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
            <span>Maintenance ({totals.total - totals.occupied - totals.available})</span>
          </div>
        </div>

        {/* Zones Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {ZONES.map((zone) => {
            const Icon = zone.icon
            const occupancyPercent = Math.round(
              (zone.occupiedSeats / zone.totalSeats) * 100
            )

            return (
              <div
                key={zone.id}
                className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {zone.floor}
                    </span>
                    <Badge variant={zone.badgeVariant} size="sm">
                      {zone.noiseLevel}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-slate-500 shrink-0" />
                    <h4 className="font-semibold text-sm text-slate-900 truncate">
                      {zone.name}
                    </h4>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between text-xs text-slate-600 mb-2">
                    <span>Occupancy:</span>
                    <span className="font-semibold text-slate-900">
                      {zone.occupiedSeats} / {zone.totalSeats} ({occupancyPercent}%)
                    </span>
                  </div>

                  {/* Occupancy progress bar */}
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-3">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all"
                      style={{ width: `${occupancyPercent}%` }}
                    />
                  </div>
                </div>

                {/* Mini Seat Matrix visual indicator */}
                <div>
                  <div className="text-[10px] text-slate-400 font-medium mb-1.5 flex justify-between">
                    <span>Sample Desk Layout</span>
                    <span className="text-emerald-700 font-medium">
                      {zone.availableSeats} free
                    </span>
                  </div>
                  <div className="grid grid-cols-10 gap-1">
                    {zone.sampleSeats.map((seatStatus, idx) => (
                      <div
                        key={idx}
                        className={`h-2 rounded-xs transition-opacity ${
                          seatStatus === 'free'
                            ? 'bg-emerald-500'
                            : seatStatus === 'occupied'
                            ? 'bg-indigo-600'
                            : 'bg-amber-400'
                        }`}
                        title={`Seat ${idx + 1}: ${seatStatus}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Live sync telemetry note */}
        <div className="text-xs text-slate-400 flex items-center justify-between pt-1">
          <span>* Seat map reflects the current local mock inventory.</span>
          <span className="text-slate-500 font-medium">Local snapshot</span>
        </div>
      </CardContent>
    </Card>
  )
}
