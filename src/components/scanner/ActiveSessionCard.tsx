import { Clock3, LogOut, MapPin, Timer } from 'lucide-react'
import type { LibrarySeat, Student } from '../../types'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card, CardContent, CardHeader } from '../ui/Card'

interface ActiveSessionCardProps {
  student: Student
  seat: LibrarySeat | null
  onConfirmExit: () => void
}

export function ActiveSessionCard({ student, seat, onConfirmExit }: ActiveSessionCardProps) {
  return <Card><CardHeader title="Active Library Session" subtitle="This student is already inside the library." action={<Badge variant="success" dot>Inside</Badge>} /><CardContent className="space-y-5 p-5 sm:p-6"><div className="grid grid-cols-2 gap-4 sm:grid-cols-4"><Info label="Student" value={student.fullName} /><Info label="Student ID" value={student.id} /><Info label="Current seat" value={seat?.seatNumber ?? student.currentSeat ?? 'Assigned seat'} icon={<MapPin className="h-3.5 w-3.5" />} /><Info label="Entry time" value={formatTime(seat?.entryTime)} icon={<Clock3 className="h-3.5 w-3.5" />} /></div><div className="flex items-center justify-between gap-3 rounded-lg border border-indigo-100 bg-indigo-50/60 p-3"><span className="flex items-center gap-2 text-xs font-medium text-indigo-800"><Timer className="h-4 w-4" />Current duration: {formatDuration(seat?.entryTime)}</span><Button type="button" variant="outline" size="md" icon={<LogOut className="h-4 w-4" />} onClick={onConfirmExit}>Confirm Exit</Button></div></CardContent></Card>
}

function Info({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) { return <div className="min-w-0"><p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 flex items-center gap-1 truncate text-sm font-medium text-slate-800">{icon}{value}</p></div> }
function formatTime(value?: string) { return value ? new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'Not recorded' }
function formatDuration(value?: string) { if (!value) return 'Not recorded'; const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000)); return `${Math.floor(minutes / 60)}h ${minutes % 60}m` }
