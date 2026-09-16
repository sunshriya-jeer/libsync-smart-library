import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { Student, StudentRow, StudentStatus } from '../types'

const NUMBER_TO_YEAR_LABEL: Record<number, string> = {
  1: '1st Year',
  2: '2nd Year',
  3: '3rd Year',
  4: '4th Year',
}

/**
 * Formats an integer year from public.students (1-4) into a user-friendly label.
 */
export function formatYearFromNumber(year: number | string | null | undefined): string {
  if (typeof year === 'number' && NUMBER_TO_YEAR_LABEL[year]) {
    return NUMBER_TO_YEAR_LABEL[year]
  }
  if (typeof year === 'string') {
    const parsed = parseInt(year, 10)
    if (!isNaN(parsed) && NUMBER_TO_YEAR_LABEL[parsed]) {
      return NUMBER_TO_YEAR_LABEL[parsed]
    }
    if (year.trim()) return year.trim()
  }
  return '1st Year'
}

/**
 * Maps a raw database row from public.students to the frontend Student interface.
 */
export function mapRowToStudent(row: StudentRow): Student {
  return {
    id: row.id,
    student_id: row.student_id,
    studentId: row.student_id,
    fullName: row.full_name,
    full_name: row.full_name,
    email: row.email ?? '',
    department: row.department,
    year: formatYearFromNumber(row.year),
    division: row.division ?? 'Div A',
    status: (row.status as StudentStatus) || 'active',
    currentSeat: null,
    qrToken: row.qr_token,
    qr_token: row.qr_token,
    college_barcode: row.college_barcode ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    joinedDate: row.created_at
      ? new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      : 'Recently',
    lastVisit: undefined,
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
  if (error.code === '23505') {
    const details = error.details || error.message || ''
    if (details.includes('student_id')) {
      return new Error('A student with this Student ID already exists in the system.')
    }
    if (details.includes('college_barcode')) {
      return new Error('A student with this College Barcode already exists in the system.')
    }
    if (details.includes('email')) {
      return new Error('A student with this email address already exists.')
    }
    return new Error('A student with these unique credentials already exists.')
  }
  return new Error(error.message || defaultMessage)
}

export interface CreateStudentInput {
  student_id: string
  full_name: string
  department: string
  year: number
  division?: string | null
  email?: string | null
  college_barcode?: string | null
}

export interface UpdateStudentInput {
  full_name: string
  department: string
  year: number
  division?: string | null
  email?: string | null
  college_barcode?: string | null
}

/**
 * Fetch all students from public.students using the authenticated session.
 */
export async function fetchStudents(): Promise<Student[]> {
  const session = await getAuthenticatedSession()

  const { data, error } = await supabase
    .from('students')
    .select('*')
    .setHeader('Authorization', `Bearer ${session.access_token}`)
    .order('created_at', { ascending: false })

  if (error) {
    throw handleDatabaseError(error, 'Failed to load students from the library database.')
  }

  return ((data ?? []) as StudentRow[]).map(mapRowToStudent)
}

/**
 * Register a new student in public.students using the authenticated session.
 * Generates a temporary unique qr_token to satisfy NOT NULL constraint.
 */
export async function createStudent(input: CreateStudentInput): Promise<Student> {
  const session = await getAuthenticatedSession()

  const tempQrToken =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? `qr-${crypto.randomUUID()}`
      : `qr-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

  const collegeBarcode = input.college_barcode?.trim() || null
  const email = input.email?.trim() || null
  const division = input.division?.trim() || null

  const { data, error } = await supabase
    .from('students')
    .insert({
      student_id: input.student_id.trim(),
      full_name: input.full_name.trim(),
      department: input.department.trim(),
      year: input.year,
      division,
      email,
      qr_token: tempQrToken,
      college_barcode: collegeBarcode,
      status: 'active',
    })
    .setHeader('Authorization', `Bearer ${session.access_token}`)
    .select()
    .single()

  if (error) {
    throw handleDatabaseError(error, 'Failed to register student.')
  }

  return mapRowToStudent(data as StudentRow)
}

/**
 * Update an existing student in public.students using the authenticated session.
 * student_id is preserved and not updated.
 */
export async function updateStudent(id: string, input: UpdateStudentInput): Promise<Student> {
  const session = await getAuthenticatedSession()

  const collegeBarcode = input.college_barcode?.trim() || null
  const email = input.email?.trim() || null
  const division = input.division?.trim() || null

  const { data, error } = await supabase
    .from('students')
    .update({
      full_name: input.full_name.trim(),
      department: input.department.trim(),
      year: input.year,
      division,
      email,
      college_barcode: collegeBarcode,
      updated_at: new Date().toISOString(),
    })
    .setHeader('Authorization', `Bearer ${session.access_token}`)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw handleDatabaseError(error, 'Failed to update student record.')
  }

  return mapRowToStudent(data as StudentRow)
}

/**
 * Update a student's status ('active' | 'inactive') in public.students using the authenticated session.
 */
export async function updateStudentStatus(id: string, status: StudentStatus): Promise<Student> {
  const session = await getAuthenticatedSession()

  const { data, error } = await supabase
    .from('students')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .setHeader('Authorization', `Bearer ${session.access_token}`)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw handleDatabaseError(error, 'Failed to update student access status.')
  }

  return mapRowToStudent(data as StudentRow)
}
