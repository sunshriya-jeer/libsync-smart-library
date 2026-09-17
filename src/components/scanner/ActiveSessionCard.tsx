import { Clock3, Loader2, LogOut, MapPin, Timer } from 'lucide-react'
import type { LibrarySeat, Student } from '../../types'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { formatIstDateTime } from '../../utils/dateUtils'

interface ActiveSessionCardProps {
  student: Student
  seat: LibrarySeat | null
  entryTime?: string | null
  isSubmitting?: boolean
  onConfirmExit: () => void
}

export function ActiveSessionCard({
  student,
  seat,
  entryTime,
  isSubmitting = false,
  onConfirmExit,
}: ActiveSessionCardProps) {
  const recordedEntryTime = entryTime || seat?.entryTime

  return (
    <Card className="border-indigo-200">
      <CardHeader
        title="Active Library Session"
        subtitle="This student is currently inside the library."
        action={<Badge variant="success" dot>Inside</Badge>}
      />
      <CardContent className="space-y-5 p-5 sm:p-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Info label="Student" value={student.fullName} />
          <Info
            label="Student ID / PRN"
            value={student.student_id || student.studentId || student.id}
          />
          <Info
            label="Occupied seat"
            value={seat?.seatNumber ?? student.currentSeat ?? 'Assigned seat'}
            icon={<MapPin className="h-3.5 w-3.5 text-indigo-500" />}
          />
          <Info
            label="Entry time"
            value={formatTime(recordedEntryTime)}
            icon={<Clock3 className="h-3.5 w-3.5 text-indigo-500" />}
          />
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-2 text-xs font-medium text-indigo-900">
            <Timer className="h-4 w-4 text-indigo-600 shrink-0" />
            Current duration: {formatDuration(recordedEntryTime)}
          </span>
          <Button
            type="button"
            variant="primary"
            size="md"
            icon={isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            onClick={onConfirmExit}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? 'Processing Exit...' : 'Confirm Library Exit'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function Info({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: React.ReactNode
}) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 flex items-center gap-1 truncate text-sm font-medium text-slate-800">
        {icon}
        <span>{value}</span>
      </p>
    </div>
  )
}

function formatTime(value?: string | null) {
  return formatIstDateTime(value)
}

function formatDuration(value?: string | null) {
  if (!value) return 'Not recorded'
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000))
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (hours === 0) return `${remainingMinutes}m`
  return `${hours}h ${remainingMinutes}m`
}
