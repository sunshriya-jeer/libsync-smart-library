import { useState, useEffect } from 'react'
import { AlertCircle, Database } from 'lucide-react'
import type { LibrarySeat, ScanAction, Student } from '../types'
import { Badge } from '../components/ui/Badge'
import { ActiveSessionCard } from '../components/scanner/ActiveSessionCard'
import { RecentScans } from '../components/scanner/RecentScans'
import { ScanResultCard } from '../components/scanner/ScanResultCard'
import { ScanSuccess } from '../components/scanner/ScanSuccess'
import { ScannerViewport, type ScannerMode } from '../components/scanner/ScannerViewport'
import { SeatSelection } from '../components/scanner/SeatSelection'
import {
  findStudentByCollegeBarcode,
  getActiveSessionForStudent,
  createLibraryEntrySession,
  completeLibraryExitSession,
  fetchRecentScans,
  type RecentScanRecord,
} from '../services/sessionService'
import { fetchFreeSeats } from '../services/seatService'
import { fetchStudents } from '../services/studentService'

type ScannerPhase = 'ready' | 'scanning' | 'verified' | 'success' | 'error'

interface SuccessDetails {
  action: ScanAction
  student: Student
  seatNumber: string
  entryTime: string
  exitTime?: string
  durationMinutes?: number
}

export function ScannerPage() {
  const [registeredStudents, setRegisteredStudents] = useState<Student[]>([])
  const [freeSeats, setFreeSeats] = useState<LibrarySeat[]>([])
  const [recentScans, setRecentScans] = useState<RecentScanRecord[]>([])
  const [isLoadingScans, setIsLoadingScans] = useState(true)
  const [scansError, setScansError] = useState<string | null>(null)
  const [phase, setPhase] = useState<ScannerPhase>('ready')
  const [mode, setMode] = useState<ScannerMode>('auto')
  const [scannedStudent, setScannedStudent] = useState<Student | null>(null)
  const [activeSession, setActiveSession] = useState<{
    sessionId: string
    seatId: string
    seat: LibrarySeat
    entryTime: string
  } | null>(null)
  const [selectedSeat, setSelectedSeat] = useState<LibrarySeat | null>(null)
  const [section, setSection] = useState('all')
  const [manualCode, setManualCode] = useState('')
  const [selectedStudentBarcode, setSelectedStudentBarcode] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingSeats, setIsLoadingSeats] = useState(false)
  const [successDetails, setSuccessDetails] = useState<SuccessDetails | null>(null)

  const loadRecentScans = async () => {
    try {
      setIsLoadingScans(true)
      setScansError(null)
      const scans = await fetchRecentScans(10)
      setRecentScans(scans)
      return scans
    } catch (err: unknown) {
      console.error('[ScannerPage] Failed to load recent scans:', err)
      setScansError(
        err instanceof Error ? err.message : 'Unable to load recent session activity.'
      )
      return []
    } finally {
      setIsLoadingScans(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const initData = async () => {
      try {
        const [studentsData, seatsData, scansData] = await Promise.allSettled([
          fetchStudents(),
          fetchFreeSeats(),
          fetchRecentScans(10),
        ])

        if (isMounted) {
          if (studentsData.status === 'fulfilled') {
            setRegisteredStudents(studentsData.value)
          }
          if (seatsData.status === 'fulfilled') {
            setFreeSeats(seatsData.value)
          }
          if (scansData.status === 'fulfilled') {
            setRecentScans(scansData.value)
            setScansError(null)
          } else {
            console.error('[ScannerPage] Failed initial scans fetch:', scansData.reason)
            setScansError('Unable to load recent session activity.')
          }
        }
      } catch {
        // Non-blocking initial data load
      } finally {
        if (isMounted) {
          setIsLoadingScans(false)
        }
      }
    }

    void initData()

    return () => {
      isMounted = false
    }
  }, [])

  const refreshFreeSeats = async () => {
    try {
      setIsLoadingSeats(true)
      const seats = await fetchFreeSeats()
      setFreeSeats(seats)
      return seats
    } catch (err: unknown) {
      console.error('[ScannerPage] Failed to refresh free seats:', err)
      return []
    } finally {
      setIsLoadingSeats(false)
    }
  }

  const resetFlow = () => {
    setPhase('ready')
    setScannedStudent(null)
    setActiveSession(null)
    setSelectedSeat(null)
    setErrorMessage('')
    setSuccessDetails(null)
    setManualCode('')
    setSelectedStudentBarcode('')
    void refreshFreeSeats()
    void loadRecentScans()
  }

  // Barcode Submission & Verification
  const handleBarcodeSubmit = async () => {
    const trimmedBarcode = manualCode.trim()
    if (!trimmedBarcode) {
      setPhase('error')
      setErrorMessage('Please enter a valid college barcode.')
      return
    }

    setPhase('scanning')
    setScannedStudent(null)
    setActiveSession(null)
    setSelectedSeat(null)
    setSuccessDetails(null)
    setErrorMessage('')

    try {
      // Step 1: Search public.students by college_barcode
      const student = await findStudentByCollegeBarcode(trimmedBarcode)
      if (!student) {
        setPhase('error')
        setErrorMessage(
          `No student found with barcode "${trimmedBarcode}". Please check the barcode and try again.`
        )
        return
      }

      setScannedStudent(student)

      // Step 2: Verify student status is active
      if (student.status === 'inactive') {
        setPhase('error')
        setErrorMessage(
          'Student account is inactive. Library entry and exit permissions are revoked.'
        )
        return
      }

      // Step 3: Check whether the student already has an active library session in public.library_sessions
      const activeSessionData = await getActiveSessionForStudent(student.id)

      if (activeSessionData) {
        // Student already has an active session (student is inside)
        setActiveSession({
          sessionId: activeSessionData.rawSession.id,
          seatId: activeSessionData.rawSession.seat_id,
          seat: activeSessionData.seat,
          entryTime: activeSessionData.rawSession.entry_time,
        })

        if (mode === 'entry') {
          setPhase('error')
          setErrorMessage(
            'This student is already inside the library and cannot enter again.'
          )
          return
        }

        // In 'auto' or 'exit' mode: show active session card so librarian can confirm exit
        setPhase('verified')
        if (mode === 'auto') {
          setErrorMessage('This student is already inside the library.')
        }
        return
      }

      // Student has NO active session (student is outside)
      if (mode === 'exit') {
        // Handle error case: Student has no active session during exit
        setPhase('error')
        setErrorMessage('Student is not currently inside the library. No active session found.')
        return
      }

      // Load currently free seats from public.seats
      const seats = await refreshFreeSeats()
      if (seats.length === 0) {
        setPhase('error')
        setErrorMessage(
          'No free seats are currently available in the library. All seats are occupied or under maintenance.'
        )
        return
      }

      setPhase('verified')
      setErrorMessage('')
    } catch (err: unknown) {
      console.error('[ScannerPage] Verification failed:', err)
      setPhase('error')
      setErrorMessage(
        err instanceof Error ? err.message : 'Database error occurred while verifying barcode.'
      )
    }
  }

  // Confirm Library Entry
  const handleConfirmEntry = async () => {
    if (!scannedStudent || !selectedSeat) return

    try {
      setIsSubmitting(true)
      setErrorMessage('')

      // createLibraryEntrySession re-checks:
      // 1. student active session state
      // 2. selected seat status in Supabase (must be 'free')
      // Then inserts public.library_sessions row and updates seat to 'occupied'
      const { session, seat } = await createLibraryEntrySession(
        scannedStudent.id,
        selectedSeat.id
      )

      const entryTime = session.entryTime || new Date().toISOString()
      setSuccessDetails({
        action: 'entry',
        student: scannedStudent,
        seatNumber: seat.seatNumber,
        entryTime,
      })

      // Refresh seats list and live recent scans from Supabase
      void refreshFreeSeats()
      void loadRecentScans()
      setPhase('success')
    } catch (err: unknown) {
      console.error('[ScannerPage] Entry failed:', err)
      setPhase('error')
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to record library entry session.'
      )
      // Refresh available seats in case seat was taken
      void refreshFreeSeats()
    } finally {
      setIsSubmitting(false)
    }
  }

  // Confirm Library Exit
  const handleConfirmExit = async () => {
    if (!scannedStudent || !activeSession) return

    try {
      setIsSubmitting(true)
      setErrorMessage('')

      // completeLibraryExitSession updates library_sessions (exit_time, status='completed')
      // and updates public.seats (status='free')
      const { seat, durationMinutes } = await completeLibraryExitSession(
        activeSession.sessionId,
        activeSession.seatId
      )

      const exitTime = new Date().toISOString()
      setSuccessDetails({
        action: 'exit',
        student: scannedStudent,
        seatNumber: seat.seatNumber,
        entryTime: activeSession.entryTime,
        exitTime,
        durationMinutes,
      })

      // Refresh available seats and live recent scans from Supabase
      void refreshFreeSeats()
      void loadRecentScans()
      setPhase('success')
    } catch (err: unknown) {
      console.error('[ScannerPage] Exit failed:', err)
      setPhase('error')
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to record library exit session.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const isStudentInside = Boolean(activeSession)
  const isStudentInactive = scannedStudent?.status === 'inactive'

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="primary" size="sm">
              Kiosk &amp; Desk Station
            </Badge>
            <span className="text-xs text-slate-400">•</span>
            <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
              <Database className="h-3 w-3 text-slate-400" />
              Live Supabase Integration
            </span>
          </div>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Library Scanner
          </h2>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Enter or scan a student's college barcode to record live library entry and exit.
          </p>
        </div>
        <Badge variant={phase === 'scanning' ? 'warning' : 'success'} dot>
          {phase === 'scanning' ? 'Verifying barcode...' : 'Scanner ready'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          {/* Barcode Viewport & Input */}
          <ScannerViewport
            isScanning={phase === 'scanning'}
            manualCode={manualCode}
            onManualCodeChange={setManualCode}
            onManualSubmit={handleBarcodeSubmit}
            registeredStudents={registeredStudents}
            selectedStudentBarcode={selectedStudentBarcode}
            onSelectStudentBarcode={setSelectedStudentBarcode}
            mode={mode}
            onModeChange={(newMode) => {
              setMode(newMode)
              setErrorMessage('')
            }}
          />

          {/* Error Banner */}
          {errorMessage && <ErrorBanner message={errorMessage} />}

          {/* Verified Student Details Card */}
          {scannedStudent && (
            <ScanResultCard student={scannedStudent} isInside={isStudentInside} />
          )}

          {/* Active Session & Exit Option */}
          {isStudentInside && phase === 'verified' && !isStudentInactive && (
            <ActiveSessionCard
              student={scannedStudent!}
              seat={activeSession!.seat}
              entryTime={activeSession!.entryTime}
              isSubmitting={isSubmitting}
              onConfirmExit={handleConfirmExit}
            />
          )}

          {/* Seat Selection & Entry Option */}
          {!isStudentInside && phase === 'verified' && !isStudentInactive && (
            <SeatSelection
              seats={freeSeats}
              selectedSeat={selectedSeat}
              section={section}
              isSubmitting={isSubmitting}
              isLoadingSeats={isLoadingSeats}
              onSectionChange={setSection}
              onSelect={setSelectedSeat}
              onConfirm={handleConfirmEntry}
            />
          )}

          {/* Success Confirmation */}
          {phase === 'success' && successDetails && (
            <ScanSuccess {...successDetails} onScanAnother={resetFlow} />
          )}
        </div>

        <div className="lg:col-span-2">
          <RecentScans
            records={recentScans}
            isLoading={isLoadingScans}
            error={scansError}
            onRetry={loadRecentScans}
          />
        </div>
      </div>
    </div>
  )
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
      <span className="leading-relaxed">{message}</span>
    </div>
  )
}
