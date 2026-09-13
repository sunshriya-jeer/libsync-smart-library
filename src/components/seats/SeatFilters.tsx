import { FilterX, Search } from 'lucide-react'
import { Button } from '../ui/Button'

interface SeatFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  section: string
  onSectionChange: (value: string) => void
  status: string
  onStatusChange: (value: string) => void
  onClear: () => void
  isFiltered: boolean
}

export function SeatFilters({ searchQuery, onSearchChange, section, onSectionChange, status, onStatusChange, onClear, isFiltered }: SeatFiltersProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)] lg:flex-row lg:items-center">
      <div className="relative min-w-0 flex-1">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input value={searchQuery} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search by seat number..." aria-label="Search seats" className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20" />
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:flex sm:items-center">
        <select value={section} onChange={(event) => onSectionChange(event.target.value)} aria-label="Filter by section" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20">
          <option value="all">All Sections</option><option value="A">Section A</option><option value="B">Section B</option><option value="C">Section C</option><option value="D">Section D</option>
        </select>
        <select value={status} onChange={(event) => onStatusChange(event.target.value)} aria-label="Filter by seat status" className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20">
          <option value="all">All Statuses</option><option value="free">Free</option><option value="occupied">Occupied</option><option value="maintenance">Maintenance</option>
        </select>
        {isFiltered && <Button variant="ghost" size="sm" icon={<FilterX className="h-3.5 w-3.5" />} onClick={onClear} className="col-span-2 sm:col-span-1">Clear filters</Button>}
      </div>
    </div>
  )
}
