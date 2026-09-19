import { useState, useEffect } from 'react'
import { QrCode, CheckCircle2, ShieldCheck, RefreshCw, Smartphone } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { fetchCurrentStudent } from '../services/studentService'
import type { Student } from '../types'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'

export function StudentScanPage() {
  const { profile, session } = useAuth()
  const [student, setStudent] = useState<Student | null>(null)
  const [scannedMessage, setScannedMessage] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)

  useEffect(() => {
    let isMounted = true
    fetchCurrentStudent()
      .then((data) => {
        if (!isMounted || !data) return
        setStudent(data)
      })
      .catch((err) => {
        console.warn('[StudentScanPage] Could not load linked student record:', err)
      })
    return () => {
      isMounted = false
    }
  }, [])

  const studentName = student?.fullName || student?.full_name || profile?.full_name || session?.user.email?.split('@')[0] || 'Student'
  const qrTokenDisplay = student?.qr_token || 'LIB-PASS-SYNC'
  const studentIdDisplay = student?.student_id || 'STU-2026'
  const collegeBarcodeDisplay = student?.college_barcode || 'Physical Card Barcode'

  const handleSimulateScan = () => {
    setIsScanning(true)
    setScannedMessage(null)
    setTimeout(() => {
      setIsScanning(false)
      setScannedMessage(`Pass verified for ${studentName} (${studentIdDisplay}). Kiosk entry logged.`)
    }, 900)
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div>
        <div className="flex items-center gap-2">
          <Badge variant="primary" size="sm">
            Digital Pass
          </Badge>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-500 font-medium">Entrance &amp; Kiosk Sync</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
          Student QR Pass
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Scan this digital pass at the entrance scanner kiosk to enter and check out.
        </p>
      </div>

      <Card className="border-indigo-100 overflow-hidden shadow-sm">
        <div className="bg-indigo-600 p-4 text-white text-center">
          <p className="text-xs uppercase font-semibold tracking-wider text-indigo-100">
            LibSync University Library
          </p>
          <p className="text-base font-bold">Official Student Access Pass</p>
        </div>

        <CardContent className="p-6 sm:p-8 flex flex-col items-center text-center space-y-6">
          {/* QR Container */}
          <div className="relative p-6 bg-white border-2 border-dashed border-indigo-200 rounded-3xl shadow-xs">
            <div className="w-48 h-48 sm:w-56 sm:h-56 bg-slate-900 rounded-2xl flex flex-col items-center justify-center p-4 text-white">
              <QrCode className="w-full h-full text-white" />
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white px-3 py-0.5 rounded-full border border-indigo-100 text-[10px] font-mono font-semibold text-indigo-600 shadow-2xs max-w-[220px] truncate">
              TOKEN #{qrTokenDisplay}
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">{studentName}</h2>
            <p className="text-xs text-slate-500 font-mono">
              ID: {studentIdDisplay} • Barcode: {collegeBarcodeDisplay}
            </p>
            {student?.department && (
              <p className="text-xs text-slate-400">
                {student.department} {student.year ? `• ${student.year}` : ''}
              </p>
            )}
            <div className="pt-2 flex justify-center gap-2">
              <Badge variant={student?.status === 'inactive' ? 'default' : 'success'} dot size="sm">
                {student?.status === 'inactive' ? 'Inactive Member' : 'Active Library Member'}
              </Badge>
            </div>
          </div>

          {scannedMessage && (
            <div className="w-full p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 text-left">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{scannedMessage}</span>
            </div>
          )}

          <div className="w-full pt-2">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isScanning}
              onClick={handleSimulateScan}
              icon={isScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Smartphone className="w-4 h-4" />}
            >
              {isScanning ? 'Simulating Kiosk Scan...' : 'Simulate Kiosk Check-In'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title="Kiosk Scanner Instructions"
          subtitle="How to use your pass at library checkpoints"
        />
        <CardContent className="space-y-3 text-xs text-slate-600">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center shrink-0">
              1
            </div>
            <p>Hold this QR code 4-6 inches in front of the scanner viewport at the entrance turnstile.</p>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center shrink-0">
              2
            </div>
            <p>The system will automatically allocate an optimal seat in your preferred quiet zone.</p>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center shrink-0">
              3
            </div>
            <p className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Before leaving, scan again to release your seat for fellow students.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
