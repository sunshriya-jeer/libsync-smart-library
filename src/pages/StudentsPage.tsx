import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  AlertCircle,
  Check,
  Edit3,
  Eye,
  FilterX,
  Loader2,
  Plus,
  QrCode,
  RefreshCw,
  Search,
  ShieldOff,
  UserCheck,
  Users,
} from 'lucide-react'
import type { Student, StudentStatus } from '../types'
import { Button } from '../components/ui/Button'
import { Card, CardHeader } from '../components/ui/Card'
import { StudentDetailsModal } from '../components/students/StudentDetailsModal'
import { AddStudentModal, type SaveStudentData } from '../components/students/AddStudentModal'
import { StudentFilters } from '../components/students/StudentFilters'
import { StudentQrPreviewModal } from '../components/students/StudentQrPreviewModal'
import { StudentStatusBadge } from '../components/students/StudentStatusBadge'
import { StudentSummaryCards } from '../components/students/StudentSummaryCards'
import {
  fetchStudents,
  createStudent,
  updateStudent,
  updateStudentStatus,
} from '../services/studentService'
import { fetchActiveSessions } from '../services/sessionService'

export function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [insideCount, setInsideCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQuery = searchParams.get('search') ?? searchParams.get('q') ?? ''
  const [department, setDepartment] = useState('All Departments')
  const [year, setYear] = useState('All Years')
  const [status, setStatus] = useState('All Statuses')
  const [formOpen, setFormOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [detailsStudent, setDetailsStudent] = useState<Student | null>(null)
  const [qrStudent, setQrStudent] = useState<Student | null>(null)
  const [pendingStatus, setPendingStatus] = useState<{ student: Student; nextStatus: StudentStatus } | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const handleRetry = async () => {
    try {
      setIsLoading(true)
      setLoadError(null)
      const [data, activeData] = await Promise.all([
        fetchStudents(),
        fetchActiveSessions(),
      ])
      setStudents(data)
      setInsideCount(activeData.uniqueStudentCount)
    } catch (err: unknown) {
      console.error('[StudentsPage] Failed to fetch students:', err)
      setLoadError(
        err instanceof Error
          ? err.message
          : 'Unable to connect to the library database. Please check your connection and try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const fetchInitialData = async () => {
      try {
        const [data, activeData] = await Promise.all([
          fetchStudents(),
          fetchActiveSessions(),
        ])
        if (isMounted) {
          setStudents(data)
          setInsideCount(activeData.uniqueStudentCount)
          setLoadError(null)
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.error('[StudentsPage] Failed to fetch students:', err)
          setLoadError(
            err instanceof Error
              ? err.message
              : 'Unable to connect to the library database. Please check your connection and try again.'
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void fetchInitialData()

    const refreshActiveInside = async () => {
      try {
        const activeData = await fetchActiveSessions()
        if (isMounted) {
          setInsideCount(activeData.uniqueStudentCount)
        }
      } catch (err: unknown) {
        console.error('[StudentsPage] Failed to refresh active sessions count:', err)
      }
    }

    const handleSessionChange = () => {
      void refreshActiveInside()
    }

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        void refreshActiveInside()
      }
    }

    window.addEventListener('visibilitychange', handleVisibilityOrFocus)
    window.addEventListener('focus', handleVisibilityOrFocus)
    window.addEventListener('libsync:session-change', handleSessionChange)

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        void refreshActiveInside()
      }
    }, 10000)

    return () => {
      isMounted = false
      window.removeEventListener('visibilitychange', handleVisibilityOrFocus)
      window.removeEventListener('focus', handleVisibilityOrFocus)
      window.removeEventListener('libsync:session-change', handleSessionChange)
      clearInterval(interval)
    }
  }, [])

  const handleSearchChange = (val: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (val.trim()) {
          next.set('search', val)
        } else {
          next.delete('search')
          next.delete('q')
        }
        return next
      },
      { replace: true }
    )
  }

  const normalizedQuery = searchQuery.trim().toLowerCase()
  const visibleStudents = students.filter((student) => {
    const studentId = [student.student_id, student.studentId, student.id].filter(Boolean).join(' ')
    const fullName = [student.fullName, student.full_name].filter(Boolean).join(' ')
    const departmentVal = student.department || ''
    const emailVal = student.email || ''
    const collegeBarcode = student.college_barcode || ''

    const matchesSearch =
      !normalizedQuery ||
      studentId.toLowerCase().includes(normalizedQuery) ||
      fullName.toLowerCase().includes(normalizedQuery) ||
      departmentVal.toLowerCase().includes(normalizedQuery) ||
      emailVal.toLowerCase().includes(normalizedQuery) ||
      collegeBarcode.toLowerCase().includes(normalizedQuery)

    const matchesDepartment =
      department === 'All Departments' ||
      (student.department && student.department.trim().toLowerCase() === department.trim().toLowerCase())
    const matchesYear =
      year === 'All Years' ||
      student.year === year ||
      String(student.year).trim().toLowerCase() === year.trim().toLowerCase()
    const matchesStatus =
      status === 'All Statuses' ||
      student.status === status ||
      student.status?.toLowerCase() === status.toLowerCase()

    return matchesSearch && matchesDepartment && matchesYear && matchesStatus
  })

  const activeCount = students.filter((student) => student.status === 'active').length
  const inactiveCount = students.filter((student) => student.status === 'inactive').length
  const isFiltered = Boolean(searchQuery || department !== 'All Departments' || year !== 'All Years' || status !== 'All Statuses')

  const clearFilters = () => {
    handleSearchChange('')
    setDepartment('All Departments')
    setYear('All Years')
    setStatus('All Statuses')
  }

  const openAddForm = () => {
    setEditingStudent(null)
    setFormOpen(true)
  }

  const openEditForm = (student: Student) => {
    setEditingStudent(student)
    setFormOpen(true)
  }

  const handleSaveStudent = async (data: SaveStudentData) => {
    if (editingStudent) {
      const updated = await updateStudent(editingStudent.id, {
        full_name: data.full_name,
        department: data.department,
        year: data.year,
        division: data.division,
        email: data.email,
        college_barcode: data.college_barcode,
      })
      setStudents((currentStudents) =>
        currentStudents.map((s) => (s.id === editingStudent.id ? updated : s))
      )
    } else {
      const created = await createStudent({
        student_id: data.student_id,
        full_name: data.full_name,
        department: data.department,
        year: data.year,
        division: data.division,
        email: data.email,
        college_barcode: data.college_barcode,
      })
      setStudents((currentStudents) => [created, ...currentStudents])
    }
  }

  const toggleStatus = async () => {
    if (!pendingStatus) return
    try {
      setIsUpdatingStatus(true)
      const updated = await updateStudentStatus(pendingStatus.student.id, pendingStatus.nextStatus)
      setStudents((currentStudents) =>
        currentStudents.map((student) =>
          student.id === pendingStatus.student.id
            ? {
                ...updated,
                currentSeat: pendingStatus.nextStatus === 'inactive' ? null : student.currentSeat,
              }
            : student
        )
      )
      setPendingStatus(null)
    } catch (err: unknown) {
      console.error('[StudentsPage] Failed to update status:', err)
      alert(err instanceof Error ? err.message : 'Failed to update student access status.')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Student Management</h2>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">Manage registered students, access status, and library passes.</p>
        </div>
        <Button variant="primary" size="md" icon={<Plus className="h-4 w-4" />} onClick={openAddForm}>Register Student</Button>
      </div>

      {loadError && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{loadError}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={handleRetry}
            className="shrink-0 bg-white"
          >
            Retry
          </Button>
        </div>
      )}

      <StudentSummaryCards totalCount={students.length} insideCount={insideCount} activeCount={activeCount} inactiveCount={inactiveCount} />

      <StudentFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        department={department}
        onDepartmentChange={setDepartment}
        year={year}
        onYearChange={setYear}
        status={status}
        onStatusChange={setStatus}
        onResetFilters={clearFilters}
        isFiltered={isFiltered}
      />

      <Card>
        <CardHeader
          title="Student Directory"
          subtitle={isLoading ? 'Loading database records...' : `${visibleStudents.length} of ${students.length} students shown`}
          action={isFiltered ? <Button variant="ghost" size="sm" icon={<FilterX className="h-3.5 w-3.5" />} onClick={clearFilters}>Clear filters</Button> : undefined}
        />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-sm font-medium">Fetching students from Supabase...</p>
          </div>
        ) : visibleStudents.length > 0 ? (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-3">Student</th>
                    <th className="px-4 py-3">Student ID</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Division</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {visibleStudents.map((student) => (
                    <StudentTableRow
                      key={student.id}
                      student={student}
                      onView={setDetailsStudent}
                      onEdit={openEditForm}
                      onQr={setQrStudent}
                      onToggle={(nextStatus) => setPendingStatus({ student, nextStatus })}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-100 md:hidden">
              {visibleStudents.map((student) => (
                <StudentMobileCard
                  key={student.id}
                  student={student}
                  onView={setDetailsStudent}
                  onEdit={openEditForm}
                  onQr={setQrStudent}
                  onToggle={(nextStatus) => setPendingStatus({ student, nextStatus })}
                />
              ))}
            </div>
          </>
        ) : (
          <EmptyState onClear={clearFilters} isFiltered={isFiltered} />
        )}

        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/40 px-5 py-3 text-xs text-slate-500 sm:px-6">
          <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-slate-400" />{insideCount} currently inside</span>
          <span className="font-mono text-slate-400">{isLoading ? 'Connecting...' : `${students.length} database records`}</span>
        </div>
      </Card>

      <AddStudentModal
        key={`${formOpen}-${editingStudent?.id ?? 'new'}`}
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingStudent(null)
        }}
        onSaveStudent={handleSaveStudent}
        student={editingStudent}
        existingStudentIds={students.map((student) => student.student_id || student.id)}
      />
      <StudentDetailsModal student={detailsStudent} onClose={() => setDetailsStudent(null)} />
      <StudentQrPreviewModal student={qrStudent} onClose={() => setQrStudent(null)} />
      {pendingStatus && (
        <StatusConfirmation
          student={pendingStatus.student}
          nextStatus={pendingStatus.nextStatus}
          isUpdating={isUpdatingStatus}
          onCancel={() => {
            if (!isUpdatingStatus) setPendingStatus(null)
          }}
          onConfirm={toggleStatus}
        />
      )}
    </div>
  )
}

function StudentTableRow({ student, onView, onEdit, onQr, onToggle }: StudentActionsProps) {
  const displayId = student.student_id || student.id
  return (
    <tr className="transition-colors hover:bg-slate-50/60">
      <td className="px-6 py-3.5">
        <div className="font-semibold text-slate-900">{student.fullName || student.full_name}</div>
        <div className="mt-0.5 text-xs text-slate-400">{student.email || 'No email provided'}</div>
      </td>
      <td className="px-4 py-3.5 font-mono text-xs text-slate-600">{displayId}</td>
      <td className="px-4 py-3.5 text-xs text-slate-600">{student.department}</td>
      <td className="px-4 py-3.5 text-xs text-slate-600">{student.division || '—'}</td>
      <td className="px-4 py-3.5"><StudentStatusBadge status={student.status} /></td>
      <td className="px-6 py-3.5"><ActionButtons student={student} onView={onView} onEdit={onEdit} onQr={onQr} onToggle={onToggle} /></td>
    </tr>
  )
}

function StudentMobileCard({ student, onView, onEdit, onQr, onToggle }: StudentActionsProps) {
  const displayId = student.student_id || student.id
  return (
    <div className="space-y-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-900">{student.fullName || student.full_name}</p>
          <p className="mt-0.5 truncate text-xs text-slate-500">{student.email || 'No email provided'}</p>
        </div>
        <StudentStatusBadge status={student.status} />
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="uppercase tracking-wider text-slate-400">Student ID</p>
          <p className="mt-1 font-mono text-slate-700">{displayId}</p>
        </div>
        <div>
          <p className="uppercase tracking-wider text-slate-400">Program</p>
          <p className="mt-1 truncate text-slate-700">{student.department}</p>
        </div>
      </div>
      <ActionButtons student={student} onView={onView} onEdit={onEdit} onQr={onQr} onToggle={onToggle} />
    </div>
  )
}

interface StudentActionsProps {
  student: Student
  onView: (student: Student) => void
  onEdit: (student: Student) => void
  onQr: (student: Student) => void
  onToggle: (nextStatus: StudentStatus) => void
}

function ActionButtons({ student, onView, onEdit, onQr, onToggle }: StudentActionsProps) {
  const nextStatus: StudentStatus = student.status === 'inactive' ? 'active' : 'inactive'
  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      <Button variant="ghost" size="sm" icon={<Eye className="h-3.5 w-3.5" />} onClick={() => onView(student)}>View</Button>
      <Button variant="ghost" size="sm" icon={<Edit3 className="h-3.5 w-3.5" />} onClick={() => onEdit(student)}>Edit</Button>
      <Button variant="ghost" size="sm" icon={<QrCode className="h-3.5 w-3.5" />} onClick={() => onQr(student)}>QR</Button>
      <Button
        variant={nextStatus === 'active' ? 'outline' : 'ghost'}
        size="sm"
        icon={nextStatus === 'active' ? <UserCheck className="h-3.5 w-3.5" /> : <ShieldOff className="h-3.5 w-3.5" />}
        onClick={() => onToggle(nextStatus)}
      >
        {nextStatus === 'active' ? 'Activate' : 'Deactivate'}
      </Button>
    </div>
  )
}

function EmptyState({ onClear, isFiltered }: { onClear: () => void; isFiltered: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <Search className="h-8 w-8 text-slate-300" />
      <div>
        <p className="font-semibold text-slate-800">No students found</p>
        <p className="mt-1 text-xs text-slate-500">Try changing the search or filter selection.</p>
      </div>
      {isFiltered && <Button variant="outline" size="sm" onClick={onClear}>Clear filters</Button>}
    </div>
  )
}

function StatusConfirmation({
  student,
  nextStatus,
  isUpdating,
  onCancel,
  onConfirm,
}: {
  student: Student
  nextStatus: StudentStatus
  isUpdating: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  const activating = nextStatus === 'active'
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-2xs"
        onClick={() => {
          if (!isUpdating) onCancel()
        }}
        aria-label="Close confirmation"
      />
      <div role="dialog" aria-modal="true" aria-labelledby="status-confirmation-title" className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${activating ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {activating ? <Check className="h-5 w-5" /> : <ShieldOff className="h-5 w-5" />}
          </div>
          <div>
            <h2 id="status-confirmation-title" className="font-semibold text-slate-900">
              {activating ? 'Activate student?' : 'Deactivate student?'}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">
              {activating
                ? `${student.fullName || student.full_name} will regain active library access.`
                : `${student.fullName || student.full_name} will be marked inactive and removed from any current seat.`}
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" size="md" onClick={onCancel} disabled={isUpdating}>
            Cancel
          </Button>
          <Button
            variant={activating ? 'primary' : 'danger'}
            size="md"
            onClick={onConfirm}
            disabled={isUpdating}
            icon={isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
          >
            {isUpdating ? 'Updating...' : activating ? 'Activate' : 'Deactivate'}
          </Button>
        </div>
      </div>
    </div>
  )
}
