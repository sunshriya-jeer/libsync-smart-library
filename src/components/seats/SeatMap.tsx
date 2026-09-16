import type { LibrarySeat } from '../../types'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { SeatCard } from './SeatCard'

interface SeatMapProps {
  seats: LibrarySeat[]
  onSeatClick: (seat: LibrarySeat) => void
}

export function SeatMap({ seats, onSeatClick }: SeatMapProps) {
  const sections = ['A', 'B', 'C', 'D']
  return (
    <Card>
      <CardHeader title="Library Seat Map" subtitle="Select any seat to view details or update its status." action={<StatusLegend />} />
      <CardContent className="space-y-6">
        {sections.map((section) => {
          const sectionSeats = seats.filter((seat) => seat.section === section)
          if (!sectionSeats.length) return null
          return <section key={section} aria-labelledby={`section-${section}`}><div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2"><h3 id={`section-${section}`} className="text-xs font-bold uppercase tracking-wider text-slate-700">Section {section}</h3><span className="text-xs text-slate-400">{sectionSeats.length} shown</span></div><div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-6">{sectionSeats.map((seat) => <SeatCard key={seat.id} seat={seat} onClick={onSeatClick} />)}</div></section>
        })}
        {!seats.length && <div className="py-12 text-center"><p className="font-semibold text-slate-800">No seats match these filters</p><p className="mt-1 text-xs text-slate-500">Clear a filter to return to the full seat map.</p></div>}
      </CardContent>
    </Card>
  )
}

function StatusLegend() {
  return <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600"><LegendDot color="bg-emerald-500" label="Free" /><LegendDot color="bg-indigo-600" label="Occupied" /><LegendDot color="bg-rose-500" label="Maintenance" /></div>
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return <span className="flex items-center gap-1.5"><span className={`h-2.5 w-2.5 rounded-sm ${color}`} />{label}</span>
}
