import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type {
  LibrarySession,
  LibrarySessionRow,
  LibrarySessionStatus,
  SeatRow,
  StudentRow,
} from '../types'

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
    studentName,
    department,
    seatNumber,
    section,
    entryTime: row.entry_time,
    exitTime: row.exit_time ?? undefined,
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
 * Formats Supabase database errors into user-friendly messages.
 */
function handleDatabaseError(
  error: { code?: string; message?: string; details?: string | null; hint?: string | null },
  defaultMessage: string
): Error {
  if (error.code === '42501') {
    return new Error(
      'Access denied. You do not have permission to perform this library action. Ensure you are signed in with an authorized library role.'
    )
  }
  return new Error(error.message || defaultMessage)
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
    throw handleDatabaseError(sessionsError, 'Failed to load library sessions from the database.')
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

    if (!studentsError && studentsData) {
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

    if (!seatsError && seatsData) {
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
