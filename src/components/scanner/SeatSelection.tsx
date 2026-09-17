import { Armchair, CheckCircle2, Loader2 } from 'lucide-react'
import type { LibrarySeat } from '../../types'
import { Button } from '../ui/Button'
import { Card, CardContent, CardHeader } from '../ui/Card'

interface SeatSelectionProps {
  seats: LibrarySeat[]
  selectedSeat: LibrarySeat | null
  section: string
  isSubmitting?: boolean
  isLoadingSeats?: boolean
  onSectionChange: (section: string) => void
  onSelect: (seat: LibrarySeat) => void
  onConfirm: () => void
}

export function SeatSelection({
  seats,
  selectedSeat,
  section,
  isSubmitting = false,
  isLoadingSeats = false,
  onSectionChange,
  onSelect,
  onConfirm,
}: SeatSelectionProps) {
  const availableSeats = seats.filter(
    (seat) => seat.status === 'free' && (section === 'all' || seat.section === section)
  )

  return (
    <Card className="border-indigo-100">
      <CardHeader
        title="Select Available Seat"
        subtitle="Choose a free seat to check this student into the library."
        action={
          <select
            value={section}
            onChange={(event) => onSectionChange(event.target.value)}
            aria-label="Filter available seats by section"
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700 focus:border-indigo-500 focus:outline-hidden"
          >
            <option value="all">All sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
            <option value="D">Section D</option>
          </select>
        }
      />
      <CardContent className="space-y-4 p-5 sm:p-6">
        {isLoadingSeats ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-slate-500">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            <p className="text-xs">Loading available seats from database...</p>
          </div>
        ) : availableSeats.length ? (
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5 md:grid-cols-6 max-h-64 overflow-y-auto p-1">
            {availableSeats.map((seat) => (
              <button
                key={seat.id}
                type="button"
                onClick={() => onSelect(seat)}
                disabled={isSubmitting}
                aria-pressed={selectedSeat?.id === seat.id}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border p-2 transition-all focus:outline-hidden focus:ring-2 focus:ring-indigo-500 ${
                  selectedSeat?.id === seat.id
                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-md scale-102'
                    : 'border-emerald-200 bg-emerald-50/80 text-emerald-800 hover:border-emerald-400 hover:bg-emerald-100'
                }`}
              >
                <Armchair className="h-4 w-4" />
                <span className="font-mono text-xs font-bold">{seat.seatNumber}</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider">
                  {selectedSeat?.id === seat.id ? 'Selected' : 'Free'}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            No seats are currently available {section === 'all' ? 'in the library' : `in Section ${section}`}. Please choose another section or wait for an occupant to exit.
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            {selectedSeat ? (
              <span className="flex items-center gap-1.5 font-semibold text-indigo-700">
                <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                Seat {selectedSeat.seatNumber} (Section {selectedSeat.section}) selected
              </span>
            ) : (
              'Please select one free seat to record entry.'
            )}
          </p>
          <Button
            type="button"
            variant="primary"
            disabled={!selectedSeat || isSubmitting}
            onClick={onConfirm}
            icon={isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
          >
            {isSubmitting ? 'Confirming Entry...' : 'Confirm Entry'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
