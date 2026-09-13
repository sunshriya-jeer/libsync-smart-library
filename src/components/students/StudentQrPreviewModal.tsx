import { Printer, QrCode, X } from 'lucide-react'
import type { Student } from '../../types'
import { Button } from '../ui/Button'

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
  '111111101101111001011',
  '100000100011001110100',
  '101110101110111011101',
  '101110101001001100110',
  '101110100111101011011',
  '100000101010011101100',
  '111111101101101011101',
]

export function StudentQrPreviewModal({ student, onClose }: StudentQrPreviewModalProps) {
  if (!student) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/40 backdrop-blur-2xs" onClick={onClose} aria-label="Close QR preview" />
      <div role="dialog" aria-modal="true" aria-labelledby="qr-preview-title" className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div className="flex items-center gap-2.5"><QrCode className="h-5 w-5 text-indigo-600" /><h2 id="qr-preview-title" className="font-semibold text-slate-900">Library access pass</h2></div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700" aria-label="Close QR preview"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-4 p-5 sm:p-6">
          <div className="mx-auto grid aspect-square w-52 grid-cols-[repeat(21,minmax(0,1fr))] gap-0.5 border-8 border-white bg-white p-1 shadow-[0_4px_20px_rgba(15,23,42,0.12)]" aria-label="Visual QR placeholder">
            {QR_PATTERN.join('').split('').map((cell, index) => <span key={index} className={cell === '1' ? 'bg-slate-900' : 'bg-white'} />)}
          </div>
          <div className="text-center">
            <p className="font-semibold text-slate-900">{student.fullName}</p>
            <p className="mt-1 font-mono text-xs text-slate-500">{student.id}</p>
            <p className="mt-3 text-[11px] text-slate-400">Visual placeholder • Token: {student.qrToken}</p>
          </div>
          <Button type="button" variant="primary" className="w-full" icon={<Printer className="h-4 w-4" />} onClick={onClose}>Print Pass</Button>
        </div>
      </div>
    </div>
  )
}
