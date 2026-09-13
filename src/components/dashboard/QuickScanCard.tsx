import { useState } from 'react'
import { Link } from 'react-router-dom'
import { QrCode, Camera, ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react'
import { Card, CardHeader, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { cn } from '../../utils/cn'

export function QuickScanCard() {
  const [selectedMode, setSelectedMode] = useState<'checkin' | 'seat' | 'checkout'>('checkin')

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader
        title="Quick Scan"
        subtitle="Rapid QR entry for student check-ins and seat assignment"
        action={
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Scanner Ready
          </span>
        }
      />

      <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
        {/* Mode Selector */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-medium">
          <button
            type="button"
            onClick={() => setSelectedMode('checkin')}
            className={cn(
              'py-1.5 px-2 rounded-md transition-all cursor-pointer truncate',
              selectedMode === 'checkin'
                ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            1. Check In
          </button>
          <button
            type="button"
            onClick={() => setSelectedMode('seat')}
            className={cn(
              'py-1.5 px-2 rounded-md transition-all cursor-pointer truncate',
              selectedMode === 'seat'
                ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            2. Claim Seat
          </button>
          <button
            type="button"
            onClick={() => setSelectedMode('checkout')}
            className={cn(
              'py-1.5 px-2 rounded-md transition-all cursor-pointer truncate',
              selectedMode === 'checkout'
                ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            3. Check Out
          </button>
        </div>

        {/* Viewfinder Mockup Placeholder */}
        <div className="relative rounded-xl bg-slate-900 text-white p-6 flex flex-col items-center justify-center text-center overflow-hidden border border-slate-800 min-h-[190px]">
          {/* Viewfinder corner brackets */}
          <div className="absolute inset-4 pointer-events-none border-2 border-dashed border-indigo-400/40 rounded-lg flex flex-col justify-between p-2">
            <div className="flex justify-between">
              <span className="w-3 h-3 border-t-2 border-l-2 border-indigo-400" />
              <span className="w-3 h-3 border-t-2 border-r-2 border-indigo-400" />
            </div>
            <div className="flex justify-between">
              <span className="w-3 h-3 border-b-2 border-l-2 border-indigo-400" />
              <span className="w-3 h-3 border-b-2 border-r-2 border-indigo-400" />
            </div>
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/30 text-indigo-300 flex items-center justify-center mb-3 border border-indigo-500/30">
              <QrCode className="w-6 h-6 text-indigo-300" />
            </div>
            <p className="text-sm font-semibold text-white tracking-tight">
              Ready to Scan Student QR
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Point student badge or seat QR code toward the scanning frame.
            </p>
          </div>
        </div>

        {/* Workflow Info Steps */}
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate">Instant validation</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
            <RefreshCw className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="truncate">Updates local seat map</span>
          </div>
        </div>

        {/* Action Button to Full Station */}
        <Link to="/scanner" className="block pt-1">
          <Button
            variant="primary"
            className="w-full"
            icon={<Camera className="w-4 h-4" />}
          >
            <span>Launch Dedicated Scanner Station</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
