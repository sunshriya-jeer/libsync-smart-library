import { Menu, Search, Bell, ShieldCheck, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useCurrentRoute } from '../../hooks/useNavigation'
import { useAuth } from '../../hooks/useAuth'
import { Badge } from '../ui/Badge'

interface HeaderProps {
  onOpenMobileMenu: () => void
}

export function Header({ onOpenMobileMenu }: HeaderProps) {
  const { pageTitle } = useCurrentRoute()
  const { profile, session } = useAuth()
  const [notificationOpen, setNotificationOpen] = useState(false)

  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const headerQuery = searchParams.get('search') ?? searchParams.get('q') ?? ''

  const roleTitle = profile?.role === 'librarian'
    ? 'Librarian Desk'
    : profile?.role === 'student'
    ? 'Student Account'
    : 'Administrator'

  const userSubtitle = profile?.full_name || session?.user.email || (profile?.role === 'librarian' ? 'Operations' : 'Admin Portal')

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-xs border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
      {/* Left section: Mobile toggle + Breadcrumb / Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 min-w-0">
          <div>
            <h1 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight leading-tight truncate">
              {pageTitle}
            </h1>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Main Campus Central Library • Floor 1-3
            </p>
          </div>
        </div>
      </div>

      {/* Middle/Status section */}
      <div className="hidden md:flex items-center gap-2">
        <Badge variant="success" dot size="sm">
          System Online
        </Badge>
        <span className="text-xs text-slate-400">•</span>
        <Badge variant="default" size="sm">
          Database Synced
        </Badge>
      </div>

      {/* Right section: Search bar + Notification + Profile summary */}
      <div className="flex items-center gap-3">
        {/* Quick Search */}
        <div className="relative hidden xl:block w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={headerQuery}
            onChange={(e) => {
              const val = e.target.value
              if (location.pathname !== '/students') {
                navigate(val.trim() ? `/students?search=${encodeURIComponent(val)}` : '/students')
              } else {
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
            }}
            placeholder="Search students, seats..."
            className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Notifications Icon Button */}
        <div className="relative">
          <button
            type="button"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer relative"
            aria-label="View notifications"
            onClick={() => setNotificationOpen((current) => !current)}
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white" />
          </button>
        </div>
        {notificationOpen && (
          <div className="absolute right-4 top-14 z-30 w-64 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600 shadow-lg" role="status">
            Notifications are UI-only in this frontend milestone.
          </div>
        )}

        {/* User Profile Summary */}
        <Link
          to={profile?.role === 'admin' ? '/settings' : '#'}
          className="flex items-center gap-2.5 pl-2 border-l border-slate-200/80 cursor-pointer group hover:opacity-80 transition-opacity"
          aria-label={profile?.role === 'admin' ? 'Open Administrator profile settings' : 'User profile summary'}
        >
          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-semibold text-xs shrink-0 group-hover:border-indigo-300">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
          </div>

          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-slate-900 leading-tight">
              {roleTitle}
            </div>
            <div className="text-[11px] text-slate-400 leading-tight max-w-[140px] truncate">
              {userSubtitle}
            </div>
          </div>

          <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
        </Link>
      </div>
    </header>
  )
}
