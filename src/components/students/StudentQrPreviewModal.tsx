import { BookOpen, Printer, QrCode, ScanBarcode, X } from 'lucide-react'
import type { Student } from '../../types'
import { Button } from '../ui/Button'
import { StudentStatusBadge } from './StudentStatusBadge'

interface StudentQrPreviewModalProps {
  student: Student | null
  onClose: () => void
}

const QR_PATTERN = [
  '111111100101101111111',
  '100000101110101000001',
  '101110100011101011101',
  '101110101101101011101',
  '101110100110101011101',
  '100000101011101000001',
  '111111101010101111111',
  '000000001101100000000',
  '110110111011011011101',
  '001011001100110100010',
  '111001111011101110111',
  '010110000101011001100',
  '101101111110110111001',
  '000000001011001010110',
  '111111101101101001011',
  '100000100011001110100',
  '101110101110111011101',
  '101110101001001100110',
  '101110100111101011011',
  '100000101010011101100',
  '111111101101101011101',
]

export function StudentQrPreviewModal({ student, onClose }: StudentQrPreviewModalProps) {
  if (!student) return null

  const studentName = student.fullName || student.full_name || 'Student'
  const studentDisplayId = student.student_id || student.id

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:static print:p-0">
      <button
        type="button"
        className="no-print absolute inset-0 bg-slate-900/40 backdrop-blur-2xs"
        onClick={onClose}
        aria-label="Close QR preview"
      />
      <div
        id="printable-student-pass"
        role="dialog"
        aria-modal="true"
        aria-labelledby="qr-preview-title"
        className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl print:m-0 print:border-slate-300 print:shadow-none"
      >
        {/* On-screen modal header (hidden when printed) */}
        <div className="no-print flex items-center justify-between border-b border-slate-100 p-4 sm:p-5">
          <div className="flex items-center gap-2.5">
            <QrCode className="h-5 w-5 text-indigo-600" />
            <h2 id="qr-preview-title" className="font-semibold text-slate-900">
              Student Library Pass
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close QR preview"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Printed Pass Card Content */}
        <div className="space-y-4 p-5 sm:p-6">
          {/* Institution & Brand Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700">LibSync</h3>
                <p className="text-[10px] font-medium text-slate-500">Smart Library Pass</p>
              </div>
            </div>
            <StudentStatusBadge status={student.status} />
          </div>

          {/* Visual QR Placeholder */}
          <div
            className="mx-auto grid aspect-square w-44 grid-cols-[repeat(21,minmax(0,1fr))] gap-0.5 border-4 border-white bg-white p-1 shadow-[0_2px_12px_rgba(15,23,42,0.08)]"
            aria-label="Visual QR placeholder"
          >
            {QR_PATTERN.join('').split('').map((cell, index) => (
              <span key={index} className={cell === '1' ? 'bg-slate-900' : 'bg-white'} />
            ))}
          </div>

          {/* Student Profile Info */}
          <div className="text-center">
            <h4 className="text-base font-bold text-slate-900">{studentName}</h4>
            <p className="mt-0.5 font-mono text-xs font-medium text-slate-500">ID: {studentDisplayId}</p>
          </div>

          {/* Department, Year, Division */}
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 text-left border border-slate-100 text-xs">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Department</p>
              <p className="mt-0.5 font-medium text-slate-800 truncate">{student.department}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Year</p>
              <p className="mt-0.5 font-medium text-slate-800">{student.year || '—'}</p>
            </div>
            {student.division && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Division</p>
                <p className="mt-0.5 font-medium text-slate-800">{student.division}</p>
              </div>
            )}
            <div className={student.division ? '' : 'col-span-2'}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Status</p>
              <p className="mt-0.5 font-medium capitalize text-slate-800">{student.status}</p>
            </div>
          </div>

          {/* Official Identifier: College Barcode */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
              <ScanBarcode className="h-3.5 w-3.5" />
              <span>Official Identifier</span>
            </div>
            <p className="mt-1 font-mono text-sm font-bold tracking-wider text-slate-900">
              {student.college_barcode || 'Not assigned'}
            </p>
            <p className="mt-1 text-[10px] text-slate-400">
              Visual preview above • College barcode is the official access credential
            </p>
          </div>

          {/* Action Button (hidden in print) */}
          <div className="no-print pt-1">
            <Button
              type="button"
              variant="primary"
              className="w-full"
              icon={<Printer className="h-4 w-4" />}
              onClick={handlePrint}
            >
              Print Pass
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
