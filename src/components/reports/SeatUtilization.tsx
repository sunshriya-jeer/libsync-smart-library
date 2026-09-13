import { Armchair, CheckCircle2, Construction, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import type { LibrarySeat } from '../../types'
import { Card, CardContent, CardHeader } from '../ui/Card'

export function SeatUtilization({ seats }: { seats: LibrarySeat[] }) {
  const total = seats.length
  const occupied = seats.filter((seat) => seat.status === 'occupied').length
  const free = seats.filter((seat) => seat.status === 'free').length
  const maintenance = seats.filter((seat) => seat.status === 'maintenance').length
  const utilization = total ? Math.round((occupied / total) * 100) : 0
  return <Card><CardHeader title="Seat Utilization" subtitle="Current seat inventory snapshot" /><CardContent className="space-y-5 p-5 sm:p-6"><div className="flex items-center gap-5"><div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full" style={{ background: `conic-gradient(#4f46e5 ${utilization}%, #e2e8f0 ${utilization}% 100%)` }}><div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white"><span className="text-xl font-bold text-slate-900">{utilization}%</span><span className="text-[10px] text-slate-400">utilized</span></div></div><div className="grid flex-1 grid-cols-2 gap-3"><Metric label="Total" value={total} icon={<Armchair className="h-4 w-4 text-indigo-600" />} /><Metric label="Occupied" value={occupied} icon={<Users className="h-4 w-4 text-amber-600" />} /><Metric label="Available" value={free} icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />} /><Metric label="Maintenance" value={maintenance} icon={<Construction className="h-4 w-4 text-rose-600" />} /></div></div><p className="border-t border-slate-100 pt-3 text-xs text-slate-500">Utilization is calculated from occupied seats divided by total seats.</p></CardContent></Card>
}

function Metric({ label, value, icon }: { label: string; value: number; icon: ReactNode }) { return <div><p className="flex items-center gap-1.5 text-xs text-slate-500">{icon}{label}</p><p className="mt-0.5 text-lg font-bold text-slate-900">{value}</p></div> }
