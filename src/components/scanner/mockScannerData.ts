export type ScanAction = 'entry' | 'exit'

export interface ScanRecord {
  id: string
  studentName: string
  studentId: string
  action: ScanAction
  seatNumber: string
  timestamp: string
  status: 'success' | 'rejected'
}

export const INITIAL_RECENT_SCANS: ScanRecord[] = [
  {
    id: 'scan-001',
    studentName: 'Aarav Sharma',
    studentId: 'STU-2026-0142',
    action: 'entry',
    seatNumber: 'A02',
    timestamp: 'Today, 10:35 AM',
    status: 'success',
  },
  {
    id: 'scan-002',
    studentName: 'Elena Rostova',
    studentId: 'STU-2026-0188',
    action: 'exit',
    seatNumber: 'B04',
    timestamp: 'Today, 10:22 AM',
    status: 'success',
  },
  {
    id: 'scan-003',
    studentName: 'Sofia Alvarez',
    studentId: 'STU-2026-0331',
    action: 'entry',
    seatNumber: 'B01',
    timestamp: 'Today, 10:10 AM',
    status: 'success',
  },
  {
    id: 'scan-004',
    studentName: 'Maya Patel',
    studentId: 'STU-2026-0412',
    action: 'exit',
    seatNumber: 'C03',
    timestamp: 'Today, 09:58 AM',
    status: 'success',
  },
  {
    id: 'scan-005',
    studentName: 'Lucas Becker',
    studentId: 'STU-2026-0521',
    action: 'entry',
    seatNumber: 'D06',
    timestamp: 'Today, 09:42 AM',
    status: 'success',
  },
]

export const DEFAULT_SIMULATED_STUDENT_ID = 'STU-2026-0331'
