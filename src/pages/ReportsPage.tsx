import { useState, useEffect, useMemo, useCallback } from 'react'
import { AlertCircle, BarChart3, Loader2, RefreshCw } from 'lucide-react'
import type { LibrarySeat, LibrarySession, ReportPeriod } from '../types'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { ReportInsights } from '../components/reports/ReportInsights'
import { PeakHours } from '../components/reports/PeakHours'
import { ReportPeriodFilter } from '../components/reports/ReportPeriodFilter'
import { ReportSummaryCards } from '../components/reports/ReportSummaryCards'
import { SectionUsage } from '../components/reports/SectionUsage'
import { SeatUtilization } from '../components/reports/SeatUtilization'
import { SessionDuration } from '../components/reports/SessionDuration'
import { VisitsChart } from '../components/reports/VisitsChart'
import { fetchLibrarySessions } from '../services/sessionService'
import { fetchSeats } from '../services/seatService'
import {
  calculateReportAnalytics,
  PERIOD_LABELS,
} from '../services/reportService'

export function ReportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>('sevenDays')
  const [sessions, setSessions] = useState<LibrarySession[]>([])
  const [seats, setSeats] = useState<LibrarySeat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const handleRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true)
      setLoadError(null)

      const [loadedSessions, loadedSeats] = await Promise.all([
        fetchLibrarySessions(),
        fetchSeats(),
      ])

      setSessions(loadedSessions)
      setSeats(loadedSeats)
    } catch (err: unknown) {
      console.error('[ReportsPage] Failed to refresh reporting data:', err)
      setLoadError(
        err instanceof Error
          ? err.message
          : 'Unable to connect to the library database. Please check your connection and try again.'
      )
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  const handleRetry = useCallback(async () => {
    try {
      setIsLoading(true)
      setLoadError(null)

      const [loadedSessions, loadedSeats] = await Promise.all([
        fetchLibrarySessions(),
        fetchSeats(),
      ])

      setSessions(loadedSessions)
      setSeats(loadedSeats)
    } catch (err: unknown) {
      console.error('[ReportsPage] Failed to retry reporting data:', err)
      setLoadError(
        err instanceof Error
          ? err.message
          : 'Unable to connect to the library database. Please check your connection and try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadInitialData = async () => {
      try {
        const [loadedSessions, loadedSeats] = await Promise.all([
          fetchLibrarySessions(),
          fetchSeats(),
        ])
        if (isMounted) {
          setSessions(loadedSessions)
          setSeats(loadedSeats)
          setLoadError(null)
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.error('[ReportsPage] Failed to load reporting data:', err)
          setLoadError(
            err instanceof Error
              ? err.message
              : 'Unable to connect to the library database. Please check your connection and try again.'
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadInitialData()

    return () => {
      isMounted = false
    }
  }, [])

  const analytics = useMemo(() => {
    return calculateReportAnalytics(sessions, seats, period)
  }, [sessions, seats, period])

  if (isLoading && sessions.length === 0 && seats.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-sm font-medium text-slate-700">Loading library analytics...</p>
        <p className="text-xs text-slate-400">Querying real-time sessions and seat inventory</p>
      </div>
    )
  }

  if (loadError && sessions.length === 0) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/60 p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-rose-900">Failed to load reports</h3>
        <p className="mt-1.5 max-w-md text-xs leading-relaxed text-rose-600">{loadError}</p>
        <Button
          variant="primary"
          size="sm"
          onClick={handleRetry}
          className="mt-5"
          icon={<RefreshCw className="h-3.5 w-3.5" />}
        >
          Retry Connection
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="primary" size="sm">
              Operational analytics
            </Badge>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-medium text-slate-500">Live Supabase data</span>
          </div>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Reports &amp; Analytics
          </h2>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Understand library usage, occupancy, and seat utilization.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
            icon={<RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
            aria-label="Refresh reports data"
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <ReportPeriodFilter period={period} onChange={setPeriod} />
        </div>
      </div>

      {loadError && (
        <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/90 p-3.5 text-xs text-amber-800">
          <span>Notice: Could not refresh latest records ({loadError}). Displaying cached state.</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="text-amber-800 hover:bg-amber-100"
          >
            Retry
          </Button>
        </div>
      )}

      {/* 4 KPI Summary Cards */}
      <ReportSummaryCards
        totalVisits={analytics.summary.totalVisits}
        averageDuration={analytics.summary.averageDuration}
        peakOccupancy={analytics.summary.peakOccupancy}
        utilization={analytics.summary.utilization}
      />

      {/* Visits Over Time Line Chart */}
      <VisitsChart data={analytics.visits} />

      {/* Peak Hours and Seat Utilization */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PeakHours data={analytics.peakHours} />
        <SeatUtilization seats={seats} />
      </div>

      {/* Section Usage and Session Duration */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionUsage data={analytics.sectionUsage} />
        <SessionDuration sessions={analytics.periodSessions} />
      </div>

      {/* Insights */}
      <ReportInsights
        busiestHour={analytics.busiestHour}
        busiestSection={analytics.busiestSection}
        averageDuration={analytics.averageDuration}
        periodLabel={PERIOD_LABELS[period]}
        totalVisits={analytics.summary.totalVisits}
      />

      {/* Footer Info Banner */}
      <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50 p-3 text-xs text-slate-500">
        <BarChart3 className="h-4 w-4 shrink-0 text-indigo-600" />
        Analytics are calculated in real-time from active and historical library sessions and seat inventory.
      </div>
    </div>
  )
}
