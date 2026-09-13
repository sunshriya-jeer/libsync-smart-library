import { ArrowDownLeft, ArrowUpRight, CheckCircle2, Clock3 } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { Badge } from '../ui/Badge'
import type { ScanRecord } from './mockScannerData'

interface RecentScansProps { records: ScanRecord[] }

export function RecentScans({ records }: RecentScansProps) {
  return <Card><CardHeader title="Recent Scans" subtitle="Latest local scanner activity" action={<Clock3 className="h-4 w-4 text-slate-400" />} /><CardContent className="p-0"><div className="divide-y divide-slate-100">{records.length ? records.slice(0, 5).map((record) => <div key={record.id} className="flex items-center justify-between gap-3 px-5 py-3.5 sm:px-6"><div className="flex min-w-0 items-center gap-3"><div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${record.action === 'entry' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>{record.action === 'entry' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}</div><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{record.studentName}</p><p className="truncate font-mono text-[11px] text-slate-400">{record.studentId} • Seat {record.seatNumber}</p></div></div><div className="flex shrink-0 flex-col items-end gap-1"><Badge variant={record.status === 'success' ? 'success' : 'danger'} size="sm" dot>{record.action === 'entry' ? 'Entry' : 'Exit'}</Badge><span className="text-[11px] text-slate-400">{record.timestamp}</span></div></div>) : <div className="p-8 text-center text-sm text-slate-500">No recent scans yet.</div>}</div><div className="flex items-center gap-1.5 border-t border-slate-100 bg-slate-50/50 px-5 py-3 text-xs text-slate-500 sm:px-6"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />Local activity log only. Backend persistence will be added later.</div></CardContent></Card>
}
