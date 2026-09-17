import {
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { Badge } from '../ui/Badge'
import type { RecentScanRecord } from '../../services/sessionService'

interface RecentScansProps {
  records: RecentScanRecord[]
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
}

export function RecentScans({ records, isLoading, error, onRetry }: RecentScansProps) {
  return (
    <Card>
      <CardHeader
        title="Recent Scans"
        subtitle="Latest live scanner activity"
        action={<Clock3 className="h-4 w-4 text-slate-400" />}
      />
      <CardContent className="p-0">
        {isLoading && records.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2.5 p-8 text-center">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
            <p className="text-xs font-medium text-slate-500">Loading recent scans...</p>
          </div>
        ) : error && records.length === 0 ? (
          <div className="m-4 flex items-start justify-between gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
              <span className="leading-relaxed">{error}</span>
            </div>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="flex shrink-0 items-center gap-1 font-semibold text-rose-700 hover:text-rose-900"
              >
                <RefreshCw className="h-3 w-3" />
                Retry
              </button>
            )}
          </div>
        ) : records.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">No recent scans yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {records.slice(0, 5).map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between gap-3 px-5 py-3.5 sm:px-6"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      record.action === 'entry'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {record.action === 'entry' ? (
                      <ArrowDownLeft className="h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {record.studentName}
                    </p>
                    <p className="truncate font-mono text-[11px] text-slate-400">
                      {record.studentId}
                      {record.collegeBarcode ? ` • ${record.collegeBarcode}` : ''} • Seat{' '}
                      {record.seatNumber}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <Badge
                    variant={record.action === 'entry' ? 'success' : 'default'}
                    size="sm"
                    dot
                  >
                    {record.action === 'entry' ? 'Entry' : 'Exit'}
                  </Badge>
                  <span className="text-[11px] text-slate-400">{record.formattedTime}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1.5 border-t border-slate-100 bg-slate-50/50 px-5 py-3 text-xs text-slate-500 sm:px-6">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          Live session records from Supabase
        </div>
      </CardContent>
    </Card>
  )
}
