import { useEffect, useState } from 'react'
import { LogIn, LogOut, Clock, Loader2, RefreshCw } from 'lucide-react'
import { Card, CardHeader, CardContent } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { fetchRecentScans, type RecentScanRecord } from '../../services/sessionService'

export interface RecentActivityFeedProps {
  scans?: RecentScanRecord[]
  isLoading?: boolean
  onRefresh?: () => void
}

function getRelativeTime(isoString?: string | null): string {
  if (!isoString) return 'Just now'
  const diffMs = Date.now() - new Date(isoString).getTime()
  if (isNaN(diffMs) || diffMs < 0) return 'Just now'
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function RecentActivityFeed({
  scans: propScans,
  isLoading: propIsLoading,
  onRefresh,
}: RecentActivityFeedProps = {}) {
  const hasProps = propScans !== undefined

  const [internalScans, setInternalScans] = useState<RecentScanRecord[]>([])
  const [internalLoading, setInternalLoading] = useState(!hasProps)

  useEffect(() => {
    if (hasProps) return

    let isMounted = true

    fetchRecentScans(10)
      .then((data) => {
        if (isMounted) {
          setInternalScans(data)
        }
      })
      .catch((err) => {
        console.error('[RecentActivityFeed] Failed to load scans:', err)
      })
      .finally(() => {
        if (isMounted) {
          setInternalLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [hasProps])

  const scans = propScans ?? internalScans
  const isLoading = propIsLoading ?? internalLoading

  return (
    <Card className="flex flex-col">
      <CardHeader
        title="Recent Activity"
        subtitle="Live feed of student entries and seat allocations"
        action={
          onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title="Refresh Activity"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          )
        }
      />

      <CardContent className="p-0 flex-1">
        {isLoading && scans.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin mb-2 text-indigo-600" />
            <span>Loading recent activity...</span>
          </div>
        ) : scans.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-slate-700">No Recent Scan Activity</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Check-in and check-out events from the circulation desk scanner will appear here in real time.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {scans.map((item) => {
              const isEntry = item.action === 'entry'
              const relativeTime = getRelativeTime(item.activityTime)

              return (
                <div
                  key={item.id}
                  className="p-4 sm:px-6 hover:bg-slate-50/60 transition-colors flex items-center justify-between gap-3 min-w-0"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {isEntry ? (
                      <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                        <LogIn className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center shrink-0">
                        <LogOut className="w-4 h-4" />
                      </span>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-semibold text-xs text-slate-900 tracking-tight truncate">
                          {item.studentName}
                        </span>
                        <span className="font-mono text-[11px] text-slate-400 shrink-0">
                          ({item.studentId})
                        </span>
                        <Badge
                          variant={isEntry ? 'success' : 'default'}
                          size="sm"
                          className="shrink-0"
                        >
                          {isEntry ? 'Check-in' : 'Check-out'}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        Seat: <span className="font-medium text-slate-700">{item.seatNumber}</span>
                        {item.collegeBarcode && (
                          <span className="text-slate-400 ml-2 text-[11px]">
                            • Barcode: {item.collegeBarcode}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex items-center justify-end gap-1 text-[11px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{relativeTime}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 hidden sm:block">
                      {item.formattedTime}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="p-4 sm:px-6 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs text-slate-500">
          <span>
            Showing {scans.length} most recent live {scans.length === 1 ? 'event' : 'events'}
          </span>
          <span className="text-slate-400 font-mono text-[11px]">Live Database</span>
        </div>
      </CardContent>
    </Card>
  )
}
