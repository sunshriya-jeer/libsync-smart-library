import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, VolumeX, Users, Laptop, Armchair, Loader2 } from 'lucide-react'
import type { LibrarySeat } from '../../types'
import { Card, CardHeader, CardContent } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { fetchSeats } from '../../services/seatService'
import { cn } from '../../utils/cn'

export interface LiveSeatMapPreviewProps {
  seats?: LibrarySeat[]
  isLoading?: boolean
}

interface ZoneInfo {
  section: 'A' | 'B' | 'C' | 'D'
  name: string
  floor: string
  noiseLevel: string
  badgeVariant: 'primary' | 'success' | 'warning' | 'default'
  icon: typeof VolumeX
  totalSeats: number
  occupiedSeats: number
  availableSeats: number
  reservedSeats: number
  maintenanceSeats: number
  sectionSeats: LibrarySeat[]
}

const SECTION_CONFIG: Record<
  'A' | 'B' | 'C' | 'D',
  {
    name: string
    floor: string
    noiseLevel: string
    badgeVariant: 'primary' | 'success' | 'warning' | 'default'
    icon: typeof VolumeX
  }
> = {
  A: {
    name: 'Section A',
    floor: 'Floor 1 • Quiet Study',
    noiseLevel: 'Silent Zone',
    badgeVariant: 'primary',
    icon: VolumeX,
  },
  B: {
    name: 'Section B',
    floor: 'Floor 1 • Tech & Media',
    noiseLevel: 'Quiet Study',
    badgeVariant: 'warning',
    icon: Laptop,
  },
  C: {
    name: 'Section C',
    floor: 'Floor 2 • Group Pods',
    noiseLevel: 'Collaboration',
    badgeVariant: 'success',
    icon: Users,
  },
  D: {
    name: 'Section D',
    floor: 'Floor 2 • Open Stacks',
    noiseLevel: 'General Reading',
    badgeVariant: 'default',
    icon: Armchair,
  },
}

export function LiveSeatMapPreview({
  seats: propSeats,
  isLoading: propIsLoading,
}: LiveSeatMapPreviewProps = {}) {
  const hasProps = propSeats !== undefined

  const [internalSeats, setInternalSeats] = useState<LibrarySeat[]>([])
  const [internalLoading, setInternalLoading] = useState(!hasProps)

  useEffect(() => {
    if (hasProps) return

    let isMounted = true

    fetchSeats()
      .then((data) => {
        if (isMounted) {
          setInternalSeats(data)
        }
      })
      .catch((err) => {
        console.error('[LiveSeatMapPreview] Failed to fetch seats:', err)
      })
      .finally(() => {
        if (isMounted) {
          setInternalLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [hasProps])

  const seats = propSeats ?? internalSeats
  const isLoading = propIsLoading ?? internalLoading

  const zones: ZoneInfo[] = (['A', 'B', 'C', 'D'] as const).map((sectionKey) => {
    const config = SECTION_CONFIG[sectionKey]
    const sectionSeats = seats.filter((s) => s.section === sectionKey)
    const occupiedSeats = sectionSeats.filter((s) => s.status === 'occupied').length
    const availableSeats = sectionSeats.filter((s) => s.status === 'free').length
    const reservedSeats = sectionSeats.filter((s) => s.status === 'reserved').length
    const maintenanceSeats = sectionSeats.filter((s) => s.status === 'maintenance').length

    return {
      section: sectionKey,
      name: config.name,
      floor: config.floor,
      noiseLevel: config.noiseLevel,
      badgeVariant: config.badgeVariant,
      icon: config.icon,
      totalSeats: sectionSeats.length,
      occupiedSeats,
      availableSeats,
      reservedSeats,
      maintenanceSeats,
      sectionSeats,
    }
  })

  const totals = zones.reduce(
    (acc, z) => ({
      total: acc.total + z.totalSeats,
      occupied: acc.occupied + z.occupiedSeats,
      available: acc.available + z.availableSeats,
      reserved: acc.reserved + z.reservedSeats,
      maintenance: acc.maintenance + z.maintenanceSeats,
    }),
    { total: 0, occupied: 0, available: 0, reserved: 0, maintenance: 0 }
  )

  return (
    <Card className="flex flex-col">
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
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-500 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 shrink-0" />
            <span>Available ({isLoading ? '—' : totals.available})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-indigo-600 shrink-0" />
            <span>Occupied ({isLoading ? '—' : totals.occupied})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-amber-400 shrink-0" />
            <span>Reserved ({isLoading ? '—' : totals.reserved})</span>
          </div>
          {totals.maintenance > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-slate-300 shrink-0" />
              <span>Maintenance ({isLoading ? '—' : totals.maintenance})</span>
            </div>
          )}
        </div>

        {/* Zones Grid: 2 columns on sm/md/lg/xl - gives ample room inside the 7-col split layout */}
        {isLoading && seats.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin mb-2 text-indigo-600" />
            <span>Loading live floor status...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {zones.map((zone) => {
              const Icon = zone.icon
              const occupancyPercent =
                zone.totalSeats > 0
                  ? Math.round((zone.occupiedSeats / zone.totalSeats) * 100)
                  : 0

              return (
                <div
                  key={zone.section}
                  className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col justify-between min-w-0"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2 min-w-0">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider truncate">
                        {zone.floor}
                      </span>
                      <Badge variant={zone.badgeVariant} size="sm" className="shrink-0">
                        {zone.noiseLevel}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 mb-1 min-w-0">
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

                  {/* Seat Matrix visual indicator */}
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium mb-1.5 flex justify-between">
                      <span>Seat Status</span>
                      <span className="text-emerald-700 font-medium">
                        {zone.availableSeats} free
                      </span>
                    </div>
                    {zone.sectionSeats.length === 0 ? (
                      <div className="text-[11px] text-slate-400 italic py-1">
                        No seats registered in section
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                        {zone.sectionSeats.map((seat) => (
                          <div
                            key={seat.id}
                            className={cn(
                              'w-3 h-2.5 rounded-xs transition-opacity shrink-0',
                              seat.status === 'free' && 'bg-emerald-500',
                              seat.status === 'occupied' && 'bg-indigo-600',
                              seat.status === 'reserved' && 'bg-amber-400',
                              seat.status === 'maintenance' && 'bg-slate-300'
                            )}
                            title={`Seat ${seat.seatNumber}: ${seat.status}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Live sync telemetry note */}
        <div className="text-xs text-slate-400 flex items-center justify-between pt-1">
          <span>* Real-time seat inventory synced from library database.</span>
          <span className="text-slate-500 font-medium">Live Database</span>
        </div>
      </CardContent>
    </Card>
  )
}
