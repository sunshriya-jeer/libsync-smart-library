import { Link } from 'react-router-dom'
import { ArrowUpRight, VolumeX, Users, Laptop } from 'lucide-react'
import { Card, CardHeader, CardContent } from '../ui/Card'
import { Badge } from '../ui/Badge'

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
  sampleSeats: Array<'occupied' | 'available' | 'reserved'>
}

const ZONES: ZoneCardData[] = [
  {
    id: 'zone-a',
    name: 'Zone A — Main Reading Room',
    floor: 'Floor 1',
    type: 'Quiet Study',
    icon: VolumeX,
    totalSeats: 80,
    occupiedSeats: 58,
    availableSeats: 22,
    noiseLevel: 'Quiet Study',
    badgeVariant: 'primary',
    sampleSeats: [
      'occupied', 'occupied', 'available', 'occupied', 'available',
      'occupied', 'available', 'occupied', 'occupied', 'occupied',
      'available', 'occupied', 'reserved', 'occupied', 'available',
      'occupied', 'available', 'occupied', 'occupied', 'available'
    ],
  },
  {
    id: 'zone-b',
    name: 'Zone B — Silent Research Hall',
    floor: 'Floor 2',
    type: 'Silent Zone',
    icon: Laptop,
    totalSeats: 60,
    occupiedSeats: 48,
    availableSeats: 12,
    noiseLevel: 'Silent Zone',
    badgeVariant: 'warning',
    sampleSeats: [
      'occupied', 'occupied', 'occupied', 'occupied', 'available',
      'occupied', 'occupied', 'occupied', 'occupied', 'reserved',
      'occupied', 'available', 'occupied', 'occupied', 'occupied',
      'available', 'occupied', 'occupied', 'occupied', 'available'
    ],
  },
  {
    id: 'zone-c',
    name: 'Zone C — Collaborative Hub',
    floor: 'Floor 3',
    type: 'Collaboration',
    icon: Users,
    totalSeats: 60,
    occupiedSeats: 36,
    availableSeats: 24,
    noiseLevel: 'Collaboration',
    badgeVariant: 'success',
    sampleSeats: [
      'available', 'available', 'occupied', 'occupied', 'available',
      'available', 'occupied', 'occupied', 'available', 'available',
      'occupied', 'occupied', 'available', 'available', 'occupied',
      'occupied', 'available', 'available', 'occupied', 'available'
    ],
  },
]

export function LiveSeatMapPreview() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader
        title="Live Seat Map"
        subtitle="Real-time occupancy across library study wings"
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
            <span>Available ({58})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600" />
            <span>Occupied ({142})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
            <span>Reserved ({8})</span>
          </div>
        </div>

        {/* Zones Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                          seatStatus === 'available'
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
          <span>* Map auto-refreshes every 30 seconds via LibSync real-time channel.</span>
          <span className="text-slate-500 font-medium">Synced 1m ago</span>
        </div>
      </CardContent>
    </Card>
  )
}
