import type { ReactNode } from 'react'

export interface NavItem {
  name: string
  href: string
  icon: ReactNode
  badge?: string | number
  badgeVariant?: 'default' | 'primary' | 'warning' | 'success'
}

export interface StatMetric {
  id: string
  title: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  description?: string
  icon: ReactNode
  accentColor?: string
}

export type SeatStatus = 'free' | 'occupied' | 'maintenance'

export type LibrarySeatStatus = 'free' | 'occupied' | 'maintenance'

export interface LibrarySeat {
  id: string
  seatNumber: string
  section: 'A' | 'B' | 'C' | 'D'
  status: LibrarySeatStatus
  studentId?: string
  studentName?: string
  entryTime?: string
}

export type LibrarySessionStatus = 'active' | 'completed'

export type ReportPeriod = 'today' | 'sevenDays' | 'thirtyDays'

export interface LibrarySession {
  id: string
  studentId: string
  studentName: string
  department: string
  seatNumber: string
  section: 'A' | 'B' | 'C' | 'D'
  entryTime: string
  exitTime?: string
  durationMinutes?: number
  status: LibrarySessionStatus
}

export interface SeatZonePreview {
  id: string
  name: string
  floor: string
  totalSeats: number
  occupiedSeats: number
  availableSeats: number
  status: 'optimal' | 'busy' | 'full'
  noiseLevel: 'Silent' | 'Whisper' | 'Collaborative'
}

export interface ActivityItem {
  id: string
  timestamp: string
  studentIdMasked: string
  action: 'check-in' | 'check-out' | 'seat-transfer' | 'reservation'
  details: string
  zone: string
  seatNumber?: string
}

export interface UserProfile {
  name: string
  role: string
  email: string
  avatarUrl?: string
}

export type StudentStatus = 'inside' | 'active' | 'inactive'

export interface Student {
  id: string
  student_id?: string
  studentId?: string
  qrToken?: string
  qr_token?: string
  fullName: string
  full_name?: string
  email: string
  department: string
  year?: string
  division?: string | null
  status: StudentStatus
  currentSeat?: string | null
  joinedDate?: string
  created_at?: string
  updated_at?: string
  lastVisit?: string
  college_barcode: string | null
}

export interface StudentRow {
  id: string
  student_id: string
  full_name: string
  department: string
  year: number
  division: string | null
  email: string | null
  qr_token: string
  status: string
  created_at: string
  updated_at: string
  college_barcode: string | null
}

export interface SeatRow {
  id: string
  seat_number: string
  section: string
  status: string
  created_at: string
  updated_at: string
}

export interface LibrarySessionRow {
  id: string
  student_id: string
  seat_id: string
  entry_time: string
  exit_time: string | null
  status: string
  created_at: string
  updated_at: string
  students?: StudentRow | null
  seats?: SeatRow | null
}

export type ScanAction = 'entry' | 'exit'
