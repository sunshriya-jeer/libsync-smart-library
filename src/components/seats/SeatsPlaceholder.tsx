import { useState } from 'react'
import { Armchair, Sparkles, RefreshCw } from 'lucide-react'
import { Card, CardHeader, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { cn } from '../../utils/cn'

export function SeatsPlaceholder() {
  const [activeFloor, setActiveFloor] = useState<'floor1' | 'floor2' | 'floor3'>('floor1')

  const sampleSeats = Array.from({ length: 40 }, (_, i) => {
    const seatId = `A-${String(i + 1).padStart(2, '0')}`
    // generate stable mock state
    const isOccupied = i % 3 !== 0
    const isReserved = i === 7 || i === 23
    const status = isReserved ? 'reserved' : isOccupied ? 'occupied' : 'available'
    return { id: seatId, status }
  })

  return (
    <div className="space-y-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Real-Time Seat Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Interactive floor layout, live occupancy states, and seat allocation control.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="md" icon={<RefreshCw className="w-4 h-4" />}>
            Refresh Status
          </Button>
          <Button variant="primary" size="md" icon={<Armchair className="w-4 h-4" />}>
            Manage Layout
          </Button>
        </div>
      </div>

      {/* Floor & Zone selector tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveFloor('floor1')}
          className={cn(
            'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
            activeFloor === 'floor1'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          )}
        >
          Floor 1: Main Reading Room (80 Seats)
        </button>
        <button
          type="button"
          onClick={() => setActiveFloor('floor2')}
          className={cn(
            'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
            activeFloor === 'floor2'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          )}
        >
          Floor 2: Silent Research Hall (60 Seats)
        </button>
        <button
          type="button"
          onClick={() => setActiveFloor('floor3')}
          className={cn(
            'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
            activeFloor === 'floor3'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          )}
        >
          Floor 3: Collaboration Wing (60 Seats)
        </button>
      </div>

      {/* Seat Map Matrix */}
      <Card>
        <CardHeader
          title="Floor 1 — Real-Time Grid"
          subtitle="Click on any seat to view allocation status or assign manually"
          action={
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded bg-emerald-500" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded bg-indigo-600" />
                <span>Occupied</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded bg-amber-400" />
                <span>Reserved</span>
              </div>
            </div>
          }
        />

        <CardContent className="space-y-6">
          <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-10 gap-2.5 sm:gap-3">
            {sampleSeats.map((seat) => (
              <button
                key={seat.id}
                type="button"
                className={cn(
                  'h-16 rounded-xl border flex flex-col items-center justify-center p-1.5 text-center transition-all cursor-pointer group',
                  seat.status === 'available' &&
                    'bg-emerald-50/50 border-emerald-200 text-emerald-800 hover:bg-emerald-100/60 hover:border-emerald-300',
                  seat.status === 'occupied' &&
                    'bg-indigo-50/50 border-indigo-200 text-indigo-900 hover:bg-indigo-100/60 hover:border-indigo-300',
                  seat.status === 'reserved' &&
                    'bg-amber-50/50 border-amber-200 text-amber-900 hover:bg-amber-100/60 hover:border-amber-300'
                )}
                onClick={() =>
                  alert(`LibSync Seat Details: ${seat.id} (${seat.status}). Real-time sync hook will connect here.`)
                }
              >
                <span className="font-mono text-xs font-bold tracking-tight">
                  {seat.id}
                </span>
                <span className="text-[10px] uppercase font-semibold mt-0.5 opacity-80">
                  {seat.status}
                </span>
              </button>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Dynamic seat release policy: Unoccupied seats automatically reset after 15 minutes of inactivity.
            </span>
            <Badge variant="primary" size="sm">Auto-Release Active</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
