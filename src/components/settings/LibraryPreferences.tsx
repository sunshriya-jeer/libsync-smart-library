import { BellRing, Check, Clock3, LayoutList, RefreshCw } from 'lucide-react'
import type { LibraryPreferences as Preferences } from './mockSettings'

interface LibraryPreferencesProps { value: Preferences; onChange: (field: keyof Preferences, value: boolean) => void }

const ITEMS = [
  { key: 'autoRefreshDashboard' as const, label: 'Auto-refresh dashboard', description: 'Keep dashboard views visually current.', icon: RefreshCw },
  { key: 'showOccupancyWarnings' as const, label: 'Show occupancy warnings', description: 'Highlight high-occupancy states in the interface.', icon: BellRing },
  { key: 'confirmStudentExit' as const, label: 'Confirm student exit', description: 'Ask for confirmation before completing an active session.', icon: Check },
  { key: 'showSessionDuration' as const, label: 'Show session duration', description: 'Display elapsed time in session views.', icon: Clock3 },
  { key: 'compactTableView' as const, label: 'Compact table view', description: 'Use tighter spacing in supported data tables.', icon: LayoutList },
]

export function LibraryPreferences({ value, onChange }: LibraryPreferencesProps) {
  return <div className="divide-y divide-slate-100">{ITEMS.map((item) => { const Icon = item.icon; return <label key={item.key} className="flex cursor-pointer items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"><span className="flex items-start gap-3"><span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500"><Icon className="h-4 w-4" /></span><span><span className="block text-sm font-semibold text-slate-800">{item.label}</span><span className="mt-0.5 block text-xs leading-relaxed text-slate-500">{item.description}</span></span></span><span className="relative shrink-0"><input type="checkbox" checked={value[item.key]} onChange={(event) => onChange(item.key, event.target.checked)} className="peer absolute inset-0 z-10 h-6 w-11 cursor-pointer opacity-0" /><span className="pointer-events-none block h-6 w-11 rounded-full bg-slate-200 transition-colors peer-checked:bg-indigo-600 peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500 peer-focus-visible:ring-offset-2" /><span className="pointer-events-none absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" /></span></label> })}</div>
}
