import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type {
  LibraryReservation,
  LibraryReservationRow,
  SeatRow,
} from '../types'
import { extractSection } from './sessionService'

/**
 * Verifies that a valid, real Supabase authenticated session exists.
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
 * Maps a database LibraryReservationRow and associated SeatRow to LibraryReservation.
 */
export function mapRowToReservation(
  row: LibraryReservationRow,
  seat?: SeatRow | null
): LibraryReservation {
  const seatNumber = seat?.seat_number || row.seats?.seat_number || '—'
  const section = extractSection(seatNumber, seat?.section || row.seats?.section)

  return {
    id: row.id,
    studentId: row.student_id,
    seatId: row.seat_id,
    seatNumber,
    section,
    reservedAt: row.reserved_at,
    expiresAt: row.expires_at || new Date(new Date(row.reserved_at).getTime() + 30 * 60 * 1000).toISOString(),
    status: row.status,
    fulfilledAt: row.fulfilled_at,
    cancelledAt: row.cancelled_at,
    createdAt: row.created_at,
  }
}

/**
 * Fetches the currently active reservation for a student from public.library_reservations.
 * If an active reservation is found but its expiration time is in the past,
 * it automatically marks it as expired, frees the seat, and returns null.
 */
export async function fetchActiveStudentReservation(
  studentId: string
): Promise<LibraryReservation | null> {
  const session = await getAuthenticatedSession()

  const { data: rows, error } = await supabase
    .from('library_reservations')
    .select('*')
    .setHeader('Authorization', `Bearer ${session.access_token}`)
    .eq('student_id', studentId)
    .eq('status', 'reserved')
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) {
    console.error('[reservationService] Failed to load active student reservation:', error)
    return null
  }

  if (!rows || rows.length === 0) {
    return null
  }

  const reservationRow = rows[0] as LibraryReservationRow

  // Check if expiration time is in the past
  if (reservationRow.expires_at) {
    const expiresMs = new Date(reservationRow.expires_at).getTime()
    if (!isNaN(expiresMs) && expiresMs <= Date.now()) {
      // Auto-expire
      void expireReservation(reservationRow.id, reservationRow.seat_id)
      return null
    }
  }

  // Fetch associated seat separately from public.seats using seat_id
  let seatRow: SeatRow | null = null
  if (reservationRow.seat_id) {
    const { data: seatData, error: seatError } = await supabase
      .from('seats')
      .select('*')
      .setHeader('Authorization', `Bearer ${session.access_token}`)
      .eq('id', reservationRow.seat_id)
      .maybeSingle()

    if (seatError) {
      console.warn('[reservationService] Failed to load seat for active reservation:', seatError)
    } else if (seatData) {
      seatRow = seatData as SeatRow
    }
  }

  return mapRowToReservation(reservationRow, seatRow)
}

/**
 * Creates a 30-minute seat reservation for the authenticated student.
 * Uses atomic RPC `create_student_seat_reservation` if available,
 * or safely falls back to transactional REST operations.
 */
export async function createStudentReservation(
  studentId: string,
  seatId: string
): Promise<LibraryReservation> {
  const session = await getAuthenticatedSession()

  // 1. Attempt atomic RPC first
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      'create_student_seat_reservation',
      {
        p_student_id: studentId,
        p_seat_id: seatId,
      }
    )

    if (!rpcError && rpcData) {
      if (!rpcData.success) {
        throw new Error(rpcData.error || 'Failed to reserve seat.')
      }

      const resObj = rpcData.reservation as LibraryReservationRow
      const seatObj = rpcData.seat as SeatRow
      return mapRowToReservation(resObj, seatObj)
    }

    // If RPC doesn't exist (code 42883 or PGRST202), proceed to fallback below
    if (rpcError && rpcError.code !== '42883' && rpcError.code !== 'PGRST202') {
      if (rpcError.message && !rpcError.message.includes('not found')) {
        throw new Error(rpcError.message)
      }
    }
  } catch (err: unknown) {
    // If it was an application error from the RPC, bubble it up
    if (err instanceof Error && !err.message.includes('not found') && !err.message.includes('does not exist')) {
      throw err
    }
  }

  // 2. Direct fallback logic:
  // Step A: Check student has no active library session
  const { data: activeSession, error: sessionCheckErr } = await supabase
    .from('library_sessions')
    .select('id')
    .setHeader('Authorization', `Bearer ${session.access_token}`)
    .eq('student_id', studentId)
    .eq('status', 'active')
    .maybeSingle()

  if (sessionCheckErr) {
    console.warn('[reservationService] Error checking active session:', sessionCheckErr)
  }

  if (activeSession) {
    throw new Error('You currently have an active study session inside the library. Reservations are only available when outside.')
  }

  // Step B: Check student has no active unexpired reservation
  const { data: existingReservations, error: resCheckErr } = await supabase
    .from('library_reservations')
    .select('*')
    .setHeader('Authorization', `Bearer ${session.access_token}`)
    .eq('student_id', studentId)
    .eq('status', 'reserved')

  if (!resCheckErr && existingReservations && existingReservations.length > 0) {
    const unexpired = existingReservations.filter((r) => {
      if (!r.expires_at) return true
      return new Date(r.expires_at).getTime() > Date.now()
    })
    if (unexpired.length > 0) {
      throw new Error('You already have an active seat reservation. Please use or cancel your existing reservation before creating a new one.')
    }
  }

  // Step C: Verify selected seat is free
  const { data: seatRow, error: seatErr } = await supabase
    .from('seats')
    .select('*')
    .setHeader('Authorization', `Bearer ${session.access_token}`)
    .eq('id', seatId)
    .single()

  if (seatErr || !seatRow) {
    throw new Error('The selected seat could not be found.')
  }

  if (seatRow.status !== 'free') {
    throw new Error(
      `Seat ${seatRow.seat_number} is no longer available (status: ${seatRow.status}). Please choose another seat.`
    )
  }

  const now = new Date()
  const expiresAt = new Date(now.getTime() + 30 * 60 * 1000).toISOString()
  const nowIso = now.toISOString()

  // Step D: Insert reservation
  const { data: insertedRes, error: insertErr } = await supabase
    .from('library_reservations')
    .insert({
      student_id: studentId,
      seat_id: seatId,
      reserved_at: nowIso,
      expires_at: expiresAt,
      status: 'reserved',
    })
    .setHeader('Authorization', `Bearer ${session.access_token}`)
    .select()
    .single()

  if (insertErr || !insertedRes) {
    console.error('[reservationService] Failed to insert reservation:', insertErr)
    throw new Error(insertErr?.message || 'Failed to create seat reservation in database.')
  }

  // Step E: Update seat status to 'reserved'
  const { error: updateSeatErr } = await supabase
    .from('seats')
    .update({
      status: 'reserved',
      updated_at: nowIso,
    })
    .setHeader('Authorization', `Bearer ${session.access_token}`)
    .eq('id', seatId)

  if (updateSeatErr) {
    console.error('[reservationService] Failed to mark seat as reserved:', updateSeatErr)
    // Rollback reservation row if seat status update fails
    await supabase
      .from('library_reservations')
      .delete()
      .setHeader('Authorization', `Bearer ${session.access_token}`)
      .eq('id', insertedRes.id)
    throw new Error('Seat status update failed. Please try again.')
  }

  return mapRowToReservation(insertedRes as LibraryReservationRow, seatRow as SeatRow)
}

/**
 * Cancels an active reservation and resets the seat to 'free'.
 */
export async function cancelStudentReservation(
  reservationId: string,
  studentId: string,
  seatId?: string
): Promise<void> {
  const session = await getAuthenticatedSession()

  // 1. Try atomic RPC first
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      'cancel_student_seat_reservation',
      {
        p_reservation_id: reservationId,
        p_student_id: studentId,
      }
    )

    if (!rpcError && rpcData?.success) {
      return
    }
  } catch {
    // Fall back to direct queries below
  }

  const nowIso = new Date().toISOString()

  // 2. Direct fallback
  const { error: resErr } = await supabase
    .from('library_reservations')
    .update({
      status: 'cancelled',
      cancelled_at: nowIso,
    })
    .setHeader('Authorization', `Bearer ${session.access_token}`)
    .eq('id', reservationId)

  if (resErr) {
    console.error('[reservationService] Failed to cancel reservation:', resErr)
    throw new Error('Failed to cancel reservation in database.')
  }

  if (seatId) {
    await supabase
      .from('seats')
      .update({
        status: 'free',
        updated_at: nowIso,
      })
      .setHeader('Authorization', `Bearer ${session.access_token}`)
      .eq('id', seatId)
      .eq('status', 'reserved')
  }
}

/**
 * Marks an expired reservation as 'expired' and resets the seat to 'free'.
 */
export async function expireReservation(
  reservationId: string,
  seatId?: string
): Promise<void> {
  const session = await getAuthenticatedSession()

  // 1. Try atomic RPC first
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      'expire_student_seat_reservation',
      {
        p_reservation_id: reservationId,
      }
    )

    if (!rpcError && rpcData?.success) {
      return
    }
  } catch {
    // Fall back to direct queries
  }

  // 2. Direct fallback
  const nowIso = new Date().toISOString()
  await supabase
    .from('library_reservations')
    .update({
      status: 'expired',
    })
    .setHeader('Authorization', `Bearer ${session.access_token}`)
    .eq('id', reservationId)

  if (seatId) {
    await supabase
      .from('seats')
      .update({
        status: 'free',
        updated_at: nowIso,
      })
      .setHeader('Authorization', `Bearer ${session.access_token}`)
      .eq('id', seatId)
      .eq('status', 'reserved')
  }
}

/**
 * Marks a reservation as fulfilled when a student scans their pass for library entry.
 */
export async function fulfillStudentReservation(
  reservationId: string,
  studentId: string,
  seatId: string
): Promise<void> {
  const session = await getAuthenticatedSession()
  const nowIso = new Date().toISOString()

  const { error } = await supabase
    .from('library_reservations')
    .update({
      status: 'fulfilled',
      fulfilled_at: nowIso,
    })
    .setHeader('Authorization', `Bearer ${session.access_token}`)
    .eq('id', reservationId)
    .eq('student_id', studentId)

  if (error) {
    console.warn('[reservationService] Failed to mark reservation fulfilled:', error)
  }

  // Seat is marked 'occupied' during session creation
  await supabase
    .from('seats')
    .update({
      status: 'occupied',
      updated_at: nowIso,
    })
    .setHeader('Authorization', `Bearer ${session.access_token}`)
    .eq('id', seatId)
}
