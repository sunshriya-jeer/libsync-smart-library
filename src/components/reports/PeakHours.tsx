import { Clock3 } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../ui/Card'
import type { PeakHourData } from '../../services/reportService'

export function PeakHours({ data }: { data: PeakHourData[] }) {
  const hasActivity = data.length > 0 && data.some((point) => point.visits > 0)

  if (!hasActivity) {
    return (
      <Card>
        <CardHeader
          title="Peak Hours"
          subtitle="Busiest library periods"
          action={<Clock3 className="h-4 w-4 text-slate-400" />}
        />
        <CardContent className="p-5 sm:p-6">
          <div className="flex h-44 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
            <Clock3 className="mb-2 h-7 w-7 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">No hourly activity recorded</p>
            <p className="mt-1 text-xs text-slate-400">
              Peak hour trends will appear as library check-ins are logged.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const max = Math.max(...data.map((point) => point.visits), 1)
  const peak = data.reduce(
    (highest, point) => (point.visits > highest.visits ? point : highest),
    data[0]
  )

  return (
    <Card>
      <CardHeader
        title="Peak Hours"
        subtitle="Busiest library periods"
        action={<Clock3 className="h-4 w-4 text-slate-400" />}
      />
      <CardContent className="space-y-3 p-5 sm:p-6">
        {data.map((point) => (
          <div key={point.label} className="grid grid-cols-[3.5rem_1fr_2.5rem] items-center gap-3 text-xs">
            <span className="font-medium text-slate-500">{point.label}</span>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${
                  point.label === peak.label && peak.visits > 0 ? 'bg-indigo-600' : 'bg-indigo-300'
                }`}
                style={{ width: `${(point.visits / max) * 100}%` }}
              />
            </div>
            <span className="text-right font-mono font-semibold text-slate-700">{point.visits}</span>
          </div>
        ))}
        <p className="border-t border-slate-100 pt-3 text-xs text-slate-500">
          <span className="font-semibold text-slate-800">Busiest:</span> {peak.label} with {peak.visits} visits
        </p>
      </CardContent>
    </Card>
  )
}

