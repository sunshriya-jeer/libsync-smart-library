import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type {
  LibrarySeat,
  LibrarySession,
  LibrarySessionRow,
  LibrarySessionStatus,
  SeatRow,
  Student,
  StudentRow,
} from '../types'
import { mapRowToStudent } from './studentService'
import { mapRowToSeat } from './seatService'
import { formatIstDateTime } from '../utils/dateUtils'

/**
 * Normalizes database session status string into frontend LibrarySessionStatus.
 */
export function mapDatabaseStatusToSessionStatus(status: string): LibrarySessionStatus {
  const normalized = (status || '').toLowerCase().trim()
  if (normalized === 'active' || normalized === 'open' || normalized === 'ongoing') {
    return 'active'
  }
  return 'completed'
}

/**
 * Calculates duration in minutes between entry and exit time,
 * or elapsed minutes since entry if still active.
 */
export function calculateDurationMinutes(entryTime: string, exitTime?: string | null): number {
  const start = new Date(entryTime).getTime()
  if (isNaN(start)) return 0

  const end = exitTime ? new Date(exitTime).getTime() : Date.now()
  if (isNaN(end)) return 0

  return Math.max(0, Math.floor((end - start) / 60000))
}

/**
 * Extracts seat section ('A', 'B', 'C', 'D') from seat number or section string.
 */
export function extractSection(seatNumber?: string | null, section?: string | null): 'A' | 'B' | 'C' | 'D' {
  if (section) {
    const s = section.trim().toUpperCase()
    if (s === 'A' || s === 'B' || s === 'C' || s === 'D') return s
  }
  if (seatNumber) {
    const firstChar = seatNumber.trim().charAt(0).toUpperCase()
    if (firstChar === 'A' || firstChar === 'B' || firstChar === 'C' || firstChar === 'D') {
      return firstChar
    }
  }
  return 'A'
}

/**
 * Maps a database LibrarySessionRow and associated student and seat info
 * into the frontend LibrarySession interface.
 */
export function mapRowToLibrarySession(
  row: LibrarySessionRow,
  student?: StudentRow | null,
  seat?: SeatRow | null
): LibrarySession {
  const studentName = student?.full_name || 'Unknown Student'
  const studentId = student?.student_id || student?.id || '—'
  const department = student?.department || 'General'
  const seatNumber = seat?.seat_number || '—'
  const section = extractSection(seat?.seat_number, seat?.section)
  const status = mapDatabaseStatusToSessionStatus(row.status)
  const durationMinutes = calculateDurationMinutes(row.entry_time, row.exit_time)

  return {
    id: row.id,
    studentId,
    student_id: row.student_id,
    studentName,
    department,
    seatNumber,
    section,
    entryTime: row.entry_time,
    entry_time: row.entry_time,
    exitTime: row.exit_time ?? undefined,
    exit_time: row.exit_time,
    durationMinutes,
    status,
  }
}

/**
 * Verifies that a valid, real Supabase authenticated session exists.
 * Rejects mock sessions or unauthenticated access before database calls.
 */
async function getAuthenticatedSession(): Promise<Session> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (
    error ||
    !session ||
    !session.access_token ||
    session.access_token === 'mock-token' ||
    session.user?.id?.startsWith('mock-')
  ) {
    throw new Error('Authentication required. Please sign in with an authenticated library account.')
  }

  return session
}

/**
 * Formats Supabase database errors into user-friendly messages with diagnostic context.
 */
function handleDatabaseError(
  error: { code?: string; message?: string; details?: string | null; hint?: string | null },
  defaultMessage: string,
  tableContext?: string
): Error {
  const contextPrefix = tableContext ? `[${tableContext}] ` : ''
  const errorDetails = [
    error.message ? error.message : defaultMessage,
    error.code ? `(Supabase error ${error.code})` : '',
    error.details ? `Details: ${error.details}` : '',
    error.hint ? `Hint: ${error.hint}` : '',
  ]
    .filter(Boolean)
    .join(' ')

  if (error.code === '42501') {
    return new Error(
      `Access denied. You do not have permission to perform this library action. ${contextPrefix}${errorDetails}`
    )
  }
  return new Error(errorDetails ? `${contextPrefix}${errorDetails}` : defaultMessage)
}

/**
 * Fetch all library sessions from public.library_sessions using the authenticated session.
 * Enriches each session with student and seat information.
 */
export async function fetchLibrarySessions(): Promise<LibrarySession[]> {
  const session = await getAuthenticatedSession()

  // First, fetch library_sessions ordered by entry_time descending
  const { data: sessionRows, error: sessionsError } = await supabase
    .from('library_sessions')
    .select('*')
    .setHeader('Authorization', `Bearer ${session.access_token}`)
    .order('entry_time', { ascending: false })

  if (sessionsError) {
    console.error('[sessionService] Failed to load library_sessions:', sessionsError)
    throw handleDatabaseError(
      sessionsError,
      'Failed to load library sessions from the database.',
      'table: library_sessions'
    )
  }

  const rows = (sessionRows ?? []) as LibrarySessionRow[]
  if (rows.length === 0) {
    return []
  }

  // Collect unique student_ids and seat_ids to perform efficient batched lookup
  const studentIds = Array.from(new Set(rows.map((r) => r.student_id).filter(Boolean)))
  const seatIds = Array.from(new Set(rows.map((r) => r.seat_id).filter(Boolean)))

  const studentMap = new Map<string, StudentRow>()
  const seatMap = new Map<string, SeatRow>()

  // Batch query students - do not silently swallow lookup errors
  if (studentIds.length > 0) {
    const { data: studentsData, error: studentsError } = await supabase
      .from('students')
      .select('*')
      .in('id', studentIds)
      .setHeader('Authorization', `Bearer ${session.access_token}`)

    if (studentsError) {
      console.error('[sessionService] Failed to load students for sessions:', studentsError)
      throw handleDatabaseError(
        studentsError,
        'Failed to load associated student records for library sessions.',
        'table: students'
      )
    }

    if (studentsData) {
      for (const student of studentsData as StudentRow[]) {
        studentMap.set(student.id, student)
      }
    }
  }

  // Batch query seats - do not silently swallow lookup errors
  if (seatIds.length > 0) {
    const { data: seatsData, error: seatsError } = await supabase
      .from('seats')
      .select('*')
      .in('id', seatIds)
      .setHeader('Authorization', `Bearer ${session.access_token}`)

    if (seatsError) {
      console.error('[sessionService] Failed to load seats for sessions:', seatsError)
      throw handleDatabaseError(
        seatsError,
        'Failed to load associated seat records for library sessions.',
        'table: seats'
      )
    }

    if (seatsData) {
      for (const seat of seatsData as SeatRow[]) {
        seatMap.set(seat.id, seat)
      }
    }
  }

  return rows.map((row) => {
    const student = studentMap.get(row.student_id) || row.students || null
    const seat = seatMap.get(row.seat_id) || row.seats || null
    return mapRowToLibrarySession(row, student, seat)
  })
}

/**
 * Searches public.students by college_barcode.
 * Returns mapped Student if found, or null if no matching barcode exists.
 */
export async function findStudentByCollegeBarcode(barcode: string): Promise<Student | null> {
  const trimmed = barcode.trim()
  if (!trimmed) {
    throw new Error('Please enter a valid college barcode.')
  }

  const session = await getAuthenticatedSession()

  const { data, error } = await supabase
    .from('students')
    .select('*')
    .setHeader('Authorization', `Bearer ${session.access_token}`)
    .eq('college_barcode', trimmed)
    .maybeSingle()

  if (error) {
    throw handleDatabaseError(error, 'Failed to search for student by college barcode.')
  }

  if (!data) {
    return null
  }

  return mapRowToStudent(data as StudentRow)
}

/**
 * Checks whether a student currently has an active session in public.library_sessions.
 * If found, returns the session and occupied seat details.
 */
export async function getActiveSessionForStudent(
  studentId: string
): Promise<{ session: LibrarySession; rawSession: LibrarySessionRow; seat: LibrarySeat } | null> {
  const session = await getAuthenticatedSession()

  const { data: sessionRow, error: sessionError } = await supabase
    .from('library_sessions')
    .select('*')
    .setHeader('Authorization', `Bearer ${session.access_token}`)
    .eq('student_id', studentId)
    .is('exit_time', null)
    .order('entry_time', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (sessionError) {
    throw handleDatabaseError(sessionError, 'Failed to verify active student library session.')
  }

  if (!sessionRow) {
    return null
  }

  const rawSession = sessionRow as LibrarySessionRow

  // Fetch associated seat details
  const { data: seatData, error: seatError } = await supabase
    .from('seats')
    .select('*')
    .setHeader('Authorization', `Bearer ${session.access_token}`)
    .eq('id', rawSession.seat_id)
    .maybeSingle()

  if (seatError || !seatData) {
    throw handleDatabaseError(seatError || {}, 'Failed to retrieve active session seat information.')
  }

  // Fetch student info
  const { data: studentData } = await supabase
    .from('students')
    .select('*')
    .setHeader('Authorization', `Bearer ${session.access_token}`)
    .eq('id', studentId)
    .maybeSingle()

  const mappedSeat = mapRowToSeat(seatData as SeatRow)
  const mappedSession = mapRowToLibrarySession(
    rawSession,
    (studentData as StudentRow) || null,
    seatData as SeatRow
  )

  return {
    session: mappedSession,
    rawSession,
    seat: mappedSeat,
  }
}

/**
 * Creates a new active library session for a student in a free seat.
 * Re-checks student active session state and seat availability before inserting.
 */
export async function createLibraryEntrySession(
  studentId: string,
  seatId: string,
  reservationId?: string
): Promise<{ session: LibrarySession; seat: LibrarySeat }> {
  const session = await getAuthenticatedSession()

  // Concurrency & Safety check 1: Student has no active session
  const { data: activeExisting, error: activeCheckError } = await supabase
    .from('library_sessions')
    .select('id')
    .setHeader('Authorization', `Bearer ${session.access_token}`)
    .eq('student_id', studentId)
    .eq('status', 'active')
    .maybeSingle()

  if (activeCheckError) {
    throw handleDatabaseError(activeCheckError, 'Failed to verify existing session state.')
  }

  if (activeExisting) {
    throw new Error('This student already has an active library session and is currently inside.')
  }

  // Concurrency & Safety check 2: Selected seat is free (or reserved for this student)
  const { data: seatCheck, error: seatCheckError } = await supabase
    .from('seats')
    .select('*')
    .setHeader('Authorization', `Bearer ${session.access_token}`)
    .eq('id', seatId)
    .maybeSingle()

  if (seatCheckError || !seatCheck) {
    throw handleDatabaseError(seatCheckError || {}, 'Failed to verify seat status before entry creation.')
  }

  const isSeatValid = reservationId
    ? seatCheck.status === 'free' || seatCheck.status === 'reserved'
    : seatCheck.status === 'free'

  if (!isSeatValid) {
    throw new Error(
      `Seat ${seatCheck.seat_number} is no longer available (status: ${seatCheck.status}). Please select another seat.`
    )
  }

  const now = new Date().toISOString()

  // Step 1: Create row in public.library_sessions
  const { data: insertedSession, error: insertError } = await supabase
    .from('library_sessions')
    .insert({
      student_id: studentId,
      seat_id: seatId,
      entry_time: now,
      exit_time: null,
      status: 'active',
    })
    .setHeader('Authorization', `Bearer ${session.access_token}`)
    .select()
    .single()

  if (insertError || !insertedSession) {
    throw handleDatabaseError(insertError || {}, 'Failed to record entry session.')
  }

  // Step 2: Update selected seat in public.seats to 'occupied'
  const { data: updatedSeat, error: seatUpdateError } = await supabase
    .from('seats')
    .update({
      status: 'occupied',
      updated_at: now,
    })
    .setHeader('Authorization', `Bearer ${session.access_token}`)
    .eq('id', seatId)
    .select()
    .single()

  if (seatUpdateError || !updatedSeat) {
    // Attempt rollback of created session if seat update fails
    await supabase
      .from('library_sessions')
      .delete()
      .setHeader('Authorization', `Bearer ${session.access_token}`)
      .eq('id', insertedSession.id)

    throw handleDatabaseError(seatUpdateError || {}, 'Failed to update seat status to occupied.')
  }

  // Step 3: Fulfill reservation if entry was from an active reservation
  if (reservationId) {
    try {
      await supabase
        .from('library_reservations')
        .update({
          status: 'fulfilled',
          fulfilled_at: now,
        })
        .setHeader('Authorization', `Bearer ${session.access_token}`)
        .eq('id', reservationId)
    } catch (resFulfillErr) {
      console.warn('[sessionService] Failed to mark reservation fulfilled:', resFulfillErr)
    }
  }

  // Enrich with student details
  const { data: studentData } = await supabase
    .from('students')
    .select('*')
    .setHeader('Authorization', `Bearer ${session.access_token}`)
    .eq('id', studentId)
    .maybeSingle()

  const mappedSeat = mapRowToSeat(updatedSeat as SeatRow)
  const mappedSession = mapRowToLibrarySession(
    insertedSession as LibrarySessionRow,
    (studentData as StudentRow) || null,
    updatedSeat as SeatRow
  )

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('libsync:session-change'))
  }

  return {
    session: mappedSession,
    seat: mappedSeat,
  }
}

/**
 * Completes an active library session: sets exit_time and status = 'completed' in public.library_sessions,
 * and resets the occupied seat to status = 'free' in public.seats.
 */
export async function completeLibraryExitSession(
  sessionId: string,
  seatId: string
): Promise<{ session: LibrarySession; seat: LibrarySeat; durationMinutes: number }> {
  const session = await getAuthenticatedSession()

  // Re-verify session is currently active
  const { data: currentSessionRow, error: checkError } = await supabase
    .from('library_sessions')
    .select('*')
    .setHeader('Authorization', `Bearer ${session.access_token}`)
    .eq('id', sessionId)
    .maybeSingle()

  if (checkError || !currentSessionRow) {
    throw handleDatabaseError(checkError || {}, 'Active library session not found.')
  }

  if (currentSessionRow.status !== 'active') {
    throw new Error('This library session has already been completed.')
  }

  const exitTime = new Date().toISOString()
  const durationMinutes = calculateDurationMinutes(currentSessionRow.entry_time, exitTime)

  // Step 1: Update public.library_sessions
  const { data: updatedSessionRow, error: sessionUpdateError } = await supabase
    .from('library_sessions')
    .update({
      exit_time: exitTime,
      status: 'completed',
      updated_at: exitTime,
    })
    .setHeader('Authorization', `Bearer ${session.access_token}`)
    .eq('id', sessionId)
    .select()
    .single()

  if (sessionUpdateError || !updatedSessionRow) {
    throw handleDatabaseError(sessionUpdateError || {}, 'Failed to record session exit in database.')
  }

  // Step 2: Update occupied seat to 'free' in public.seats
  const { data: updatedSeatRow, error: seatUpdateError } = await supabase
    .from('seats')
    .update({
      status: 'free',
      updated_at: exitTime,
    })
    .setHeader('Authorization', `Bearer ${session.access_token}`)
    .eq('id', seatId)
    .select()
    .single()

  if (seatUpdateError || !updatedSeatRow) {
    throw handleDatabaseError(seatUpdateError || {}, 'Failed to mark seat as free in database.')
  }

  // Fetch student info
  const { data: studentData } = await supabase
    .from('students')
    .select('*')
    .setHeader('Authorization', `Bearer ${session.access_token}`)
    .eq('id', currentSessionRow.student_id)
    .maybeSingle()

  const mappedSeat = mapRowToSeat(updatedSeatRow as SeatRow)
  const mappedSession = mapRowToLibrarySession(
    updatedSessionRow as LibrarySessionRow,
    (studentData as StudentRow) || null,
    updatedSeatRow as SeatRow
  )

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('libsync:session-change'))
  }

  return {
    session: mappedSession,
    seat: mappedSeat,
    durationMinutes,
  }
}

export interface RecentScanRecord {
  id: string
  sessionId: string
  studentName: string
  studentId: string
  collegeBarcode: string | null
  seatNumber: string
  action: 'entry' | 'exit'
  activityTime: string
  formattedTime: string
}

/**
 * Formats an ISO date/time string into user-friendly scanner timestamp in IST (e.g. '15 Sep 2026, 6:42 PM').
 */
export function formatScanTimestamp(isoString?: string | null): string {
  if (!isoString) return 'Just now'
  return formatIstDateTime(isoString)
}

/**
 * Fetches recent library activity records from public.library_sessions,
 * enriched with student and seat information.
 * - Completed sessions are labeled 'exit' using exit_time.
 * - Active sessions are labeled 'entry' using entry_time.
 * - Ordered by most recent activity first.
 */
export async function fetchRecentScans(limit = 10): Promise<RecentScanRecord[]> {
  const session = await getAuthenticatedSession()

  // Fetch recent sessions from public.library_sessions
  const fetchLimit = Math.max(limit * 2, 20)
  const { data: sessionRows, error: sessionsError } = await supabase
    .from('library_sessions')
    .select('*')
    .setHeader('Authorization', `Bearer ${session.access_token}`)
    .order('entry_time', { ascending: false })
    .limit(fetchLimit)

  if (sessionsError) {
    console.error('[sessionService] Failed to load recent library_sessions:', sessionsError)
    throw handleDatabaseError(
      sessionsError,
      'Failed to load recent scans from the database.',
      'table: library_sessions'
    )
  }

  const rows = (sessionRows ?? []) as LibrarySessionRow[]
  if (rows.length === 0) {
    return []
  }

  // Collect unique student_ids and seat_ids to perform efficient batched lookup
  const studentIds = Array.from(new Set(rows.map((r) => r.student_id).filter(Boolean)))
  const seatIds = Array.from(new Set(rows.map((r) => r.seat_id).filter(Boolean)))

  const studentMap = new Map<string, StudentRow>()
  const seatMap = new Map<string, SeatRow>()

  // Batch query students
  if (studentIds.length > 0) {
    const { data: studentsData, error: studentsError } = await supabase
      .from('students')
      .select('*')
      .in('id', studentIds)
      .setHeader('Authorization', `Bearer ${session.access_token}`)

    if (studentsError) {
      console.error('[sessionService] Failed to load students for recent scans:', studentsError)
      throw handleDatabaseError(
        studentsError,
        'Failed to load student details for recent scans.',
        'table: students'
      )
    }

    if (studentsData) {
      for (const student of studentsData as StudentRow[]) {
        studentMap.set(student.id, student)
      }
    }
  }

  // Batch query seats
  if (seatIds.length > 0) {
    const { data: seatsData, error: seatsError } = await supabase
      .from('seats')
      .select('*')
      .in('id', seatIds)
      .setHeader('Authorization', `Bearer ${session.access_token}`)

    if (seatsError) {
      console.error('[sessionService] Failed to load seats for recent scans:', seatsError)
      throw handleDatabaseError(
        seatsError,
        'Failed to load seat details for recent scans.',
        'table: seats'
      )
    }

    if (seatsData) {
      for (const seat of seatsData as SeatRow[]) {
        seatMap.set(seat.id, seat)
      }
    }
  }

  // Map to RecentScanRecord items
  const mappedRecords: RecentScanRecord[] = rows.map((row) => {
    const student = studentMap.get(row.student_id)
    const seat = seatMap.get(row.seat_id)
    const isCompleted = row.status === 'completed' || Boolean(row.exit_time)
    const action: 'entry' | 'exit' = isCompleted ? 'exit' : 'entry'
    const activityTime = isCompleted && row.exit_time ? row.exit_time : row.entry_time

    return {
      id: row.id,
      sessionId: row.id,
      studentName: student?.full_name || 'Unknown Student',
      studentId: student?.student_id || student?.id || '—',
      collegeBarcode: student?.college_barcode ?? null,
      seatNumber: seat?.seat_number || '—',
      action,
      activityTime,
      formattedTime: formatScanTimestamp(activityTime),
    }
  })

  // Sort by activity time descending (most recent first)
  mappedRecords.sort((a, b) => {
    const timeA = new Date(a.activityTime).getTime()
    const timeB = new Date(b.activityTime).getTime()
    return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA)
  })

  return mappedRecords.slice(0, limit)
}

/**
 * Fetches library sessions for a specific student from public.library_sessions,
 * enriched with associated seat information from public.seats.
 * Ordered by entry_time descending.
 */
export async function fetchStudentSessions(
  studentId: string,
  limit?: number
): Promise<LibrarySession[]> {
  const session = await getAuthenticatedSession()

  let query = supabase
    .from('library_sessions')
    .select('*')
    .setHeader('Authorization', `Bearer ${session.access_token}`)
    .eq('student_id', studentId)
    .order('entry_time', { ascending: false })

  if (typeof limit === 'number' && limit > 0) {
    query = query.limit(limit)
  }

  const { data: sessionRows, error: sessionsError } = await query

  if (sessionsError) {
    console.error('[sessionService] Failed to load student sessions:', sessionsError)
    throw handleDatabaseError(
      sessionsError,
      'Failed to load student library sessions from the database.',
      'table: library_sessions'
    )
  }

  const rows = (sessionRows ?? []) as LibrarySessionRow[]
  if (rows.length === 0) {
    return []
  }

  const seatIds = Array.from(new Set(rows.map((r) => r.seat_id).filter(Boolean)))
  const seatMap = new Map<string, SeatRow>()

  if (seatIds.length > 0) {
    const { data: seatsData, error: seatsError } = await supabase
      .from('seats')
      .select('*')
      .in('id', seatIds)
      .setHeader('Authorization', `Bearer ${session.access_token}`)

    if (seatsError) {
      console.error('[sessionService] Failed to load seats for student sessions:', seatsError)
    } else if (seatsData) {
      for (const seat of seatsData as SeatRow[]) {
        seatMap.set(seat.id, seat)
      }
    }
  }

  return rows.map((row) => {
    const seat = seatMap.get(row.seat_id) || row.seats || null
    return mapRowToLibrarySession(row, null, seat)
  })
}

export interface StudentVisitInfo {
  currentSeat: string | null
  lastVisit: string | null
  latestSession?: LibrarySession | null
  activeSession?: LibrarySession | null
}

/**
 * Fetches real library visit information for a student from public.library_sessions and public.seats:
 * - latestSession: the most recent session ordered by entry_time DESC (used for lastVisit)
 * - activeSession: the current session where exit_time IS NULL (used for currentSeat)
 */
export async function fetchStudentVisitInfo(studentId: string): Promise<StudentVisitInfo> {
  const [activeData, recentSessions] = await Promise.all([
    getActiveSessionForStudent(studentId),
    fetchStudentSessions(studentId, 1),
  ])

  const latestSession = recentSessions.length > 0 ? recentSessions[0] : null
  const lastVisit = latestSession?.entryTime ? formatIstDateTime(latestSession.entryTime) : null
  const currentSeat = activeData?.seat?.seatNumber || null

  return {
    currentSeat,
    lastVisit,
    latestSession,
    activeSession: activeData?.session || null,
  }
}

export interface ActiveSessionInfo {
  count: number
  uniqueStudentCount: number
  studentIds: string[]
  sessions: {
    id: string
    studentId: string
    seatId: string
    entryTime: string
  }[]
}

/**
 * Fetches real active library sessions from public.library_sessions
 * where student_id IS NOT NULL AND exit_time IS NULL.
 * Returns the count of unique students currently inside.
 */
export async function fetchActiveSessions(): Promise<ActiveSessionInfo> {
  const session = await getAuthenticatedSession()

  const { data, error } = await supabase
    .from('library_sessions')
    .select('id, student_id, seat_id, entry_time, exit_time')
    .setHeader('Authorization', `Bearer ${session.access_token}`)
    .is('exit_time', null)
    .not('student_id', 'is', null)

  if (error) {
    console.error('[sessionService] Failed to load active sessions:', error)
    throw handleDatabaseError(error, 'Failed to load active library sessions.', 'table: library_sessions')
  }

  const rows = (data ?? []) as {
    id: string
    student_id: string
    seat_id: string
    entry_time: string
    exit_time: string | null
  }[]

  const uniqueStudentIds = Array.from(new Set(rows.map((r) => r.student_id).filter(Boolean)))

  return {
    count: rows.length,
    uniqueStudentCount: uniqueStudentIds.length,
    studentIds: uniqueStudentIds,
    sessions: rows.map((r) => ({
      id: r.id,
      studentId: r.student_id,
      seatId: r.seat_id,
      entryTime: r.entry_time,
    })),
  }
}



