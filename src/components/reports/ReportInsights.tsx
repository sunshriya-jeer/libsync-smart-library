import { Lightbulb, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../ui/Card'

interface ReportInsightsProps {
  busiestHour: string
  busiestSection: string
  averageDuration: number
  periodLabel: string
  totalVisits?: number
}

export function ReportInsights({
  busiestHour,
  busiestSection,
  averageDuration,
  periodLabel,
  totalVisits,
}: ReportInsightsProps) {
  const hasData = (totalVisits === undefined || totalVisits > 0) && (busiestHour !== '—' || busiestSection !== '—')

  return (
    <Card>
      <CardHeader
        title="Insights"
        subtitle={`Highlights for ${periodLabel}`}
        action={<Lightbulb className="h-4 w-4 text-amber-500" />}
      />
      <CardContent className="space-y-3 p-5 sm:p-6">
        {hasData ? (
          <>
            {busiestHour !== '—' && (
              <Insight text={`Peak occupancy is concentrated around ${busiestHour}.`} />
            )}
            {busiestSection !== '—' && (
              <Insight text={`Section ${busiestSection} has the highest visit volume in this period.`} />
            )}
            <Insight
              text={
                averageDuration > 0
                  ? `Completed sessions average ${Math.floor(averageDuration / 60)}h ${averageDuration % 60}m.`
                  : 'No completed sessions recorded for duration calculation yet.'
              }
            />
          </>
        ) : (
          <Insight
            text={`No library visit data recorded yet for ${periodLabel}. Insights will appear automatically as students check in.`}
          />
        )}
      </CardContent>
    </Card>
  )
}

function Insight({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-slate-100 bg-slate-50/70 p-3 text-xs leading-relaxed text-slate-600">
      <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
      {text}
    </div>
  )
}

