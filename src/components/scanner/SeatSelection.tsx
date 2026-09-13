import { Armchair, CheckCircle2 } from 'lucide-react'
import type { LibrarySeat } from '../../types'
import { Button } from '../ui/Button'
import { Card, CardContent, CardHeader } from '../ui/Card'

interface SeatSelectionProps {
  seats: LibrarySeat[]
  selectedSeat: LibrarySeat | null
  section: string
  onSectionChange: (section: string) => void
  onSelect: (seat: LibrarySeat) => void
  onConfirm: () => void
}

export function SeatSelection({ seats, selectedSeat, section, onSectionChange, onSelect, onConfirm }: SeatSelectionProps) {
  const availableSeats = seats.filter((seat) => seat.status === 'free' && (section === 'all' || seat.section === section))
  return <Card><CardHeader title="Entry detected" subtitle="Select an available seat for this library session." action={<select value={section} onChange={(event) => onSectionChange(event.target.value)} aria-label="Filter available seats by section" className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700 focus:border-indigo-500 focus:outline-hidden"><option value="all">All sections</option><option value="A">Section A</option><option value="B">Section B</option><option value="C">Section C</option><option value="D">Section D</option></select>} /><CardContent className="space-y-4 p-5 sm:p-6">{availableSeats.length ? <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">{availableSeats.map((seat) => <button key={seat.id} type="button" onClick={() => onSelect(seat)} aria-pressed={selectedSeat?.id === seat.id} className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border p-2 transition-colors focus:outline-hidden focus:ring-2 focus:ring-indigo-500 ${selectedSeat?.id === seat.id ? 'border-indigo-500 bg-indigo-600 text-white shadow-sm' : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-400 hover:bg-emerald-100'}`}><Armchair className="h-4 w-4" /><span className="font-mono text-xs font-bold">{seat.seatNumber}</span><span className="text-[10px] font-semibold uppercase">{selectedSeat?.id === seat.id ? 'Selected' : 'Available'}</span></button>)}</div> : <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">No seats are currently available in this section.</div>}<div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4"><p className="text-xs text-slate-500">{selectedSeat ? <span className="flex items-center gap-1.5 font-medium text-indigo-700"><CheckCircle2 className="h-4 w-4" />{selectedSeat.seatNumber} selected</span> : 'Choose one seat to continue.'}</p><Button type="button" variant="primary" disabled={!selectedSeat} onClick={onConfirm}>Confirm Entry</Button></div></CardContent></Card>
}
