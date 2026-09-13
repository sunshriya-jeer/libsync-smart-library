import type { LibrarySession } from '../../types'

export const INITIAL_MOCK_SESSIONS: LibrarySession[] = [
  { id: 'SES-2026-1001', studentId: 'STU-2026-0142', studentName: 'Aarav Sharma', department: 'Computer Science', seatNumber: 'A02', section: 'A', entryTime: '2026-09-12T09:15:00', status: 'active' },
  { id: 'SES-2026-1002', studentId: 'STU-2026-0188', studentName: 'Elena Rostova', department: 'Electrical Engineering', seatNumber: 'A04', section: 'A', entryTime: '2026-09-12T09:40:00', status: 'active' },
  { id: 'SES-2026-1003', studentId: 'STU-2026-0219', studentName: 'Marcus Chen', department: 'Information Technology', seatNumber: 'A07', section: 'A', entryTime: '2026-09-12T10:05:00', status: 'active' },
  { id: 'SES-2026-1004', studentId: 'STU-2026-0294', studentName: 'Priya Nair', department: 'Business Administration', seatNumber: 'A10', section: 'A', entryTime: '2026-09-12T10:20:00', status: 'active' },
  { id: 'SES-2026-1005', studentId: 'STU-2026-0305', studentName: "Liam O'Connor", department: 'Mechanical Engineering', seatNumber: 'A12', section: 'A', entryTime: '2026-09-12T10:45:00', status: 'active' },
  { id: 'SES-2026-0996', studentId: 'STU-2026-0331', studentName: 'Sofia Alvarez', department: 'Civil Engineering', seatNumber: 'C03', section: 'C', entryTime: '2026-09-12T07:40:00', exitTime: '2026-09-12T09:10:00', durationMinutes: 90, status: 'completed' },
  { id: 'SES-2026-0995', studentId: 'STU-2026-0412', studentName: 'Maya Patel', department: 'Electrical Engineering', seatNumber: 'C04', section: 'C', entryTime: '2026-09-12T06:50:00', exitTime: '2026-09-12T08:35:00', durationMinutes: 105, status: 'completed' },
  { id: 'SES-2026-0994', studentId: 'STU-2026-0188', studentName: 'Elena Rostova', department: 'Electrical Engineering', seatNumber: 'D03', section: 'D', entryTime: '2026-09-11T13:20:00', exitTime: '2026-09-11T16:05:00', durationMinutes: 165, status: 'completed' },
  { id: 'SES-2026-0993', studentId: 'STU-2026-0377', studentName: 'Devon Vance', department: 'Computer Science', seatNumber: 'D07', section: 'D', entryTime: '2026-09-11T09:00:00', exitTime: '2026-09-11T11:20:00', durationMinutes: 140, status: 'completed' },
  { id: 'SES-2026-0992', studentId: 'STU-2026-0294', studentName: 'Priya Nair', department: 'Business Administration', seatNumber: 'A08', section: 'A', entryTime: '2026-09-10T10:15:00', exitTime: '2026-09-10T12:40:00', durationMinutes: 145, status: 'completed' },
  { id: 'SES-2026-0991', studentId: 'STU-2026-0450', studentName: 'Julian Mercer', department: 'Mechanical Engineering', seatNumber: 'B08', section: 'B', entryTime: '2026-09-10T14:05:00', exitTime: '2026-09-10T17:30:00', durationMinutes: 205, status: 'completed' },
]