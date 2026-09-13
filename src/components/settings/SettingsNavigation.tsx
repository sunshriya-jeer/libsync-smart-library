import { Armchair, SlidersHorizontal, UserRound, Building2 } from 'lucide-react'

export type SettingsSection = 'library' | 'seats' | 'preferences' | 'administrator'

const NAV_ITEMS = [
  { id: 'library' as const, label: 'Library', description: 'Basic information', icon: Building2 },
  { id: 'seats' as const, label: 'Seat Configuration', description: 'Capacity and sections', icon: Armchair },
  { id: 'preferences' as const, label: 'Preferences', description: 'Local display options', icon: SlidersHorizontal },
  { id: 'administrator' as const, label: 'Administrator', description: 'Profile details', icon: UserRound },
]

export function SettingsNavigation({ activeSection, onChange }: { activeSection: SettingsSection; onChange: (section: SettingsSection) => void }) {
  return <nav aria-label="Settings sections" className="grid grid-cols-2 gap-2 lg:grid-cols-1">{NAV_ITEMS.map((item) => { const Icon = item.icon; const active = item.id === activeSection; return <button key={item.id} type="button" onClick={() => onChange(item.id)} aria-current={active ? 'page' : undefined} className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-colors ${active ? 'border-indigo-200 bg-indigo-50 text-indigo-800' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}><Icon className={`mt-0.5 h-4 w-4 shrink-0 ${active ? 'text-indigo-600' : 'text-slate-400'}`} /><span className="min-w-0"><span className="block text-xs font-semibold">{item.label}</span><span className="mt-0.5 block text-[11px] text-slate-400">{item.description}</span></span></button> })}</nav>
}
