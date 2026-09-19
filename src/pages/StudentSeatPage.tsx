import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Armchair,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  Wifi,
  VolumeX,
  RefreshCw,
  LoaderCircle,
  X,
  Check,
  Timer,
  Info,
} from 'lucide-react'
import { fetchCurrentStudent } from '../services/studentService'
import { fetchSeats } from '../services/seatService'
import { getActiveSessionForStudent, calculateDurationMinutes } from '../services/sessionService'
import {
  fetchActiveStudentReservation,
  createStudentReservation,
  cancelStudentReservation,
  expireReservation,
} from '../services/reservationService'
import type { Student, LibrarySeat, LibrarySession, LibraryReservation } from '../types'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'

const SECTION_DETAILS: Record<string, { name: string; floor: string; noise: string }> = {
  A: { name: 'General Reading Room', floor: 'Floor 1', noise: 'Whisper Only' },
  B: { name: 'Silent Study Wing', floor: 'Floor 2', noise: 'Strict Silence' },
  C: { name: 'Tech & Laptop Hub', floor: 'Floor 2', noise: 'Laptops & Devices' },
  D: { name: 'Collaborative Area', floor: 'Floor 3', noise: 'Group Discussion' },
}

function formatDuration(minutes: number): string {
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hrs === 0) return `${mins}m`
  return `${hrs}h ${mins}m`
}

function formatCountdown(targetDateIso: string): { text: string; isExpired: boolean } {
  const target = new Date(targetDateIso).getTime()
  const diff = target - Date.now()
  if (diff <= 0) {
    return { text: '00:00 (Expired)', isExpired: true }
  }
  const totalSeconds = Math.floor(diff / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  return {
    text: `${pad(minutes)}:${pad(seconds)}`,
    isExpired: false,
  }
}

export function StudentSeatPage() {
  const [student, setStudent] = useState<Student | null>(null)
  const [seats, setSeats] = useState<LibrarySeat[]>([])
  const [activeSessionInfo, setActiveSessionInfo] = useState<{
    session: LibrarySession
    seat: LibrarySeat
  } | null>(null)
  const [activeReservation, setActiveReservation] = useState<LibraryReservation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [conflictMessage, setConflictMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Selection & Modal State
  const [selectedSeat, setSelectedSeat] = useState<LibrarySeat | null>(null)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [isSubmittingReservation, setIsSubmittingReservation] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<'all' | 'A' | 'B' | 'C' | 'D'>('all')

  // Timer Tick for live countdown
  const [, setCountdownTick] = useState(0)

  // Initial load
  useEffect(() => {
    let isMounted = true

    const loadInitialData = async () => {
      try {
        const studentData = await fetchCurrentStudent()
        if (!isMounted) return
        setStudent(studentData)

        if (studentData?.id) {
          const [seatsData, sessionData, reservationData] = await Promise.all([
            fetchSeats(),
            getActiveSessionForStudent(studentData.id),
            fetchActiveStudentReservation(studentData.id),
          ])
          if (!isMounted) return
          setSeats(seatsData)
          setActiveSessionInfo(sessionData)
          setActiveReservation(reservationData)
        } else {
          const seatsData = await fetchSeats()
          if (!isMounted) return
          setSeats(seatsData)
        }
      } catch (err: unknown) {
        if (!isMounted) return
        console.error('[StudentSeatPage] Failed to load seat data:', err)
        setErrorMessage(
          err instanceof Error ? err.message : 'Failed to load library seats. Please try again.'
        )
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadInitialData()

    return () => {
      isMounted = false
    }
  }, [])

  // Refreshes data after user actions (reserve, cancel, expire)
  const refreshAllData = async () => {
    try {
      const studentData = await fetchCurrentStudent()
      setStudent(studentData)

      if (studentData?.id) {
        const [seatsData, sessionData, reservationData] = await Promise.all([
          fetchSeats(),
          getActiveSessionForStudent(studentData.id),
          fetchActiveStudentReservation(studentData.id),
        ])
        setSeats(seatsData)
        setActiveSessionInfo(sessionData)
        setActiveReservation(reservationData)
      } else {
        const seatsData = await fetchSeats()
        setSeats(seatsData)
      }
    } catch (err: unknown) {
      console.error('[StudentSeatPage] Failed to refresh data:', err)
    }
  }

  // Handle client countdown & auto-expiration
  useEffect(() => {
    if (!activeReservation) return

    const interval = setInterval(() => {
      const { isExpired } = formatCountdown(activeReservation.expiresAt)
      if (isExpired) {
        // Automatically expire reservation on the client and notify student
        const resId = activeReservation.id
        const seatId = activeReservation.seatId
        setActiveReservation(null)
        setConflictMessage(
          `Your reservation for Seat ${activeReservation.seatNumber} has reached its 30-minute limit and expired.`
        )
        void expireReservation(resId, seatId).then(() => {
          void refreshAllData()
        })
      } else {
        setCountdownTick((t) => t + 1)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [activeReservation])

  // Seat Click Handler
  const handleSeatClick = (seat: LibrarySeat) => {
    if (activeSessionInfo) {
      setConflictMessage(
        'You are currently inside the library with an active session. Seat reservations are only available when outside.'
      )
      return
    }

    if (activeReservation) {
      setConflictMessage(
        `You already hold an active reservation for Seat ${activeReservation.seatNumber}. Please cancel it first if you wish to reserve a different seat.`
      )
      return
    }

    if (seat.status !== 'free') {
      return
    }

    setConflictMessage(null)
    setSuccessMessage(null)
    setSelectedSeat(seat)
    setIsConfirmModalOpen(true)
  }

  // Confirm Reservation Submission
  const handleConfirmReservation = async () => {
    if (!student?.id || !selectedSeat) return

    setIsSubmittingReservation(true)
    setConflictMessage(null)
    setSuccessMessage(null)

    try {
      const newReservation = await createStudentReservation(student.id, selectedSeat.id)
      setActiveReservation(newReservation)
      setIsConfirmModalOpen(false)
      setSelectedSeat(null)
      setSuccessMessage(
        `Seat ${selectedSeat.seatNumber} reserved successfully! You have 30 minutes to scan your pass at the entrance.`
      )
      // Refresh real seats
      await refreshAllData()
    } catch (err: unknown) {
      console.error('[StudentSeatPage] Reservation failed:', err)
      setIsConfirmModalOpen(false)
      setConflictMessage(
        err instanceof Error
          ? err.message
          : 'Unable to reserve this seat. Another student may have just claimed it. Please try another seat.'
      )
      // Refresh seat map to reflect newest database status
      await refreshAllData()
    } finally {
      setIsSubmittingReservation(false)
    }
  }

  // Cancel Reservation Action
  const handleCancelReservation = async () => {
    if (!student?.id || !activeReservation) return

    setIsCancelling(true)
    setConflictMessage(null)
    setSuccessMessage(null)

    try {
      await cancelStudentReservation(
        activeReservation.id,
        student.id,
        activeReservation.seatId
      )
      setActiveReservation(null)
      setSuccessMessage('Your reservation has been cancelled. The seat is now available for others.')
      await refreshAllData()
    } catch (err: unknown) {
      console.error('[StudentSeatPage] Cancel reservation failed:', err)
      setConflictMessage(
        err instanceof Error ? err.message : 'Failed to cancel reservation. Please try again.'
      )
    } finally {
      setIsCancelling(false)
    }
  }

  // Summary Counts from real seats
  const totalSeats = seats.length
  const availableSeats = seats.filter((s) => s.status === 'free').length
  const occupiedSeats = seats.filter((s) => s.status === 'occupied').length
  const reservedSeats = seats.filter((s) => s.status === 'reserved').length

  // Filtered Seats
  const filteredSeats =
    selectedSectionFilter === 'all'
      ? seats
      : seats.filter((s) => s.section === selectedSectionFilter)

  // Sections for grid view
  const sectionsToDisplay: ('A' | 'B' | 'C' | 'D')[] =
    selectedSectionFilter === 'all' ? ['A', 'B', 'C', 'D'] : [selectedSectionFilter]

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <LoaderCircle className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
        <p className="text-sm font-medium text-slate-600">Loading seat map &amp; reservations...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Badge variant="primary" size="sm">
            Seat Reservation
          </Badge>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-500 font-medium">Floor 1-3</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Reserve a Seat</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Select an available seat to hold for 30 minutes before checking in at the entrance kiosk.
        </p>
      </div>

      {/* Database Error Banner */}
      {errorMessage && (
        <Card className="border-rose-200 bg-rose-50/70">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-xs text-rose-800 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setErrorMessage(null)
                setIsLoading(true)
                void refreshAllData().finally(() => setIsLoading(false))
              }}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Conflict / Expiration Notification */}
      {conflictMessage && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Notice</p>
            <p className="mt-0.5">{conflictMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setConflictMessage(null)}
            className="text-amber-500 hover:text-amber-700"
            aria-label="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Success Notification */}
      {successMessage && (
        <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Success</p>
            <p className="mt-0.5">{successMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-500 hover:text-emerald-700"
            aria-label="Dismiss message"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Current Active Session Card (If student is already inside) */}
      {activeSessionInfo && (
        <Card className="border-indigo-200 bg-indigo-50/40 shadow-xs">
          <CardHeader
            title="Current Active Assignment"
            subtitle="You are currently inside the library"
            action={
              <Badge variant="success" dot size="sm">
                Occupied by You
              </Badge>
            }
          />
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-indigo-100 shadow-2xs">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Armchair className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider">
                    Assigned Seat
                  </p>
                  <h3 className="text-xl font-bold text-slate-900">
                    Seat {activeSessionInfo.seat.seatNumber}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Section {activeSessionInfo.seat.section} •{' '}
                    {SECTION_DETAILS[activeSessionInfo.seat.section]?.name || 'Study Zone'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div>
                  <p className="text-slate-400 text-[10px] uppercase font-semibold">Check-in Time</p>
                  <p className="font-bold text-slate-800">
                    {new Date(activeSessionInfo.session.entryTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] uppercase font-semibold">Duration</p>
                  <p className="font-bold text-indigo-600">
                    {formatDuration(
                      calculateDurationMinutes(activeSessionInfo.session.entryTime)
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Info className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>
                You already have an assigned seat. Seat reservations are only needed when you are
                outside the library.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Reservation Card (If student holds an unfulfilled reservation) */}
      {!activeSessionInfo && activeReservation && (
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 shadow-xs">
          <CardHeader
            title="Your Active Seat Reservation"
            subtitle="Seat held exclusively for you"
            action={
              <Badge variant="warning" dot size="sm">
                Reserved (Pending Entry)
              </Badge>
            }
          />
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-amber-200 shadow-2xs">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <Armchair className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
                    Reserved Seat
                  </p>
                  <h3 className="text-xl font-bold text-slate-900">
                    Seat {activeReservation.seatNumber}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Section {activeReservation.section} •{' '}
                    {SECTION_DETAILS[activeReservation.section || 'A']?.name || 'Study Wing'}
                  </p>
                </div>
              </div>

              {/* Countdown Timer */}
              <div className="flex items-center gap-3 bg-amber-50 border border-amber-200/80 rounded-xl px-4 py-2.5">
                <Timer className="w-5 h-5 text-amber-600 animate-pulse" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">
                    Time Remaining
                  </p>
                  <p className="text-base font-mono font-bold text-slate-900">
                    {formatCountdown(activeReservation.expiresAt).text}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1">
              <div className="flex items-center gap-2 text-slate-600">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  Head to the entrance kiosk and scan your QR pass before expiration to complete check-in.
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link to="/student/scan">
                  <Button variant="primary" size="sm">
                    Show QR Pass
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelReservation}
                  disabled={isCancelling}
                  icon={
                    isCancelling ? (
                      <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
                    ) : undefined
                  }
                >
                  {isCancelling ? 'Cancelling...' : 'Cancel Reservation'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seat Availability Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Total Seats
          </p>
          <p className="text-xl font-bold text-slate-900 mt-1">{totalSeats}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Across all zones</p>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
          <p className="text-[11px] font-medium text-emerald-800 uppercase tracking-wider">
            Available
          </p>
          <p className="text-xl font-bold text-emerald-700 mt-1">{availableSeats}</p>
          <p className="text-[10px] text-emerald-600 mt-0.5">Free to reserve</p>
        </div>

        <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200">
          <p className="text-[11px] font-medium text-indigo-800 uppercase tracking-wider">
            Occupied
          </p>
          <p className="text-xl font-bold text-indigo-700 mt-1">{occupiedSeats}</p>
          <p className="text-[10px] text-indigo-600 mt-0.5">Active sessions</p>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
          <p className="text-[11px] font-medium text-amber-800 uppercase tracking-wider">
            Reserved
          </p>
          <p className="text-xl font-bold text-amber-700 mt-1">{reservedSeats}</p>
          <p className="text-[10px] text-amber-600 mt-0.5">Holding for check-in</p>
        </div>
      </div>

      {/* Interactive Seat Map */}
      <Card>
        <CardHeader
          title="Interactive Seat Map"
          subtitle="Click any available seat to reserve"
          action={
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Free
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600" /> Occupied
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" /> Reserved
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> Maintenance
              </span>
            </div>
          }
        />
        <CardContent className="space-y-6">
          {/* Section Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200/80 w-fit">
            {(['all', 'A', 'B', 'C', 'D'] as const).map((sec) => {
              const label = sec === 'all' ? 'All Sections' : `Section ${sec}`
              const count =
                sec === 'all'
                  ? seats.length
                  : seats.filter((s) => s.section === sec).length
              return (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setSelectedSectionFilter(sec)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedSectionFilter === sec
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {label} <span className="text-[10px] text-slate-400 font-normal">({count})</span>
                </button>
              )
            })}
          </div>

          {/* Section Groupings */}
          {sectionsToDisplay.map((sec) => {
            const sectionSeats = filteredSeats.filter((seat) => seat.section === sec)
            if (!sectionSeats.length) return null

            const info = SECTION_DETAILS[sec]
            const freeCount = sectionSeats.filter((s) => s.status === 'free').length

            return (
              <div key={sec} className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs flex items-center justify-center">
                      {sec}
                    </span>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        {info?.name || `Section ${sec}`}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {info?.floor} • {info?.noise}
                      </p>
                    </div>
                  </div>
                  <Badge variant={freeCount > 0 ? 'success' : 'default'} size="sm">
                    {freeCount} free
                  </Badge>
                </div>

                {/* Seat Cards Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                  {sectionSeats.map((seat) => {
                    const isSeatSelected = selectedSeat?.id === seat.id
                    const isMyReservation = activeReservation?.seatId === seat.id
                    const isMyActiveSeat = activeSessionInfo?.seat.id === seat.id
                    const isSelectable =
                      seat.status === 'free' && !activeSessionInfo && !activeReservation

                    let statusLabel = 'Free'
                    let cardStyles =
                      'border-emerald-200 bg-emerald-50/70 text-emerald-800 hover:border-emerald-400 hover:bg-emerald-100 hover:shadow-xs cursor-pointer'

                    if (isMyActiveSeat) {
                      statusLabel = 'Your Seat'
                      cardStyles =
                        'border-indigo-600 bg-indigo-600 text-white shadow-xs cursor-default ring-2 ring-indigo-300'
                    } else if (isMyReservation) {
                      statusLabel = 'Your Hold'
                      cardStyles =
                        'border-amber-500 bg-amber-500 text-white shadow-xs cursor-default ring-2 ring-amber-300'
                    } else if (seat.status === 'occupied') {
                      statusLabel = 'Occupied'
                      cardStyles =
                        'border-slate-200 bg-slate-100/90 text-slate-400 cursor-not-allowed opacity-80'
                    } else if (seat.status === 'reserved') {
                      statusLabel = 'Reserved'
                      cardStyles =
                        'border-amber-200 bg-amber-50 text-amber-700 cursor-not-allowed opacity-80'
                    } else if (seat.status === 'maintenance') {
                      statusLabel = 'Maintenance'
                      cardStyles =
                        'border-rose-200 bg-rose-50 text-rose-700 cursor-not-allowed opacity-80'
                    }

                    if (isSeatSelected) {
                      cardStyles =
                        'border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-500 shadow-md scale-102 cursor-pointer'
                    }

                    return (
                      <button
                        key={seat.id}
                        type="button"
                        onClick={() => handleSeatClick(seat)}
                        disabled={!isSelectable && !isSeatSelected}
                        aria-label={`Seat ${seat.seatNumber}, ${statusLabel}`}
                        className={`flex min-h-20 flex-col items-center justify-center gap-1 rounded-xl border p-2 text-center transition-all ${cardStyles}`}
                      >
                        <Armchair className="h-4 w-4" />
                        <span className="font-mono text-xs font-bold tracking-tight">
                          {seat.seatNumber}
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider">
                          {statusLabel}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {!filteredSeats.length && (
            <div className="py-12 text-center text-slate-500 text-xs">
              No seats found for the selected section.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      {isConfirmModalOpen && selectedSeat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-reservation-title"
            className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50/70 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                  Confirm Reservation
                </p>
                <h2
                  id="confirm-reservation-title"
                  className="mt-1 font-mono text-xl font-bold tracking-tight text-slate-900"
                >
                  Seat {selectedSeat.seatNumber}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Section {selectedSeat.section} •{' '}
                  {SECTION_DETAILS[selectedSeat.section]?.name || 'Library Study Area'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsConfirmModalOpen(false)
                  setSelectedSeat(null)
                }}
                disabled={isSubmittingReservation}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs">
                <span className="font-semibold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Status: Available
                </span>
                <span className="text-emerald-700 font-medium">Ready to Hold</span>
              </div>

              {/* Seat Amenities */}
              <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600">
                <span className="flex items-center gap-1 p-2 rounded-lg bg-slate-50 border border-slate-200/60">
                  <Zap className="w-3.5 h-3.5 text-amber-500" /> Power
                </span>
                <span className="flex items-center gap-1 p-2 rounded-lg bg-slate-50 border border-slate-200/60">
                  <Wifi className="w-3.5 h-3.5 text-indigo-500" /> Wi-Fi 6
                </span>
                <span className="flex items-center gap-1 p-2 rounded-lg bg-slate-50 border border-slate-200/60">
                  <VolumeX className="w-3.5 h-3.5 text-slate-500" /> Quiet
                </span>
              </div>

              {/* Reservation Policy Note */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Timer className="w-3.5 h-3.5 text-indigo-600" /> 30-Minute Hold Policy
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  This seat will be held exclusively for you for <strong>30 minutes</strong>. If
                  you do not scan your digital pass at the entrance kiosk within this time, the
                  reservation will automatically expire and release the seat.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 p-5 bg-slate-50/40">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsConfirmModalOpen(false)
                  setSelectedSeat(null)
                }}
                disabled={isSubmittingReservation}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleConfirmReservation}
                disabled={isSubmittingReservation}
                icon={
                  isSubmittingReservation ? (
                    <LoaderCircle className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )
                }
              >
                {isSubmittingReservation ? 'Reserving...' : 'Confirm Reservation'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

