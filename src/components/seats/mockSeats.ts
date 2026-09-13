import type { LibrarySeat } from '../../types'

const OCCUPIED_SEATS = [
  ['A02', 'STU-2026-0142', 'Aarav Sharma', '2026-09-12T09:15:00'],
  ['A04', 'STU-2026-0188', 'Elena Rostova', '2026-09-12T09:40:00'],
  ['A07', 'STU-2026-0219', 'Marcus Chen', '2026-09-12T10:05:00'],
  ['A10', 'STU-2026-0294', 'Priya Nair', '2026-09-12T10:20:00'],
  ['A12', 'STU-2026-0305', "Liam O'Connor", '2026-09-12T10:45:00'],
]

const MAINTENANCE_SEATS = new Set(['A05', 'B10', 'C12', 'D01', 'D09'])

export const INITIAL_MOCK_SEATS: LibrarySeat[] = ['A', 'B', 'C', 'D'].flatMap((section) =>
  Array.from({ length: 12 }, (_, index) => {
    const seatNumber = `${section}${String(index + 1).padStart(2, '0')}`
    const occupied = OCCUPIED_SEATS.find(([seat]) => seat === seatNumber)
    const status = MAINTENANCE_SEATS.has(seatNumber) ? 'maintenance' : occupied ? 'occupied' : 'free'

    return {
      id: `seat-${seatNumber.toLowerCase()}`,
      seatNumber,
      section: section as LibrarySeat['section'],
      status,
      ...(occupied && {
        studentId: occupied[1],
        studentName: occupied[2],
        entryTime: occupied[3],
      }),
    }
  })
)