import { CheckCircle2, Clock3, MapPin, UserRound, X } from 'lucide-react'
import type { ReactNode } from 'react'
import type { LibrarySession } from '../../types'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card, CardContent } from '../ui/Card'
import { formatDateTime, formatDuration } from './sessionUtils'

interface SessionDetailsModalProps { session: LibrarySession | null; onClose: () => void }

export function SessionDetailsModal({ session, onClose }: SessionDetailsModalProps) {
  if (!session) return null
  const active = session.status === 'active'
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><button type="button" className="absolute inset-0 bg-slate-900/40 backdrop-blur-2xs" onClick={onClose} aria-label="Close session details" /><div role="dialog" aria-modal="true" aria-labelledby="session-details-title" className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"><div className="flex items-start justify-between border-b border-slate-100 bg-slate-50/60 p-5 sm:p-6"><div><p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Session details</p><h2 id="session-details-title" className="mt-1 font-mono text-lg font-bold text-slate-900">{session.id}</h2><p className="mt-0.5 text-xs text-slate-500">{session.studentName}</p></div><button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close session details"><X className="h-5 w-5" /></button></div><Card className="rounded-none border-0 shadow-none"><CardContent className="space-y-5 p-5 sm:p-6"><div className="flex items-center justify-between gap-3"><Badge variant={active ? 'success' : 'default'} dot>{active ? 'Active • Inside library' : 'Completed'}</Badge>{active && <span className="text-xs font-medium text-emerald-700">Currently inside</span>}</div><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Detail label="Student" value={session.studentName} icon={<UserRound className="h-3.5 w-3.5" />} /><Detail label="Student ID" value={session.studentId} mono /><Detail label="Department" value={session.department} /><Detail label="Seat / section" value={`${session.seatNumber} • Section ${session.section}`} icon={<MapPin className="h-3.5 w-3.5" />} /><Detail label="Entry time" value={formatDateTime(session.entryTime)} icon={<Clock3 className="h-3.5 w-3.5" />} /><Detail label="Exit time" value={session.exitTime ? formatDateTime(session.exitTime) : '—'} /><Detail label="Duration" value={formatDuration(session)} icon={<Clock3 className="h-3.5 w-3.5" />} /><Detail label="Status" value={active ? 'Active' : 'Completed'} icon={<CheckCircle2 className="h-3.5 w-3.5" />} /></div></CardContent></Card><div className="flex justify-end border-t border-slate-100 p-5 sm:p-6"><Button type="button" variant="outline" onClick={onClose}>Close</Button></div></div></div>
}

function Detail({ label, value, icon, mono = false }: { label: string; value: string; icon?: ReactNode; mono?: boolean }) { return <div><p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p><p className={`mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-800 ${mono ? 'font-mono text-xs' : ''}`}>{icon}{value}</p></div> }
