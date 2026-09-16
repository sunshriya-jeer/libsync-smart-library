import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { BookOpenCheck, Home, QrCode, Armchair, History, LogOut, User } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { cn } from '../../utils/cn'

const STUDENT_NAV_ITEMS = [
  { name: 'Home', path: '/student', icon: Home, end: true },
  { name: 'Scan', path: '/student/scan', icon: QrCode, end: false },
  { name: 'Current Seat', path: '/student/seat', icon: Armchair, end: false },
  { name: 'History', path: '/student/history', icon: History, end: false },
]

export function StudentLayout() {
  const { profile, session, signOut } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    setIsSigningOut(true)
    const err = await signOut()
    setIsSigningOut(false)
    if (!err) {
      navigate('/login', { replace: true })
    }
  }

  const studentDisplayName = profile?.full_name || session?.user.email?.split('@')[0] || 'Student'

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans pb-20 md:pb-0">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200/80 px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <BookOpenCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 tracking-tight text-base">LibSync</span>
              <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded uppercase">
                Student
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Campus Central Library</p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Student Desktop Navigation">
          {STUDENT_NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  )
                }
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.name}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* Profile & Logout */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden sm:block text-left text-xs">
              <p className="font-semibold text-slate-800 leading-tight truncate max-w-[120px]">{studentDisplayName}</p>
              <p className="text-[10px] text-slate-400">Library Pass</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isSigningOut}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg border border-slate-200/80 transition-colors cursor-pointer"
            title="Sign out of student account"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isSigningOut ? 'Signing out...' : 'Log out'}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 py-1 px-2 flex justify-around items-center"
        aria-label="Student Mobile Navigation"
      >
        {STUDENT_NAV_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all min-w-[64px]',
                  isActive
                    ? 'text-indigo-600 font-bold'
                    : 'text-slate-400 hover:text-slate-700 font-medium'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn('w-5 h-5', isActive && 'stroke-[2.2]')} />
                  <span className="text-[10px] mt-1">{item.name}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
