import { useState } from 'react'
import { Armchair, Check, Construction, UserRound } from 'lucide-react'
import type { LibrarySeat } from '../../types'
import { Button } from '../ui/Button'
import { SeatDetailsModal, type SeatAction } from './SeatDetailsModal'
import { SeatFilters } from './SeatFilters'
import { SeatMap } from './SeatMap'
import { INITIAL_MOCK_SEATS } from './mockSeats'
import { SeatSummaryCards } from './SeatSummaryCards'

interface PendingAction {
  seat: LibrarySeat
  action: SeatAction
}

export function SeatsManagement() {
  const [seats, setSeats] = useState<LibrarySeat[]>(INITIAL_MOCK_SEATS)
  const [searchQuery, setSearchQuery] = useState('')
  const [section, setSection] = useState('all')
  const [status, setStatus] = useState('all')
  const [selectedSeat, setSelectedSeat] = useState<LibrarySeat | null>(null)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)

  const normalizedQuery = searchQuery.trim().toLowerCase()
  const visibleSeats = seats.filter((seat) => {
    const matchesSearch = !normalizedQuery || seat.seatNumber.toLowerCase().includes(normalizedQuery)
    const matchesSection = section === 'all' || seat.section === section
    const matchesStatus = status === 'all' || seat.status === status
    return matchesSearch && matchesSection && matchesStatus
  })
  const total = seats.length
  const free = seats.filter((seat) => seat.status === 'free').length
  const occupied = seats.filter((seat) => seat.status === 'occupied').length
  const maintenance = seats.filter((seat) => seat.status === 'maintenance').length
  const isFiltered = Boolean(searchQuery || section !== 'all' || status !== 'all')

  const clearFilters = () => {
    setSearchQuery('')
    setSection('all')
    setStatus('all')
  }

  const requestAction = (action: SeatAction) => {
    if (!selectedSeat) return
    setPendingAction({ seat: selectedSeat, action })
    setSelectedSeat(null)
  }

  const applyAction = () => {
    if (!pendingAction) return
    const { seat, action } = pendingAction
    const updates: Partial<LibrarySeat> = action === 'occupy'
      ? { status: 'occupied', studentId: 'STU-DEMO-0001', studentName: 'Demo Library Visitor', entryTime: new Date().toISOString() }
      : action === 'release'
        ? { status: 'free', studentId: undefined, studentName: undefined, entryTime: undefined }
        : action === 'maintenance'
          ? { status: 'maintenance', studentId: undefined, studentName: undefined, entryTime: undefined }
          : { status: 'free' }

    setSeats((currentSeats) => currentSeats.map((currentSeat) => currentSeat.id === seat.id ? { ...currentSeat, ...updates } : currentSeat))
    setPendingAction(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div><h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Seats Management</h2><p className="mt-1 text-xs text-slate-500 sm:text-sm">View current library seat availability across each study section.</p></div>
        <Button variant="outline" size="md" icon={<Armchair className="h-4 w-4" />} onClick={clearFilters}>View all seats</Button>
      </div>

      <SeatSummaryCards total={total} free={free} occupied={occupied} maintenance={maintenance} />
      <SeatFilters searchQuery={searchQuery} onSearchChange={setSearchQuery} section={section} onSectionChange={setSection} status={status} onStatusChange={setStatus} onClear={clearFilters} isFiltered={isFiltered} />
      <SeatMap seats={visibleSeats} onSeatClick={setSelectedSeat} />

      <SeatDetailsModal seat={selectedSeat} onClose={() => setSelectedSeat(null)} onAction={requestAction} />
      {pendingAction && <ActionConfirmation pendingAction={pendingAction} onCancel={() => setPendingAction(null)} onConfirm={applyAction} />}
    </div>
  )
}

function ActionConfirmation({ pendingAction, onCancel, onConfirm }: { pendingAction: PendingAction; onCancel: () => void; onConfirm: () => void }) {
  const { seat, action } = pendingAction
  const copy = {
    occupy: { title: 'Mark seat occupied?', body: `${seat.seatNumber} will be assigned to a fictional demo visitor.`, confirm: 'Mark occupied', icon: <UserRound className="h-5 w-5" />, variant: 'primary' as const },
    release: { title: 'Release this seat?', body: `${seat.seatNumber} will return to the free seat pool.`, confirm: 'Release seat', icon: <Check className="h-5 w-5" />, variant: 'primary' as const },
    maintenance: { title: 'Move seat to maintenance?', body: `${seat.seatNumber} will become unavailable until marked free again.`, confirm: 'Set maintenance', icon: <Construction className="h-5 w-5" />, variant: 'danger' as const },
    free: { title: 'Mark seat available?', body: `${seat.seatNumber} will return to the free seat pool.`, confirm: 'Mark available', icon: <Check className="h-5 w-5" />, variant: 'primary' as const },
  }[action]

  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><button type="button" className="absolute inset-0 bg-slate-900/40 backdrop-blur-2xs" onClick={onCancel} aria-label="Close seat action confirmation" /><div role="dialog" aria-modal="true" aria-labelledby="seat-action-title" className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"><div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">{copy.icon}</div><div><h2 id="seat-action-title" className="font-semibold text-slate-900">{copy.title}</h2><p className="mt-1 text-sm leading-relaxed text-slate-500">{copy.body}</p></div></div><div className="mt-6 flex justify-end gap-2"><Button variant="outline" size="md" onClick={onCancel}>Cancel</Button><Button variant={copy.variant} size="md" onClick={onConfirm}>{copy.confirm}</Button></div></div></div>
}
