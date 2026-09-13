import { type ReactNode } from 'react'
import { Card, CardContent } from './Card'
import { cn } from '../../utils/cn'

export interface StatCardProps {
  title: string
  value: string | number
  icon: ReactNode
  trend?: {
    value: string
    isPositive?: boolean
    isNeutral?: boolean
  }
  description?: string
  accentClass?: string
  iconBgClass?: string
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  description,
  iconBgClass = 'bg-indigo-50 text-indigo-600',
}: StatCardProps) {
  return (
    <Card className="hover:border-slate-300 transition-colors">
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium text-slate-500 tracking-tight">
            {title}
          </span>
          <div
            className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-slate-100',
              iconBgClass
            )}
          >
            {icon}
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </span>
        </div>

        {(trend || description) && (
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            {trend && (
              <span
                className={cn(
                  'inline-flex items-center font-medium px-1.5 py-0.5 rounded text-[11px]',
                  trend.isNeutral
                    ? 'bg-slate-100 text-slate-700'
                    : trend.isPositive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-rose-50 text-rose-700'
                )}
              >
                {trend.value}
              </span>
            )}
            {description && (
              <span className="truncate text-slate-500">{description}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
