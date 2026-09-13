import { Database, Check } from 'lucide-react'
import { Card, CardHeader, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'

export function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          System Settings
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure library parameters, seat timeout policies, and hardware scanner connectivity.
        </p>
      </div>

      <Card>
        <CardHeader
          title="Library Facility Configuration"
          subtitle="Core capacity limits and operating rules"
        />
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Facility Name
              </label>
              <input
                type="text"
                defaultValue="Main Campus Central Library"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Total Seat Capacity
              </label>
              <input
                type="number"
                defaultValue={200}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Seat Inactivity Auto-Release
              </label>
              <select
                defaultValue="15"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900"
              >
                <option value="10">10 minutes</option>
                <option value="15">15 minutes (Standard)</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Seats unoccupied past this timer will revert to available.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Max Daily Session Duration
              </label>
              <select
                defaultValue="4"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900"
              >
                <option value="2">2 hours</option>
                <option value="4">4 hours (Recommended)</option>
                <option value="6">6 hours</option>
                <option value="8">8 hours</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title="Upcoming Backend &amp; Supabase Integration"
          subtitle="Connection readiness for upcoming development stages"
        />
        <CardContent className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">
                  Supabase Integration Phase
                </span>
                <Badge variant="outline" size="sm">Pending Next Task</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Supabase database tables (profiles, seats, sessions, attendance_logs) and real-time WebSocket broadcast channels will be connected in subsequent implementation phases.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              size="md"
              icon={<Check className="w-4 h-4" />}
              onClick={() => alert('LibSync: Settings saved (UI state only).')}
            >
              Save Configuration
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
