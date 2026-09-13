import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Armchair,
  QrCode,
  Clock,
  BarChart3,
  Settings,
  LogOut,
  Sparkles,
  BookOpenCheck,
} from 'lucide-react'
import { cn } from '../../utils/cn'

interface SidebarProps {
  className?: string
  onNavigate?: () => void
}

const NAV_LINKS = [
  {
    name: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
    badge: undefined,
  },
  {
    name: 'Students',
    path: '/students',
    icon: Users,
    badge: '142',
  },
  {
    name: 'Seats',
    path: '/seats',
    icon: Armchair,
    badge: '58 free',
  },
  {
    name: 'Scanner',
    path: '/scanner',
    icon: QrCode,
    badge: 'Live',
    badgeVariant: 'primary' as const,
  },
  {
    name: 'Sessions',
    path: '/sessions',
    icon: Clock,
    badge: undefined,
  },
  {
    name: 'Reports',
    path: '/reports',
    icon: BarChart3,
    badge: undefined,
  },
  {
    name: 'Settings',
    path: '/settings',
    icon: Settings,
    badge: undefined,
  },
]

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const handleLogoutClick = () => {
    // UI only as required
    alert('LibSync: Logout functionality will be linked with Supabase Auth in upcoming tasks.')
  }

  return (
    <aside
      className={cn(
        'w-64 bg-white border-r border-slate-200/90 flex flex-col h-full select-none',
        className
      )}
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <BookOpenCheck className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 tracking-tight text-lg leading-tight">
                LibSync
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                v1.0
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400 tracking-tight truncate mt-0.5">
              Scan. Sit. Study. Sync.
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Library Management
        </div>

        {NAV_LINKS.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              end={item.path === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={cn(
                        'w-4 h-4 shrink-0 transition-colors',
                        isActive
                          ? 'text-indigo-600'
                          : 'text-slate-400 group-hover:text-slate-700'
                      )}
                    />
                    <span className="truncate">{item.name}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={cn(
                        'text-[11px] px-2 py-0.5 rounded-full font-medium shrink-0',
                        item.badgeVariant === 'primary'
                          ? 'bg-indigo-100 text-indigo-700 font-semibold'
                          : isActive
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-slate-100 text-slate-600'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </div>

      {/* System Status Callout Card */}
      <div className="p-3 mx-3 mb-2 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
        <div className="flex items-center justify-between font-medium text-slate-700 mb-1">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Live Library State
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <p className="text-slate-500 text-[11px] leading-relaxed">
          Real-time seat synchronizer active. 142/200 seats occupied.
        </p>
      </div>

      {/* Footer / Logout Button UI */}
      <div className="p-3 border-t border-slate-100">
        <button
          type="button"
          onClick={handleLogoutClick}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-rose-700 hover:bg-rose-50/70 transition-colors cursor-pointer group"
          title="Sign out of LibSync"
        >
          <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-600 transition-colors shrink-0" />
          <span className="flex-1 text-left font-medium">Log out</span>
          <span className="text-[11px] text-slate-400 bg-slate-100 group-hover:bg-rose-100/60 group-hover:text-rose-700 px-1.5 py-0.5 rounded">
            UI only
          </span>
        </button>
      </div>
    </aside>
  )
}
