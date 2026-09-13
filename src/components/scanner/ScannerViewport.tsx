import { CheckCircle2, Keyboard, ScanLine } from 'lucide-react'
import { Card, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'

interface ScannerViewportProps {
  isScanning: boolean
  demoStudentId: string
  demoStudentIds: string[]
  onDemoStudentChange: (value: string) => void
  manualCode: string
  onManualCodeChange: (value: string) => void
  onSimulateScan: () => void
  onManualSubmit: () => void
}

export function ScannerViewport({ isScanning, demoStudentId, demoStudentIds, onDemoStudentChange, manualCode, onManualCodeChange, onSimulateScan, onManualSubmit }: ScannerViewportProps) {
  return (
    <Card>
      <CardContent className="p-5 sm:p-7">
        <div className="relative flex min-h-[330px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-6 text-center sm:min-h-[390px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.2),transparent_52%)]" />
          <div className="relative flex h-56 w-56 flex-col justify-between rounded-2xl border-2 border-indigo-400/60 p-4 sm:h-64 sm:w-64">
            <div className="flex justify-between"><Corner /><Corner right /></div>
            <div className="flex flex-col items-center gap-3">
              {isScanning ? <ScanLine className="h-11 w-11 animate-pulse text-indigo-300" /> : <CheckCircle2 className="h-11 w-11 text-indigo-300" />}
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-indigo-100">{isScanning ? 'Verifying student ID' : 'Ready to scan'}</span>
            </div>
            <div className="flex justify-between"><Corner bottom /><Corner right bottom /></div>
          </div>
          <p className="relative mt-5 max-w-sm text-xs leading-relaxed text-slate-400">Position the student QR code inside the frame. Camera access will be connected in a later milestone.</p>
          <Button type="button" variant="primary" size="md" className="relative mt-5" icon={<ScanLine className="h-4 w-4" />} onClick={onSimulateScan} disabled={isScanning}>{isScanning ? 'Scanning...' : 'Simulate Scan'}</Button>
        </div>
        <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center">
          <select value={demoStudentId} onChange={(event) => onDemoStudentChange(event.target.value)} aria-label="Choose simulated student" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"><option value="">Choose demo student</option>{demoStudentIds.map((id) => <option key={id} value={id}>{id}</option>)}</select>
          <div className="relative min-w-0 flex-1"><Keyboard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={manualCode} onChange={(event) => onManualCodeChange(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') onManualSubmit() }} placeholder="Test a Student ID, e.g. STU-2026-0331" aria-label="Manual student ID" className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20" /></div>
          <Button type="button" variant="outline" size="md" className="w-full sm:w-auto" onClick={onManualSubmit}>Verify ID</Button>
        </div>
      </CardContent>
    </Card>
  )
}

function Corner({ right = false, bottom = false }: { right?: boolean; bottom?: boolean }) {
  return <span className={`h-5 w-5 border-indigo-400 ${bottom ? 'border-b-2' : 'border-t-2'} ${right ? 'border-r-2' : 'border-l-2'}`} />
}
