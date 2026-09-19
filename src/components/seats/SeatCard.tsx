import { Armchair, Construction, UserRound } from 'lucide-react'
import type { LibrarySeat } from '../../types'
import { cn } from '../../utils/cn'

interface SeatCardProps {
  seat: LibrarySeat
  onClick: (seat: LibrarySeat) => void
}

const STATUS_STYLES: Record<string, string> = {
  free: 'border-emerald-200 bg-emerald-50/70 text-emerald-800 hover:border-emerald-400 hover:bg-emerald-100',
  occupied: 'border-indigo-200 bg-indigo-50/70 text-indigo-900 hover:border-indigo-400 hover:bg-indigo-100',
  reserved: 'border-amber-200 bg-amber-50/70 text-amber-800 hover:border-amber-400 hover:bg-amber-100',
  maintenance: 'border-rose-200 bg-rose-50/70 text-rose-800 hover:border-rose-400 hover:bg-rose-100',
}

export function SeatCard({ seat, onClick }: SeatCardProps) {
  const Icon = seat.status === 'free' ? Armchair : seat.status === 'occupied' ? UserRound : seat.status === 'reserved' ? Armchair : Construction
  const label = seat.status === 'free' ? 'Free' : seat.status === 'occupied' ? 'Occupied' : seat.status === 'reserved' ? 'Reserved' : 'Maintenance'

  return (
    <button type="button" onClick={() => onClick(seat)} aria-label={`${seat.seatNumber}, ${label}`} className={cn('flex min-h-20 flex-col items-center justify-center gap-1 rounded-xl border p-2 text-center transition-colors focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2', STATUS_STYLES[seat.status])}>
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span className="font-mono text-xs font-bold tracking-tight">{seat.seatNumber}</span>
      <span className="text-[10px] font-semibold uppercase tracking-wide">{label}</span>
    </button>
  )
}
