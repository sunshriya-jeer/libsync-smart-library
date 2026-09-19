import { useState, useEffect } from 'react'
import { Calendar, MapPin, CheckCircle, Clock, LoaderCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { fetchCurrentStudent } from '../services/studentService'
import { fetchStudentSessions } from '../services/sessionService'
import type { LibrarySession } from '../types'

const ZONE_DESCRIPTIONS: Record<string, string> = {
  A: 'General Reading',
  B: 'Quiet Study',
  C: 'Tech & Laptop Hub',
  D: 'Collaborative Area',
}

export function StudentHistoryPage() {
  const [sessions, setSessions] = useState<LibrarySession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadHistory = async () => {
      try {
        const currentStudent = await fetchCurrentStudent()
        if (!isMounted) return

        if (!currentStudent?.id) {
          setSessions([])
          return
        }

        const realSessions = await fetchStudentSessions(currentStudent.id)
        if (!isMounted) return
        setSessions(realSessions)
      } catch (err: unknown) {
        if (!isMounted) return
        console.error('[StudentHistoryPage] Failed to load session history:', err)
        setErrorMessage(
          err instanceof Error ? err.message : 'Unable to load your library session history. Please try again.'
        )
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadHistory()

    return () => {
      isMounted = false
    }
  }, [])

  const handleRetry = () => {
    setIsLoading(true)
    setErrorMessage(null)
    fetchCurrentStudent()
      .then((student) => {
        if (!student?.id) {
          setSessions([])
          setIsLoading(false)
          return
        }
        return fetchStudentSessions(student.id).then((realSessions) => {
          setSessions(realSessions)
          setIsLoading(false)
        })
      })
      .catch((err: unknown) => {
        setErrorMessage(
          err instanceof Error ? err.message : 'Unable to load your library session history. Please try again.'
        )
        setIsLoading(false)
      })
  }

  // Calculate total study time from actual recorded sessions
  const totalStudyMinutes = sessions
    .filter((s) => s.durationMinutes)
    .reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0)

  const totalHours = (totalStudyMinutes / 60).toFixed(1)

  // Calculate favorite study zone based on frequency of visits
  const zoneCounts: Record<string, number> = {}
  for (const ses of sessions) {
    if (ses.section) {
      zoneCounts[ses.section] = (zoneCounts[ses.section] || 0) + 1
    }
  }

  let favoriteZoneLabel = '—'
  let favoriteZoneDesc = 'No recorded visits'
  let highestCount = 0

  for (const [section, count] of Object.entries(zoneCounts)) {
    if (count > highestCount) {
      highestCount = count
      favoriteZoneLabel = `Zone ${section}`
      favoriteZoneDesc = ZONE_DESCRIPTIONS[section] || 'Library Area'
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 text-slate-500">
        <LoaderCircle className="h-7 w-7 animate-spin text-indigo-600" />
        <p className="text-xs font-medium">Loading session history...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Badge variant="primary" size="sm">
            Activity Log
          </Badge>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-500 font-medium">Session Records</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
          Visit &amp; Study History
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Review your recorded library visits, assigned seats, and total study duration.
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs sm:text-sm text-rose-700 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
            <p>{errorMessage}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRetry}
            className="shrink-0 text-rose-700 hover:bg-rose-100"
            icon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Summary Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <p className="text-xs text-slate-500 font-medium">Total Visits</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{sessions.length}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
            {sessions.length === 1 ? '1 visit recorded' : `${sessions.length} visits recorded`}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <p className="text-xs text-slate-500 font-medium">Recorded Study Time</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalHours} hrs</p>
          <p className="text-[11px] text-indigo-600 font-semibold mt-0.5">
            {totalStudyMinutes > 0 ? `${totalStudyMinutes} total minutes` : 'Verified attendance'}
          </p>
        </div>
        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <p className="text-xs text-slate-500 font-medium">Favorite Zone</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{favoriteZoneLabel}</p>
          <p className="text-[11px] text-slate-400 mt-0.5 truncate">{favoriteZoneDesc}</p>
        </div>
      </div>

      {/* History List */}
      <Card>
        <CardHeader
          title="Past Sessions"
          subtitle="All check-ins logged by LibSync entrance kiosks"
        />
        <CardContent>
          {sessions.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No session history yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                Your study visits and seat allocations will appear here once you scan your digital pass at the entrance scanner kiosk.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {sessions.map((ses) => {
                const entryDate = new Date(ses.entryTime)
                const formattedDate = !isNaN(entryDate.getTime())
                  ? entryDate.toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Recent'
                const formattedTime = !isNaN(entryDate.getTime())
                  ? entryDate.toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '—'

                return (
                  <div key={ses.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Calendar className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900">
                            Seat {ses.seatNumber}
                          </p>
                          <Badge variant={ses.status === 'active' ? 'primary' : 'default'} size="sm">
                            Zone {ses.section}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{formattedDate} at {formattedTime}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-auto">
                      <div className="text-right text-xs">
                        <p className="font-semibold text-slate-800 flex items-center justify-end gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {ses.status === 'active'
                            ? 'Ongoing'
                            : ses.durationMinutes
                              ? `${ses.durationMinutes} mins`
                              : 'Completed'}
                        </p>
                        <p className="text-[10px] text-slate-400">Duration</p>
                      </div>

                      <div className="w-20 text-right">
                        {ses.status === 'active' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700">
                            <CheckCircle className="w-3 h-3" /> Done
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

