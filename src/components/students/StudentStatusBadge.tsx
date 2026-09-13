import { MapPin, CheckCircle2, Ban } from 'lucide-react'
import type { StudentStatus } from '../../types'
import { cn } from '../../utils/cn'

interface StudentStatusBadgeProps {
  status: StudentStatus
  className?: string
}

export function StudentStatusBadge({ status, className }: StudentStatusBadgeProps) {
  if (status === 'inside') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs',
          className
        )}
        title="Student is currently admitted inside the library"
        aria-label="Status: Inside Library"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
        </span>
        <MapPin className="w-3 h-3 text-emerald-600 shrink-0" aria-hidden="true" />
        <span>Inside</span>
      </span>
    )
  }

  if (status === 'active') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs',
          className
        )}
        title="Registered student with active library pass"
        aria-label="Status: Active"
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" aria-hidden="true" />
        <span>Active</span>
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200/80',
        className
      )}
      title="Deactivated or suspended library pass"
      aria-label="Status: Inactive"
    >
      <Ban className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
      <span>Inactive</span>
    </span>
  )
}
