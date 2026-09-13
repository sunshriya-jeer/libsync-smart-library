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

export type SeatStatus = 'available' | 'occupied' | 'reserved' | 'maintenance'

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
  qrToken: string
  fullName: string
  email: string
  department: string
  year: string
  division: string
  status: StudentStatus
  currentSeat?: string | null
  joinedDate: string
  lastVisit?: string
}

