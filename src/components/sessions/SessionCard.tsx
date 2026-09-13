import { Clock3, Eye, MapPin } from 'lucide-react'
import type { LibrarySession } from '../../types'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { formatDateTime, formatDuration } from './sessionUtils'

interface SessionCardProps { session: LibrarySession; onView: (session: LibrarySession) => void; onMarkExit: (session: LibrarySession) => void }

export function SessionCard({ session, onView, onMarkExit }: SessionCardProps) {
  const active = session.status === 'active'
  return <article className="space-y-3 border-b border-slate-100 p-4 last:border-b-0"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate font-semibold text-slate-900">{session.studentName}</h3><p className="mt-0.5 font-mono text-[11px] text-slate-400">{session.studentId}</p></div><Badge variant={active ? 'success' : 'default'} dot>{active ? 'Active' : 'Completed'}</Badge></div><div className="grid grid-cols-2 gap-3 text-xs"><Detail label="Seat" value={`${session.seatNumber} • ${session.section}`} icon={<MapPin className="h-3.5 w-3.5" />} /><Detail label="Entry" value={formatDateTime(session.entryTime)} icon={<Clock3 className="h-3.5 w-3.5" />} /><Detail label="Duration" value={formatDuration(session)} /><Detail label="Exit" value={session.exitTime ? formatDateTime(session.exitTime) : '—'} /></div><div className="flex justify-end gap-2"><Button variant="ghost" size="sm" icon={<Eye className="h-3.5 w-3.5" />} onClick={() => onView(session)}>View</Button>{active && <Button variant="outline" size="sm" onClick={() => onMarkExit(session)}>Mark Exit</Button>}</div></article>
}

function Detail({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) { return <div><p className="text-[11px] uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 flex items-center gap-1 text-sm font-medium text-slate-700">{icon}{value}</p></div> }
