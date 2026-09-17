import { CheckCircle2, Clock3, LogIn, LogOut, RotateCcw, Timer } from 'lucide-react'
import type { ScanAction, Student } from '../../types'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card, CardContent } from '../ui/Card'
import { formatIstDateTime } from '../../utils/dateUtils'

interface ScanSuccessProps {
  action: ScanAction
  student: Student
  seatNumber: string
  entryTime: string
  exitTime?: string
  durationMinutes?: number
  onScanAnother: () => void
}

export function ScanSuccess({
  action,
  student,
  seatNumber,
  entryTime,
  exitTime,
  durationMinutes,
  onScanAnother,
}: ScanSuccessProps) {
  const isEntry = action === 'entry'

  return (
    <Card className="border-emerald-300 bg-white shadow-sm">
      <CardContent className="space-y-5 p-5 sm:p-6">
        <div className="flex items-start gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-2xs">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              {isEntry ? 'Entry Recorded Successfully' : 'Exit Recorded Successfully'}
            </p>
            <h3 className="mt-1 text-xl font-bold text-slate-900">{student.fullName}</h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {student.student_id || student.studentId || student.id} • {student.department}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-4">
          <Info
            label={isEntry ? 'Seat Assigned' : 'Seat Released'}
            value={`Seat ${seatNumber}`}
            icon={isEntry ? <LogIn className="h-3.5 w-3.5 text-emerald-600" /> : <LogOut className="h-3.5 w-3.5 text-indigo-600" />}
          />
          <Info
            label="Entry Time"
            value={formatTime(entryTime)}
            icon={<Clock3 className="h-3.5 w-3.5 text-slate-500" />}
          />
          {isEntry ? (
            <>
              <Info label="Session Status" value="Active Inside" />
              <Info label="College Barcode" value={student.college_barcode || '—'} mono />
            </>
          ) : (
            <>
              <Info
                label="Exit Time"
                value={formatTime(exitTime)}
                icon={<Clock3 className="h-3.5 w-3.5 text-slate-500" />}
              />
              <Info
                label="Session Duration"
                value={formatDurationMinutes(durationMinutes, entryTime, exitTime)}
                icon={<Timer className="h-3.5 w-3.5 text-indigo-600" />}
              />
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <Badge variant={isEntry ? 'success' : 'default'} dot>
            {isEntry ? 'Student Inside' : 'Session Completed'}
          </Badge>
          <Button
            type="button"
            variant="primary"
            icon={<RotateCcw className="h-4 w-4" />}
            onClick={onScanAnother}
          >
            Scan Another Student
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function Info({
  label,
  value,
  mono = false,
  icon,
}: {
  label: string
  value: string
  mono?: boolean
  icon?: React.ReactNode
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-800 ${mono ? 'font-mono text-xs' : ''}`}>
        {icon}
        <span>{value}</span>
      </p>
    </div>
  )
}

function formatTime(value?: string) {
  return formatIstDateTime(value)
}

function formatDurationMinutes(duration?: number, entryTime?: string, exitTime?: string) {
  let minutes = duration
  if (minutes === undefined && entryTime && exitTime) {
    minutes = Math.max(0, Math.floor((new Date(exitTime).getTime() - new Date(entryTime).getTime()) / 60000))
  }
  if (minutes === undefined || minutes === null) return 'Not recorded'
  const hours = Math.floor(minutes / 60)
  const remaining = minutes % 60
  if (hours === 0) return `${remaining} min`
  return `${hours}h ${remaining}m`
}
