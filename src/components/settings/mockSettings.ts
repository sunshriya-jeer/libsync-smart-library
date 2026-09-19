import type { LibrarySeat } from '../../types'

export interface LibrarySettings {
  libraryName: string
  libraryCode: string
  location: string
  contactEmail: string
  openingTime: string
  closingTime: string
  enabledSections: Record<'A' | 'B' | 'C' | 'D', boolean>
  defaultSection: 'A' | 'B' | 'C' | 'D'
  seatNaming: 'compact' | 'descriptive'
}

export interface LibraryPreferences {
  autoRefreshDashboard: boolean
  showOccupancyWarnings: boolean
  confirmStudentExit: boolean
  showSessionDuration: boolean
  compactTableView: boolean
}

export interface AdminProfile {
  name: string
  email: string
  role: string
  library: string
}

export interface MockSettings {
  library: LibrarySettings
  preferences: LibraryPreferences
  admin: AdminProfile
}

export const DEFAULT_SETTINGS: MockSettings = {
  library: {
    libraryName: 'LibSync Central Library',
    libraryCode: 'LIBSYNC-01',
    location: 'Main Campus • Floors 1-3',
    contactEmail: 'admin@libsync.edu',
    openingTime: '08:00',
    closingTime: '20:00',
    enabledSections: { A: true, B: true, C: true, D: true },
    defaultSection: 'A',
    seatNaming: 'compact',
  },
  preferences: {
    autoRefreshDashboard: true,
    showOccupancyWarnings: true,
    confirmStudentExit: true,
    showSessionDuration: true,
    compactTableView: false,
  },
  admin: {
    name: 'Administrator',
    email: '',
    role: 'Administrator',
    library: 'LibSync Central Library',
  },
}

export const INITIAL_MOCK_SETTINGS = DEFAULT_SETTINGS

export function getSeatCounts(seats: LibrarySeat[]) {
  return {
    total: seats.length,
    available: seats.filter((seat) => seat.status === 'free').length,
    occupied: seats.filter((seat) => seat.status === 'occupied').length,
    maintenance: seats.filter((seat) => seat.status === 'maintenance').length,
  }
}
