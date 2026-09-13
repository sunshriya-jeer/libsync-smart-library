import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import type { LibrarySeat, Student } from '../types'
import { Badge } from '../components/ui/Badge'
import { ActiveSessionCard } from '../components/scanner/ActiveSessionCard'
import { RecentScans } from '../components/scanner/RecentScans'
import { ScanResultCard } from '../components/scanner/ScanResultCard'
import { ScanSuccess } from '../components/scanner/ScanSuccess'
import { ScannerViewport } from '../components/scanner/ScannerViewport'
import { SeatSelection } from '../components/scanner/SeatSelection'
import { DEFAULT_SIMULATED_STUDENT_ID, INITIAL_RECENT_SCANS, type ScanAction, type ScanRecord } from '../components/scanner/mockScannerData'
import { INITIAL_MOCK_SEATS } from '../components/seats/mockSeats'
import { INITIAL_MOCK_STUDENTS } from '../components/students/mockStudents'

type ScannerPhase = 'ready' | 'scanning' | 'verified' | 'success' | 'error'

interface SuccessDetails {
  action: ScanAction
  student: Student
  seatNumber: string
  entryTime: string
  exitTime?: string
}

export function ScannerPage() {
  const [students, setStudents] = useState<Student[]>(INITIAL_MOCK_STUDENTS)
  const [seats, setSeats] = useState<LibrarySeat[]>(INITIAL_MOCK_SEATS)
  const [records, setRecords] = useState<ScanRecord[]>(INITIAL_RECENT_SCANS)
  const [phase, setPhase] = useState<ScannerPhase>('ready')
  const [scannedStudent, setScannedStudent] = useState<Student | null>(null)
  const [selectedSeat, setSelectedSeat] = useState<LibrarySeat | null>(null)
  const [section, setSection] = useState('all')
  const [manualCode, setManualCode] = useState('')
  const [demoStudentId, setDemoStudentId] = useState(DEFAULT_SIMULATED_STUDENT_ID)
  const [errorMessage, setErrorMessage] = useState('')
  const [successDetails, setSuccessDetails] = useState<SuccessDetails | null>(null)

  const activeSeat = scannedStudent ? seats.find((seat) => seat.status === 'occupied' && seat.studentId === scannedStudent.id) ?? null : null

  const resetFlow = () => {
    setPhase('ready')
    setScannedStudent(null)
    setSelectedSeat(null)
    setErrorMessage('')
    setSuccessDetails(null)
    setManualCode('')
  }

  const scanStudent = (studentId: string) => {
    setPhase('scanning')
    setScannedStudent(null)
    setSelectedSeat(null)
    setSuccessDetails(null)
    setErrorMessage('')
    window.setTimeout(() => {
      const student = students.find((candidate) => candidate.id.toLowerCase() === studentId.trim().toLowerCase())
      if (!student) {
        setPhase('error')
        setErrorMessage('Student not found')
        return
      }
      setScannedStudent(student)
      setPhase('verified')
      if (student.status === 'inside') setErrorMessage('This student is already inside the library.')
      if (student.status === 'inactive') setErrorMessage('Student account is inactive')
    }, 350)
  }

  const confirmEntry = () => {
    if (!scannedStudent || !selectedSeat) return
    const currentSeat = seats.find((seat) => seat.id === selectedSeat.id)
    if (!currentSeat || currentSeat.status !== 'free') {
      setPhase('error')
      setErrorMessage('This seat is no longer available. Please select another seat.')
      setSelectedSeat(null)
      return
    }
    const entryTime = new Date().toISOString()
    const updatedStudent = { ...scannedStudent, status: 'inside' as const, currentSeat: currentSeat.seatNumber, lastVisit: 'Just now' }
    setSeats((currentSeats) => currentSeats.map((seat) => seat.id === currentSeat.id ? { ...seat, status: 'occupied', studentId: updatedStudent.id, studentName: updatedStudent.fullName, entryTime } : seat))
    setStudents((currentStudents) => currentStudents.map((student) => student.id === updatedStudent.id ? updatedStudent : student))
    setScannedStudent(updatedStudent)
    setSuccessDetails({ action: 'entry', student: updatedStudent, seatNumber: currentSeat.seatNumber, entryTime })
    addScanRecord({ action: 'entry', student: updatedStudent, seatNumber: currentSeat.seatNumber, timestamp: 'Just now' })
    setPhase('success')
  }

  const confirmExit = () => {
    if (!scannedStudent || !activeSeat) return
    const exitTime = new Date().toISOString()
    const updatedStudent = { ...scannedStudent, status: 'active' as const, currentSeat: null, lastVisit: 'Just now' }
    setSeats((currentSeats) => currentSeats.map((seat) => seat.id === activeSeat.id ? { ...seat, status: 'free', studentId: undefined, studentName: undefined, entryTime: undefined } : seat))
    setStudents((currentStudents) => currentStudents.map((student) => student.id === updatedStudent.id ? updatedStudent : student))
    setSuccessDetails({ action: 'exit', student: updatedStudent, seatNumber: activeSeat.seatNumber, entryTime: activeSeat.entryTime ?? exitTime, exitTime })
    addScanRecord({ action: 'exit', student: updatedStudent, seatNumber: activeSeat.seatNumber, timestamp: 'Just now' })
    setPhase('success')
  }

  const addScanRecord = ({ action, student, seatNumber, timestamp }: { action: ScanAction; student: Student; seatNumber: string; timestamp: string }) => {
    setRecords((currentRecords) => [{ id: `scan-${Date.now()}`, studentName: student.fullName, studentId: student.id, action, seatNumber, timestamp, status: 'success' }, ...currentRecords])
  }

  const showFlowError = phase === 'error' || Boolean(errorMessage && !scannedStudent)

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><div className="flex items-center gap-2"><Badge variant="primary" size="sm">Kiosk &amp; desk station</Badge><span className="text-xs text-slate-400">•</span><span className="text-xs font-medium text-slate-500">Scan. Sit. Study. Sync.</span></div><h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Library Scanner</h2><p className="mt-1 text-xs text-slate-500 sm:text-sm">Scan a student QR code to record library entry or exit.</p></div><Badge variant={phase === 'scanning' ? 'warning' : 'success'} dot>{phase === 'scanning' ? 'Scanner active' : 'Scanner ready'}</Badge></div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5"><div className="space-y-6 lg:col-span-3"><ScannerViewport isScanning={phase === 'scanning'} demoStudentId={demoStudentId} demoStudentIds={students.map((student) => student.id)} onDemoStudentChange={setDemoStudentId} manualCode={manualCode} onManualCodeChange={setManualCode} onSimulateScan={() => scanStudent(demoStudentId)} onManualSubmit={() => scanStudent(manualCode)} />{showFlowError && <ErrorBanner message={errorMessage} />}{scannedStudent && <ScanResultCard student={scannedStudent} />}{scannedStudent?.status === 'inactive' && <ErrorBanner message="Student account is inactive" />}{scannedStudent?.status === 'inside' && phase === 'verified' && <><ErrorBanner message="This student is already inside the library." /><ActiveSessionCard student={scannedStudent} seat={activeSeat} onConfirmExit={confirmExit} /></>}{scannedStudent?.status === 'active' && phase === 'verified' && <SeatSelection seats={seats} selectedSeat={selectedSeat} section={section} onSectionChange={setSection} onSelect={setSelectedSeat} onConfirm={confirmEntry} />}{phase === 'success' && successDetails && <ScanSuccess {...successDetails} onScanAnother={resetFlow} />}</div><div className="lg:col-span-2"><RecentScans records={records} /></div></div>
    </div>
  )
}

function ErrorBanner({ message }: { message: string }) {
  return <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{message}</span></div>
}
