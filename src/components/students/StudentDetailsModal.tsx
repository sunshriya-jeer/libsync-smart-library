import { Mail, MapPin, ScanBarcode, X } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Student } from '../../types'
import { Button } from '../ui/Button'
import { Card, CardContent } from '../ui/Card'
import { StudentStatusBadge } from './StudentStatusBadge'

interface StudentDetailsModalProps {
  student: Student | null
  onClose: () => void
}

export function StudentDetailsModal({ student, onClose }: StudentDetailsModalProps) {
  if (!student) return null

  const studentDisplayId = student.student_id || student.id

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/40 backdrop-blur-2xs" onClick={onClose} aria-label="Close student details" />
      <div role="dialog" aria-modal="true" aria-labelledby="student-details-title" className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50/60 p-5 sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Student profile</p>
            <h2 id="student-details-title" className="mt-1 text-lg font-bold tracking-tight text-slate-900">{student.fullName || student.full_name}</h2>
            <p className="mt-0.5 font-mono text-xs text-slate-500">{studentDisplayId}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700" aria-label="Close student details">
            <X className="h-5 w-5" />
          </button>
        </div>
        <Card className="rounded-none border-0 shadow-none">
          <CardContent className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6">
            <div className="sm:col-span-2"><StudentStatusBadge status={student.status} /></div>
            <DetailItem label="Student ID / PRN" value={studentDisplayId} />
            <DetailItem label="College Barcode" value={student.college_barcode || 'Not assigned'} icon={<ScanBarcode className="h-4 w-4 text-slate-500" />} />
            <DetailItem label="Email" value={student.email || 'Not provided'} icon={<Mail className="h-4 w-4" />} />
            <DetailItem label="Department" value={student.department} />
            <DetailItem label="Division" value={student.division || '—'} />
            <DetailItem label="Current seat" value={student.currentSeat ?? 'Not checked in'} icon={<MapPin className="h-4 w-4" />} />
            <DetailItem label="Joined" value={student.joinedDate || 'Recently'} />
            <DetailItem label="Last visit" value={student.lastVisit ?? 'No visits recorded'} />
          </CardContent>
        </Card>
        <div className="flex justify-end border-t border-slate-100 p-5 sm:p-6">
          <Button type="button" variant="outline" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  )
}

function DetailItem({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 flex items-center gap-1.5 break-words text-sm font-medium text-slate-800">{icon}<span>{value}</span></p>
    </div>
  )
}
