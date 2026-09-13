import { Armchair, CheckCircle2, Clock3, Construction, UserRound, X } from 'lucide-react'
import type { LibrarySeat, LibrarySeatStatus } from '../../types'
import { Button } from '../ui/Button'
import { Card, CardContent } from '../ui/Card'

export type SeatAction = 'occupy' | 'release' | 'maintenance' | 'free'

interface SeatDetailsModalProps {
  seat: LibrarySeat | null
  onClose: () => void
  onAction: (action: SeatAction) => void
}

const STATUS_COPY: Record<LibrarySeatStatus, { label: string; className: string; icon: typeof Armchair }> = {
  free: { label: 'Available', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  occupied: { label: 'Occupied', className: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: UserRound },
  maintenance: { label: 'Maintenance', className: 'bg-rose-50 text-rose-700 border-rose-200', icon: Construction },
}

export function SeatDetailsModal({ seat, onClose, onAction }: SeatDetailsModalProps) {
  if (!seat) return null
  const status = STATUS_COPY[seat.status]
  const StatusIcon = status.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/40 backdrop-blur-2xs" onClick={onClose} aria-label="Close seat details" />
      <div role="dialog" aria-modal="true" aria-labelledby="seat-details-title" className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50/60 p-5 sm:p-6">
          <div><p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Seat details</p><h2 id="seat-details-title" className="mt-1 font-mono text-xl font-bold tracking-tight text-slate-900">{seat.seatNumber}</h2><p className="mt-0.5 text-xs text-slate-500">Section {seat.section}</p></div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close seat details"><X className="h-5 w-5" /></button>
        </div>
        <Card className="rounded-none border-0 shadow-none"><CardContent className="space-y-5 p-5 sm:p-6">
          <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${status.className}`}><StatusIcon className="h-4 w-4" />Status: {status.label}</div>
          {seat.status === 'occupied' && <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4"><Detail label="Student" value={seat.studentName ?? 'Assigned student'} /><Detail label="Student ID" value={seat.studentId ?? 'Mock assignment'} /><Detail label="Entry time" value={formatEntryTime(seat.entryTime)} icon={<Clock3 className="h-3.5 w-3.5" />} /><Detail label="Duration" value={formatDuration(seat.entryTime)} icon={<Clock3 className="h-3.5 w-3.5" />} /></div>}
          {seat.status === 'free' && <p className="text-sm leading-relaxed text-slate-500">This seat is available for a new library session.</p>}
          {seat.status === 'maintenance' && <p className="text-sm leading-relaxed text-slate-500">This seat is temporarily unavailable for library use.</p>}
        </CardContent></Card>
        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 p-5 sm:p-6">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>Close</Button>
          {seat.status === 'free' && <><Button type="button" variant="primary" size="sm" icon={<UserRound className="h-3.5 w-3.5" />} onClick={() => onAction('occupy')}>Mark occupied</Button><Button type="button" variant="danger" size="sm" icon={<Construction className="h-3.5 w-3.5" />} onClick={() => onAction('maintenance')}>Maintenance</Button></>}
          {seat.status === 'occupied' && <><Button type="button" variant="outline" size="sm" icon={<Armchair className="h-3.5 w-3.5" />} onClick={() => onAction('release')}>Release seat</Button><Button type="button" variant="danger" size="sm" icon={<Construction className="h-3.5 w-3.5" />} onClick={() => onAction('maintenance')}>Maintenance</Button></>}
          {seat.status === 'maintenance' && <Button type="button" variant="primary" size="sm" icon={<CheckCircle2 className="h-3.5 w-3.5" />} onClick={() => onAction('free')}>Mark available</Button>}
        </div>
      </div>
    </div>
  )
}

function Detail({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return <div><p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 flex items-center gap-1 text-sm font-medium text-slate-800">{icon}{value}</p></div>
}

function formatEntryTime(entryTime?: string) {
  if (!entryTime) return 'Not recorded'
  return new Date(entryTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function formatDuration(entryTime?: string) {
  if (!entryTime) return 'Not recorded'
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(entryTime).getTime()) / 60000))
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
}
