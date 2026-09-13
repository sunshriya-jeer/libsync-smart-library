import { useState, useEffect } from 'react'
import { X, UserPlus, AlertCircle } from 'lucide-react'
import type { Student } from '../../types'
import { DEPARTMENTS, ACADEMIC_YEARS, DIVISIONS } from './mockStudents'
import { Button } from '../ui/Button'

interface AddStudentModalProps {
  isOpen: boolean
  onClose: () => void
  onSaveStudent: (student: Student) => void
  student?: Student | null
  existingStudentIds: string[]
}

export function AddStudentModal({
  isOpen,
  onClose,
  onSaveStudent,
  student,
  existingStudentIds,
}: AddStudentModalProps) {
  const generateNewId = () => `STU-2026-${Math.floor(1000 + Math.random() * 9000)}`
  const generateQrToken = () => `mock-qr-${Date.now()}-${Math.floor(Math.random() * 1000)}`

  const [studentId, setStudentId] = useState(student?.id ?? generateNewId)
  const [fullName, setFullName] = useState(student?.fullName ?? '')
  const [email, setEmail] = useState(student?.email ?? '')
  const [department, setDepartment] = useState<string>(student?.department ?? DEPARTMENTS[1])
  const [year, setYear] = useState<string>(student?.year ?? ACADEMIC_YEARS[1])
  const [division, setDivision] = useState<string>(student?.division ?? DIVISIONS[0])
  const [error, setError] = useState<string | null>(null)

  // ESC key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!studentId.trim()) {
      setError('Student ID is required.')
      return
    }
    if (existingStudentIds.includes(studentId.trim()) && studentId.trim() !== student?.id) {
      setError('That Student ID is already registered.')
      return
    }
    if (!fullName.trim()) {
      setError('Full Name is required.')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid institutional email.')
      return
    }

    const newStudent: Student = {
      id: studentId.trim(),
      qrToken: student?.qrToken ?? generateQrToken(),
      fullName: fullName.trim(),
      email: email.trim(),
      department,
      year,
      division,
      status: student?.status ?? 'active',
      currentSeat: student?.currentSeat ?? null,
      joinedDate: student?.joinedDate ?? 'Sep 2026',
      lastVisit: student?.lastVisit ?? 'Never (New)',
    }

    onSaveStudent(newStudent)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-student-title"
        className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden animate-in fade-in-95 zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="add-student-title"
                className="text-base sm:text-lg font-bold text-slate-900 tracking-tight"
              >
                {student ? 'Edit Student' : 'Register New Student'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {student ? 'Update the student library access record' : 'Add student to LibSync library access directory'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Student ID & Full Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="student-id"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Student ID <span className="text-rose-500">*</span>
              </label>
              <input
                id="student-id"
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="STU-2026-XXXX"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="full-name"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="full-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="student-email"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Institutional Email <span className="text-rose-500">*</span>
            </label>
            <input
              id="student-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. alex.morgan@campus.edu"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              required
            />
          </div>

          {/* Department, Year & Division */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-3">
              <label
                htmlFor="student-dept"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Department <span className="text-rose-500">*</span>
              </label>
              <select
                id="student-dept"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
              >
                {DEPARTMENTS.filter((d) => d !== 'All Departments').map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="student-year"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Academic Year <span className="text-rose-500">*</span>
              </label>
              <select
                id="student-year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
              >
                {ACADEMIC_YEARS.filter((y) => y !== 'All Years').map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="student-division"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Division <span className="text-rose-500">*</span>
              </label>
              <select
                id="student-division"
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
              >
                {DIVISIONS.map((div) => (
                  <option key={div} value={div}>
                    {div}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-400">
            * QR access is represented by a mock token until the QR workflow is connected.
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={<UserPlus className="w-4 h-4" />}
            >
                {student ? 'Save Changes' : 'Add Student'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
