import { Search, RotateCcw } from 'lucide-react'
import { DEPARTMENTS, ACADEMIC_YEARS, STATUS_OPTIONS } from './mockStudents'
import { Button } from '../ui/Button'

interface StudentFiltersProps {
  searchQuery: string
  onSearchChange: (val: string) => void
  department: string
  onDepartmentChange: (val: string) => void
  year: string
  onYearChange: (val: string) => void
  status: string
  onStatusChange: (val: string) => void
  onResetFilters: () => void
  isFiltered: boolean
}

export function StudentFilters({
  searchQuery,
  onSearchChange,
  department,
  onDepartmentChange,
  year,
  onYearChange,
  status,
  onStatusChange,
  onResetFilters,
  isFiltered,
}: StudentFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search students..."
            className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter controls row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex items-center gap-2.5">
          {/* Department filter */}
          <div className="min-w-[150px]">
            <select
              value={department}
              onChange={(e) => onDepartmentChange(e.target.value)}
              className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              aria-label="Filter by department"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Academic Year filter */}
          <div className="min-w-[120px]">
            <select
              value={year}
              onChange={(e) => onYearChange(e.target.value)}
              className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              aria-label="Filter by academic year"
            >
              {ACADEMIC_YEARS.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="min-w-[125px]">
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer capitalize"
              aria-label="Filter by library status"
            >
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st} className="capitalize">
                  {st === 'All Statuses' ? st : `Status: ${st}`}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters action */}
          {isFiltered && (
            <div className="col-span-2 sm:col-span-3 lg:col-span-1">
              <Button
                variant="ghost"
                size="sm"
                icon={<RotateCcw className="w-3.5 h-3.5" />}
                onClick={onResetFilters}
                className="w-full lg:w-auto text-xs text-slate-500 hover:text-slate-800"
              >
                Reset
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
