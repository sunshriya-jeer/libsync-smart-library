import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { LibrarySeat, LibrarySeatStatus, SeatRow } from '../types'

/**
 * Maps database seat status string to frontend LibrarySeatStatus.
 * Handles database 'free' / 'available' -> frontend 'free' (labeled 'Available' in UI),
 * 'occupied' -> 'occupied', 'maintenance' -> 'maintenance', and preserves 'reserved'.
 */
export function mapDatabaseStatusToSeatStatus(status: string): LibrarySeatStatus {
  const normalized = (status || '').toLowerCase().trim()
  if (normalized === 'free' || normalized === 'available') {
    return 'free'
  }
  if (normalized === 'occupied') {
    return 'occupied'
  }
  if (normalized === 'maintenance') {
    return 'maintenance'
  }
  if (normalized === 'reserved') {
    return 'free'
  }
  return 'free'
}

/**
 * Maps frontend LibrarySeatStatus to the database status value.
 * Database check constraint 'seats_status_check' accepts: 'free', 'occupied', 'maintenance', 'reserved'.
 * Frontend 'free' (Available in UI) maps to 'free' in the database.
 */
export function mapSeatStatusToDatabaseStatus(status: LibrarySeatStatus | string): string {
  const normalized = (status || '').toLowerCase().trim()
  if (normalized === 'free' || normalized === 'available') {
    return 'free'
  }
  if (normalized === 'occupied') {
    return 'occupied'
  }
  if (normalized === 'maintenance') {
    return 'maintenance'
  }
  if (normalized === 'reserved') {
    return 'reserved'
  }
  return 'free'
}

/**
 * Maps a raw database row from public.seats to the frontend LibrarySeat interface.
 */
export function mapRowToSeat(row: SeatRow): LibrarySeat {
  const sectionUpper = (row.section || row.seat_number.charAt(0) || 'A').toUpperCase() as LibrarySeat['section']
  return {
    id: row.id,
    seatNumber: row.seat_number,
    section: sectionUpper,
    status: mapDatabaseStatusToSeatStatus(row.status),
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
 * Fetch all seats from public.seats using the authenticated session.
 * Natural sort by section and seat number.
 */
export async function fetchSeats(): Promise<LibrarySeat[]> {
  const session = await getAuthenticatedSession()

  const { data, error } = await supabase
    .from('seats')
    .select('*')
    .setHeader('Authorization', `Bearer ${session.access_token}`)
    .order('seat_number', { ascending: true })

  if (error) {
    throw handleDatabaseError(error, 'Failed to load seats from the library database.')
  }

  const rows = (data ?? []) as SeatRow[]

  // Sort seats naturally (e.g., A-1, A-2 ... A-12 or A01, A02 ... A12)
  rows.sort((a, b) => {
    return a.seat_number.localeCompare(b.seat_number, undefined, { numeric: true, sensitivity: 'base' })
  })

  return rows.map(mapRowToSeat)
}

/**
 * Update a seat's status in public.seats using the authenticated session.
 */
export async function updateSeatStatus(
  id: string,
  newStatus: LibrarySeatStatus
): Promise<LibrarySeat> {
  const session = await getAuthenticatedSession()
  const dbStatus = mapSeatStatusToDatabaseStatus(newStatus)

  const { data, error } = await supabase
    .from('seats')
    .update({
      status: dbStatus,
      updated_at: new Date().toISOString(),
    })
    .setHeader('Authorization', `Bearer ${session.access_token}`)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw handleDatabaseError(error, 'Failed to update seat status.')
  }

  return mapRowToSeat(data as SeatRow)
}
