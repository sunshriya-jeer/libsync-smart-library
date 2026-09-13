import { CheckCircle2, LogIn, LogOut, RotateCcw } from 'lucide-react'
import type { Student } from '../../types'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card, CardContent } from '../ui/Card'
import type { ScanAction } from './mockScannerData'

interface ScanSuccessProps {
  action: ScanAction
  student: Student
  seatNumber: string
  entryTime: string
  exitTime?: string
  onScanAnother: () => void
}

export function ScanSuccess({ action, student, seatNumber, entryTime, exitTime, onScanAnother }: ScanSuccessProps) {
  const isEntry = action === 'entry'
  return <Card className="border-emerald-200"><CardContent className="space-y-5 p-5 sm:p-6"><div className="flex items-start gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><CheckCircle2 className="h-6 w-6" /></div><div><p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">{isEntry ? 'Entry recorded successfully' : 'Exit recorded successfully'}</p><h3 className="mt-1 text-lg font-bold text-slate-900">{student.fullName}</h3></div></div><div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4"><Info label={isEntry ? 'Seat assigned' : 'Seat released'} value={seatNumber} icon={isEntry ? <LogIn className="h-3.5 w-3.5" /> : <LogOut className="h-3.5 w-3.5" />} /><Info label="Entry time" value={formatTime(entryTime)} /><Info label={isEntry ? 'Current status' : 'Exit time'} value={isEntry ? 'Inside' : formatTime(exitTime)} /><Info label="Session result" value={isEntry ? 'Active session' : 'Completed'} /></div><div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4"><Badge variant={isEntry ? 'success' : 'default'} dot>{isEntry ? 'Inside' : 'Outside'}</Badge><Button type="button" variant="primary" icon={<RotateCcw className="h-4 w-4" />} onClick={onScanAnother}>Scan Another Student</Button></div></CardContent></Card>
}

function Info({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) { return <div><p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-800">{icon}{value}</p></div> }
function formatTime(value?: string) { return value ? new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'Not recorded' }
