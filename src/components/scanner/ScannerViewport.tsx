import { Barcode, CheckCircle2, Keyboard, Loader2, ScanLine } from 'lucide-react'
import { Card, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import type { Student } from '../../types'

export type ScannerMode = 'auto' | 'entry' | 'exit'

interface ScannerViewportProps {
  isScanning: boolean
  manualCode: string
  onManualCodeChange: (value: string) => void
  onManualSubmit: () => void
  registeredStudents?: Student[]
  selectedStudentBarcode: string
  onSelectStudentBarcode: (barcode: string) => void
  mode: ScannerMode
  onModeChange: (mode: ScannerMode) => void
}

export function ScannerViewport({
  isScanning,
  manualCode,
  onManualCodeChange,
  onManualSubmit,
  registeredStudents = [],
  selectedStudentBarcode,
  onSelectStudentBarcode,
  mode,
  onModeChange,
}: ScannerViewportProps) {
  // Filter registered students who have a college barcode
  const studentsWithBarcodes = registeredStudents.filter((s) => Boolean(s.college_barcode))

  return (
    <Card className="overflow-hidden border-slate-200">
      <CardContent className="p-5 sm:p-7">
        {/* Mode Selector */}
        <div className="mb-5 flex items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Workflow Mode
          </span>
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => onModeChange('auto')}
              className={`rounded-md px-3 py-1 font-medium transition-all ${
                mode === 'auto'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Auto Detect
            </button>
            <button
              type="button"
              onClick={() => onModeChange('entry')}
              className={`rounded-md px-3 py-1 font-medium transition-all ${
                mode === 'entry'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Check-In (Entry)
            </button>
            <button
              type="button"
              onClick={() => onModeChange('exit')}
              className={`rounded-md px-3 py-1 font-medium transition-all ${
                mode === 'exit'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Check-Out (Exit)
            </button>
          </div>
        </div>

        {/* Viewport Visualization */}
        <div className="relative flex min-h-[300px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-6 text-center sm:min-h-[340px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.2),transparent_52%)]" />
          <div className="relative flex h-52 w-52 flex-col justify-between rounded-2xl border-2 border-indigo-400/60 p-4 sm:h-56 sm:w-56">
            <div className="flex justify-between">
              <Corner />
              <Corner right />
            </div>
            <div className="flex flex-col items-center gap-3">
              {isScanning ? (
                <ScanLine className="h-10 w-10 animate-pulse text-indigo-300" />
              ) : (
                <Barcode className="h-10 w-10 text-indigo-300" />
              )}
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-indigo-100">
                {isScanning ? 'Verifying Barcode...' : 'Barcode Entry Station'}
              </span>
            </div>
            <div className="flex justify-between">
              <Corner bottom />
              <Corner right bottom />
            </div>
          </div>
          <p className="relative mt-4 max-w-sm text-xs leading-relaxed text-slate-400">
            Enter or select a student's official college barcode to verify identity and record library entry or exit.
          </p>
          <Button
            type="button"
            variant="primary"
            size="md"
            className="relative mt-4"
            icon={isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanLine className="h-4 w-4" />}
            onClick={onManualSubmit}
            disabled={isScanning || !manualCode.trim()}
          >
            {isScanning ? 'Verifying...' : 'Submit Barcode'}
          </Button>
        </div>

        {/* Barcode Quick Select & Manual Input Form */}
        <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
          {studentsWithBarcodes.length > 0 && (
            <div className="flex items-center gap-2">
              <label htmlFor="student-barcode-select" className="text-xs font-medium text-slate-500 shrink-0">
                Quick Select Student:
              </label>
              <select
                id="student-barcode-select"
                value={selectedStudentBarcode}
                onChange={(event) => {
                  const bc = event.target.value
                  onSelectStudentBarcode(bc)
                  if (bc) {
                    onManualCodeChange(bc)
                  }
                }}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="">Select registered student with barcode...</option>
                {studentsWithBarcodes.map((s) => (
                  <option key={s.id} value={s.college_barcode || ''}>
                    {s.fullName} ({s.student_id || s.studentId}) — Barcode: {s.college_barcode} [{s.status}]
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <Keyboard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={manualCode}
                onChange={(event) => onManualCodeChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') onManualSubmit()
                }}
                placeholder="Enter college barcode, e.g. BARCODE-2026-001"
                aria-label="College barcode"
                disabled={isScanning}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="md"
              className="w-full sm:w-auto"
              onClick={onManualSubmit}
              disabled={isScanning || !manualCode.trim()}
              icon={isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 text-indigo-600" />}
            >
              Verify Barcode
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function Corner({ right = false, bottom = false }: { right?: boolean; bottom?: boolean }) {
  return (
    <span
      className={`h-5 w-5 border-indigo-400 ${bottom ? 'border-b-2' : 'border-t-2'} ${
        right ? 'border-r-2' : 'border-l-2'
      }`}
    />
  )
}
