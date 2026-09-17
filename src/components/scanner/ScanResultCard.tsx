import { Barcode, CheckCircle2, GraduationCap, IdCard, ShieldAlert, UserRound } from 'lucide-react'
import type { Student } from '../../types'
import { Badge } from '../ui/Badge'
import { Card, CardContent } from '../ui/Card'

interface ScanResultCardProps {
  student: Student
  isInside?: boolean
}

export function ScanResultCard({ student, isInside = false }: ScanResultCardProps) {
  const isInactive = student.status === 'inactive'

  return (
    <Card>
      <CardContent className="space-y-4 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <UserRound className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                {isInactive ? 'Scan blocked' : 'Student verified'}
              </p>
              <h3 className="mt-0.5 font-semibold text-slate-900">{student.fullName}</h3>
            </div>
          </div>
          <Badge variant={isInactive ? 'danger' : isInside ? 'success' : 'primary'} dot>
            {isInactive ? 'Inactive' : isInside ? 'Inside' : 'Outside'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
          <Info
            label="Student ID / PRN"
            value={student.student_id || student.studentId || student.id}
            mono
            icon={<IdCard className="h-3.5 w-3.5 text-indigo-500" />}
          />
          <Info
            label="College Barcode"
            value={student.college_barcode || 'No barcode assigned'}
            mono
            icon={<Barcode className="h-3.5 w-3.5 text-indigo-500" />}
          />
          <Info
            label="Department"
            value={student.department}
            icon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
          />
          <Info
            label="Year & Division"
            value={`${student.year || '1st Year'}${student.division ? ` • ${student.division}` : ''}`}
            icon={<GraduationCap className="h-3.5 w-3.5 text-indigo-500" />}
          />
        </div>

        {isInactive && (
          <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Student account is inactive. Library entry and exit actions are blocked.</span>
          </div>
        )}
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
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`mt-1 flex items-center gap-1.5 truncate text-sm font-medium text-slate-800 ${mono ? 'font-mono text-xs' : ''}`}>
        {icon}
        <span>{value}</span>
      </p>
    </div>
  )
}
