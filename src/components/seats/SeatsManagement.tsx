import { useState, useEffect } from 'react'
import { AlertCircle, Armchair, Check, Construction, Loader2, RefreshCw, UserRound } from 'lucide-react'
import type { LibrarySeat, LibrarySeatStatus } from '../../types'
import { Button } from '../ui/Button'
import { SeatDetailsModal, type SeatAction } from './SeatDetailsModal'
import { SeatFilters } from './SeatFilters'
import { SeatMap } from './SeatMap'
import { SeatSummaryCards } from './SeatSummaryCards'
import { fetchSeats, updateSeatStatus } from '../../services/seatService'

interface PendingAction {
  seat: LibrarySeat
  action: SeatAction
}

export function SeatsManagement() {
  const [seats, setSeats] = useState<LibrarySeat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [section, setSection] = useState('all')
  const [status, setStatus] = useState('all')
  const [selectedSeat, setSelectedSeat] = useState<LibrarySeat | null>(null)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const handleFetchSeats = async () => {
    try {
      setIsLoading(true)
      setLoadError(null)
      const data = await fetchSeats()
      setSeats(data)
    } catch (err: unknown) {
      console.error('[SeatsManagement] Failed to fetch seats:', err)
      setLoadError(
        err instanceof Error
          ? err.message
          : 'Unable to connect to the library database. Please check your connection and try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const loadInitialSeats = async () => {
      try {
        const data = await fetchSeats()
        if (isMounted) {
          setSeats(data)
          setLoadError(null)
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.error('[SeatsManagement] Failed to load seats:', err)
          setLoadError(
            err instanceof Error
              ? err.message
              : 'Unable to connect to the library database. Please check your connection and try again.'
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadInitialSeats()

    return () => {
      isMounted = false
    }
  }, [])

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
    setActionError(null)
    setPendingAction({ seat: selectedSeat, action })
    setSelectedSeat(null)
  }

  const applyAction = async () => {
    if (!pendingAction) return
    const { seat, action } = pendingAction
    const targetStatus: LibrarySeatStatus =
      action === 'occupy' ? 'occupied' : action === 'maintenance' ? 'maintenance' : 'free'

    try {
      setIsUpdatingStatus(true)
      setActionError(null)
      const updatedSeat = await updateSeatStatus(seat.id, targetStatus)
      setSeats((currentSeats) =>
        currentSeats.map((s) => (s.id === updatedSeat.id ? updatedSeat : s))
      )
      setPendingAction(null)
    } catch (err: unknown) {
      console.error('[SeatsManagement] Failed to update seat status:', err)
      setActionError(
        err instanceof Error
          ? err.message
          : 'Failed to update seat status. Please try again.'
      )
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Seats Management</h2>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">View and manage library seat availability across each study section.</p>
        </div>
        <Button variant="outline" size="md" icon={<Armchair className="h-4 w-4" />} onClick={clearFilters}>View all seats</Button>
      </div>

      {loadError && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{loadError}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={handleFetchSeats}
            className="shrink-0 bg-white"
          >
            Retry
          </Button>
        </div>
      )}

      <SeatSummaryCards total={total} free={free} occupied={occupied} maintenance={maintenance} />
      <SeatFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        section={section}
        onSectionChange={setSection}
        status={status}
        onStatusChange={setStatus}
        onClear={clearFilters}
        isFiltered={isFiltered}
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 rounded-2xl border border-slate-200/80 bg-white text-center text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-sm font-medium">Loading library seats from database...</p>
        </div>
      ) : (
        <SeatMap seats={visibleSeats} onSeatClick={setSelectedSeat} />
      )}

      <SeatDetailsModal seat={selectedSeat} onClose={() => setSelectedSeat(null)} onAction={requestAction} />
      {pendingAction && (
        <ActionConfirmation
          pendingAction={pendingAction}
          isUpdating={isUpdatingStatus}
          error={actionError}
          onCancel={() => {
            if (!isUpdatingStatus) {
              setPendingAction(null)
              setActionError(null)
            }
          }}
          onConfirm={applyAction}
        />
      )}
    </div>
  )
}

function ActionConfirmation({
  pendingAction,
  isUpdating,
  error,
  onCancel,
  onConfirm,
}: {
  pendingAction: PendingAction
  isUpdating: boolean
  error: string | null
  onCancel: () => void
  onConfirm: () => void
}) {
  const { seat, action } = pendingAction
  const copy = {
    occupy: { title: 'Mark seat occupied?', body: `${seat.seatNumber} will be marked as occupied in the library database.`, confirm: 'Mark occupied', icon: <UserRound className="h-5 w-5" />, variant: 'primary' as const },
    release: { title: 'Release this seat?', body: `${seat.seatNumber} will be returned to available status in the database.`, confirm: 'Release seat', icon: <Check className="h-5 w-5" />, variant: 'primary' as const },
    maintenance: { title: 'Move seat to maintenance?', body: `${seat.seatNumber} will be set to maintenance mode in the database.`, confirm: 'Set maintenance', icon: <Construction className="h-5 w-5" />, variant: 'danger' as const },
    free: { title: 'Mark seat available?', body: `${seat.seatNumber} will be marked as available in the database.`, confirm: 'Mark available', icon: <Check className="h-5 w-5" />, variant: 'primary' as const },
  }[action]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-2xs"
        onClick={() => {
          if (!isUpdating) onCancel()
        }}
        aria-label="Close seat action confirmation"
      />
      <div role="dialog" aria-modal="true" aria-labelledby="seat-action-title" className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            {copy.icon}
          </div>
          <div>
            <h2 id="seat-action-title" className="font-semibold text-slate-900">{copy.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">{copy.body}</p>
            {error && (
              <p className="mt-2 text-xs font-medium text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </p>
            )}
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" size="md" onClick={onCancel} disabled={isUpdating}>
            Cancel
          </Button>
          <Button
            variant={copy.variant}
            size="md"
            onClick={onConfirm}
            disabled={isUpdating}
            icon={isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
          >
            {isUpdating ? 'Updating...' : copy.confirm}
          </Button>
        </div>
      </div>
    </div>
  )
}

