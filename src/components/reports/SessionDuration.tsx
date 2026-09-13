import { Clock3 } from 'lucide-react'
import type { LibrarySession } from '../../types'
import { Card, CardContent, CardHeader } from '../ui/Card'

export function SessionDuration({ sessions }: { sessions: LibrarySession[] }) {
  const completed = sessions.filter((session) => session.status === 'completed')
  const buckets = [
    { label: 'Under 30 min', count: completed.filter((session) => (session.durationMinutes ?? 0) < 30).length },
    { label: '30–60 min', count: completed.filter((session) => (session.durationMinutes ?? 0) >= 30 && (session.durationMinutes ?? 0) < 60).length },
    { label: '1–2 hours', count: completed.filter((session) => (session.durationMinutes ?? 0) >= 60 && (session.durationMinutes ?? 0) < 120).length },
    { label: '2–3 hours', count: completed.filter((session) => (session.durationMinutes ?? 0) >= 120 && (session.durationMinutes ?? 0) < 180).length },
    { label: '3+ hours', count: completed.filter((session) => (session.durationMinutes ?? 0) >= 180).length },
  ]
  const max = Math.max(...buckets.map((bucket) => bucket.count), 1)
  return <Card><CardHeader title="Session Duration" subtitle="Distribution of completed visits" action={<Clock3 className="h-4 w-4 text-slate-400" />} /><CardContent className="space-y-3 p-5 sm:p-6">{buckets.map((bucket) => <div key={bucket.label} className="grid grid-cols-[6rem_1fr_2rem] items-center gap-2 text-xs"><span className="text-slate-500">{bucket.label}</span><div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${(bucket.count / max) * 100}%` }} /></div><span className="text-right font-mono font-semibold text-slate-700">{bucket.count}</span></div>)}<p className="border-t border-slate-100 pt-3 text-xs text-slate-500">Based on {completed.length} completed mock sessions.</p></CardContent></Card>
}
