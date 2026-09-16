import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { AppLayout } from './components/layout/AppLayout'
import { LoginPage } from './pages/LoginPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { DashboardPage } from './pages/DashboardPage'
import { StudentsPage } from './pages/StudentsPage'
import { SeatsPage } from './pages/SeatsPage'
import { ScannerPage } from './pages/ScannerPage'
import { SessionsPage } from './pages/SessionsPage'
import { ReportsPage } from './pages/ReportsPage'
import { SettingsPage } from './pages/SettingsPage'

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="seats" element={<SeatsPage />} />
              <Route path="scanner" element={<ScannerPage />} />
              <Route path="sessions" element={<SessionsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

function ProtectedRoute() {
  const { session, profile, isLoading } = useAuth()

  if (isLoading) {
    return null
  }

  if (!session || (profile?.role !== 'admin' && profile?.role !== 'librarian')) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default App
