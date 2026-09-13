import { LogIn, LogOut, ArrowLeftRight, Clock } from 'lucide-react'
import { Card, CardHeader, CardContent } from '../ui/Card'
import { Badge } from '../ui/Badge'

interface ActivityItemData {
  id: string
  action: 'check-in' | 'check-out' | 'transfer'
  studentMask: string
  location: string
  timeAgo: string
  duration?: string
}

const ACTIVITIES: ActivityItemData[] = [
  {
    id: 'act-1',
    action: 'check-in',
    studentMask: 'STU-****4891',
    location: 'Zone A • Desk 24 (Silent)',
    timeAgo: '2m ago',
  },
  {
    id: 'act-2',
    action: 'transfer',
    studentMask: 'STU-****7312',
    location: 'Moved from Desk 12 to Hub Table 03',
    timeAgo: '6m ago',
  },
  {
    id: 'act-3',
    action: 'check-out',
    studentMask: 'STU-****9024',
    location: 'Zone B • Desk 19',
    timeAgo: '11m ago',
    duration: 'Session: 1h 45m',
  },
  {
    id: 'act-4',
    action: 'check-in',
    studentMask: 'STU-****1508',
    location: 'Zone C • Collaborative Table 2',
    timeAgo: '14m ago',
  },
  {
    id: 'act-5',
    action: 'check-out',
    studentMask: 'STU-****6739',
    location: 'Zone A • Desk 08',
    timeAgo: '22m ago',
    duration: 'Session: 3h 10m',
  },
]

export function RecentActivityFeed() {
  const getActionBadge = (action: ActivityItemData['action']) => {
    switch (action) {
      case 'check-in':
        return (
          <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <LogIn className="w-4 h-4" />
          </span>
        )
      case 'check-out':
        return (
          <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center shrink-0">
            <LogOut className="w-4 h-4" />
          </span>
        )
      case 'transfer':
        return (
          <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
            <ArrowLeftRight className="w-4 h-4" />
          </span>
        )
    }
  }

  const getActionLabel = (action: ActivityItemData['action']) => {
    switch (action) {
      case 'check-in':
        return <Badge variant="success" size="sm">Check-in</Badge>
      case 'check-out':
        return <Badge variant="default" size="sm">Check-out</Badge>
      case 'transfer':
        return <Badge variant="primary" size="sm">Seat Switch</Badge>
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader
        title="Recent Activity"
        subtitle="Live feed of student entries and seat allocations"
      />

      <CardContent className="p-0 flex-1">
        <div className="divide-y divide-slate-100">
          {ACTIVITIES.map((item) => (
            <div
              key={item.id}
              className="p-4 sm:px-6 hover:bg-slate-50/60 transition-colors flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {getActionBadge(item.action)}

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-900 tracking-tight">
                      {item.studentMask}
                    </span>
                    {getActionLabel(item.action)}
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {item.location}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="flex items-center justify-end gap-1 text-[11px] text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>{item.timeAgo}</span>
                </div>
                {item.duration && (
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {item.duration}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 sm:px-6 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs text-slate-500">
          <span>Showing 5 most recent live events</span>
          <span className="text-slate-400 font-mono text-[11px]">Auto-streaming</span>
        </div>
      </CardContent>
    </Card>
  )
}
