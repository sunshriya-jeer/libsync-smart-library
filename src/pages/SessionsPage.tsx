import { useState } from 'react'
import { CheckCircle2, ChevronLeft, ChevronRight, History, LogOut } from 'lucide-react'
import type { LibrarySession } from '../types'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card, CardHeader } from '../components/ui/Card'
import { SessionCard } from '../components/sessions/SessionCard'
import { SessionDetailsModal } from '../components/sessions/SessionDetailsModal'
import { SessionFilters } from '../components/sessions/SessionFilters'
import { INITIAL_MOCK_SESSIONS } from '../components/sessions/mockSessions'
import { SessionSummaryCards } from '../components/sessions/SessionSummaryCards'
import { SessionTable } from '../components/sessions/SessionTable'

const PAGE_SIZE = 10
const TODAY = '2026-09-12'

export function SessionsPage() {
  const [sessions, setSessions] = useState<LibrarySession[]>(INITIAL_MOCK_SESSIONS)
  const [searchQuery, setSearchQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [section, setSection] = useState('all')
  const [dateRange, setDateRange] = useState('all')
  const [page, setPage] = useState(1)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [pendingExit, setPendingExit] = useState<LibrarySession | null>(null)
  const [successMessage, setSuccessMessage] = useState('')

  const selectedSession = sessions.find((session) => session.id === selectedSessionId) ?? null
  const normalizedQuery = searchQuery.trim().toLowerCase()
  const filteredSessions = sessions.filter((session) => {
    const matchesSearch = !normalizedQuery || [session.studentName, session.studentId, session.seatNumber].some((value) => value.toLowerCase().includes(normalizedQuery))
    const matchesStatus = status === 'all' || session.status === status
    const matchesSection = section === 'all' || session.section === section
    const sessionDate = session.entryTime.slice(0, 10)
    const matchesDate = dateRange === 'all' || (dateRange === 'today' ? sessionDate === TODAY : sessionDate >= '2026-09-10')
    return matchesSearch && matchesStatus && matchesSection && matchesDate
  })
  const pageCount = Math.max(1, Math.ceil(filteredSessions.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const pageSessions = filteredSessions.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const activeCount = sessions.filter((session) => session.status === 'active').length
  const completedSessions = sessions.filter((session) => session.status === 'completed')
  const averageDuration = completedSessions.length ? Math.round(completedSessions.reduce((total, session) => total + (session.durationMinutes ?? 0), 0) / completedSessions.length) : 0
  const isFiltered = Boolean(searchQuery || status !== 'all' || section !== 'all' || dateRange !== 'all')

  const updateFilter = (setter: (value: string) => void, value: string) => {
    setter(value)
    setPage(1)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setStatus('all')
    setSection('all')
    setDateRange('all')
    setPage(1)
  }

  const markExit = () => {
    if (!pendingExit || pendingExit.status !== 'active') return
    const exitTime = new Date().toISOString()
    const durationMinutes = Math.max(0, Math.floor((new Date(exitTime).getTime() - new Date(pendingExit.entryTime).getTime()) / 60000))
    setSessions((currentSessions) => currentSessions.map((session) => session.id === pendingExit.id ? { ...session, status: 'completed', exitTime, durationMinutes } : session))
    setPendingExit(null)
    setSuccessMessage(`${pendingExit.studentName}'s session was marked complete.`)
  }

  return <div className="space-y-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><div className="flex items-center gap-2"><Badge variant="primary" size="sm">History &amp; occupancy</Badge><span className="text-xs text-slate-400">•</span><span className="text-xs font-medium text-slate-500">Local mock records</span></div><h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Sessions</h2><p className="mt-1 text-xs text-slate-500 sm:text-sm">Track library entry, exit, seat usage, and visit history.</p></div><Badge variant="success" dot>{activeCount} active now</Badge></div>
    <SessionSummaryCards total={sessions.length} active={activeCount} completed={completedSessions.length} averageDuration={averageDuration} />
    {successMessage && <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm text-emerald-800"><span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />{successMessage}</span><button type="button" className="text-xs font-semibold text-emerald-700 hover:text-emerald-900" onClick={() => setSuccessMessage('')}>Dismiss</button></div>}
    <SessionFilters searchQuery={searchQuery} onSearchChange={(value) => updateFilter(setSearchQuery, value)} status={status} onStatusChange={(value) => updateFilter(setStatus, value)} section={section} onSectionChange={(value) => updateFilter(setSection, value)} dateRange={dateRange} onDateRangeChange={(value) => updateFilter(setDateRange, value)} onClear={clearFilters} isFiltered={isFiltered} />
    <Card><CardHeader title="Session History" subtitle={`${filteredSessions.length} ${filteredSessions.length === 1 ? 'session' : 'sessions'} found`} action={<span className="hidden items-center gap-1.5 text-xs text-slate-400 sm:flex"><History className="h-3.5 w-3.5" />Page {currentPage} of {pageCount}</span>} /><SessionTable sessions={pageSessions} onView={(session) => setSelectedSessionId(session.id)} onMarkExit={setPendingExit} /><div className="md:hidden"><div className="divide-y divide-slate-100">{pageSessions.map((session) => <SessionCard key={session.id} session={session} onView={(currentSession) => setSelectedSessionId(currentSession.id)} onMarkExit={setPendingExit} />)}</div></div>{!pageSessions.length && <EmptyState isFiltered={isFiltered} onClear={clearFilters} />}<Pagination page={currentPage} pageCount={pageCount} resultCount={filteredSessions.length} onPrevious={() => setPage((currentPageValue) => Math.max(1, currentPageValue - 1))} onNext={() => setPage((currentPageValue) => Math.min(pageCount, currentPageValue + 1))} /></Card>
    <SessionDetailsModal session={selectedSession} onClose={() => setSelectedSessionId(null)} />
    {pendingExit && <ExitConfirmation session={pendingExit} onCancel={() => setPendingExit(null)} onConfirm={markExit} />}
  </div>
}

function EmptyState({ isFiltered, onClear }: { isFiltered: boolean; onClear: () => void }) { return <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center"><History className="h-8 w-8 text-slate-300" /><div><p className="font-semibold text-slate-800">No sessions found</p><p className="mt-1 text-xs text-slate-500">Try adjusting your search or filters.</p></div>{isFiltered && <Button variant="outline" size="sm" onClick={onClear}>Clear filters</Button>}</div> }

function Pagination({ page, pageCount, resultCount, onPrevious, onNext }: { page: number; pageCount: number; resultCount: number; onPrevious: () => void; onNext: () => void }) { return <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/40 px-5 py-3 sm:px-6"><span className="text-xs text-slate-500">{resultCount ? `Showing ${(page - 1) * PAGE_SIZE + 1}-${Math.min(page * PAGE_SIZE, resultCount)} of ${resultCount}` : 'No results'}</span><div className="flex items-center gap-2"><Button variant="outline" size="sm" icon={<ChevronLeft className="h-3.5 w-3.5" />} onClick={onPrevious} disabled={page === 1}>Previous</Button><span className="min-w-16 text-center text-xs font-medium text-slate-600">{page} / {pageCount}</span><Button variant="outline" size="sm" icon={<ChevronRight className="h-3.5 w-3.5" />} onClick={onNext} disabled={page === pageCount}>Next</Button></div></div> }

function ExitConfirmation({ session, onCancel, onConfirm }: { session: LibrarySession; onCancel: () => void; onConfirm: () => void }) { return <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><button type="button" className="absolute inset-0 bg-slate-900/40 backdrop-blur-2xs" onClick={onCancel} aria-label="Close exit confirmation" /><div role="dialog" aria-modal="true" aria-labelledby="exit-confirmation-title" className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"><div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><LogOut className="h-5 w-5" /></div><div><h2 id="exit-confirmation-title" className="font-semibold text-slate-900">Mark session exit?</h2><p className="mt-1 text-sm leading-relaxed text-slate-500">Complete {session.studentName}'s active session at seat {session.seatNumber}. The duration will be calculated locally.</p></div></div><div className="mt-6 flex justify-end gap-2"><Button variant="outline" size="md" onClick={onCancel}>Cancel</Button><Button variant="primary" size="md" onClick={onConfirm}>Mark Exit</Button></div></div></div> }
