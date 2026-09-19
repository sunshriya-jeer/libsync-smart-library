import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth, type AuthRole } from './hooks/useAuth'
import { AppLayout } from './components/layout/AppLayout'
import { StudentLayout } from './components/layout/StudentLayout'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { DashboardPage } from './pages/DashboardPage'
import { LibrarianDashboardPage } from './pages/LibrarianDashboardPage'
import { StudentsPage } from './pages/StudentsPage'
import { SeatsPage } from './pages/SeatsPage'
import { ScannerPage } from './pages/ScannerPage'
import { SessionsPage } from './pages/SessionsPage'
import { ReportsPage } from './pages/ReportsPage'
import { SettingsPage } from './pages/SettingsPage'
import { StudentDashboardPage } from './pages/StudentDashboardPage'
import { StudentScanPage } from './pages/StudentScanPage'
import { StudentSeatPage } from './pages/StudentSeatPage'
import { StudentHistoryPage } from './pages/StudentHistoryPage'

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/signup" element={<Navigate to="/register" replace />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Admin & Librarian Operational Experience */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'librarian']} />}>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<DashboardDispatcher />} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="seats" element={<SeatsPage />} />
              <Route path="scanner" element={<ScannerPage />} />
              <Route path="sessions" element={<SessionsPage />} />
              <Route path="reports" element={<ReportsPage />} />

              {/* Admin-only Protected Route */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Route>
          </Route>

          {/* Student Dedicated Experience */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/student" element={<StudentLayout />}>
              <Route index element={<StudentDashboardPage />} />
              <Route path="scan" element={<StudentScanPage />} />
              <Route path="seat" element={<StudentSeatPage />} />
              <Route path="history" element={<StudentHistoryPage />} />
            </Route>
          </Route>

          {/* Catch-all Fallback Route */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

function DashboardDispatcher() {
  const { profile } = useAuth()
  if (profile?.role === 'student') {
    return <Navigate to="/student" replace />
  }
  if (profile?.role === 'librarian') {
    return <LibrarianDashboardPage />
  }
  return <DashboardPage />
}

function ProtectedRoute({ allowedRoles }: { allowedRoles?: AuthRole[] }) {
  const { session, profile, isLoading } = useAuth()

  if (isLoading) {
    return null
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && profile?.role && !allowedRoles.includes(profile.role)) {
    if (profile.role === 'student') {
      return <Navigate to="/student" replace />
    }
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

function RootRedirect() {
  const { session, profile, isLoading } = useAuth()

  if (isLoading) {
    return null
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (profile?.role === 'student') {
    return <Navigate to="/student" replace />
  }

  return <Navigate to="/" replace />
}

export default App
