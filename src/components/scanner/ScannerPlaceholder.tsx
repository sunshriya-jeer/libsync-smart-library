import { useState } from 'react'
import { ScanLine, Keyboard } from 'lucide-react'
import { Card, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { cn } from '../../utils/cn'

export function ScannerPlaceholder() {
  const [activeMode, setActiveMode] = useState<'admission' | 'seat' | 'checkout'>('admission')
  const [manualCode, setManualCode] = useState('')

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center sm:text-left">
        <div className="flex items-center gap-2">
          <Badge variant="primary" size="sm">Kiosk &amp; Desk Station</Badge>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-500 font-medium">Scan. Sit. Study. Sync.</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
          LibSync Scan Station
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Position digital student ID badge or physical desk QR code to trigger real-time library synchronization.
        </p>
      </div>

      {/* Mode Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setActiveMode('admission')}
          className={cn(
            'p-4 rounded-xl border text-left transition-all cursor-pointer',
            activeMode === 'admission'
              ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          )}
        >
          <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
            Step 1
          </div>
          <div className="font-semibold text-sm text-slate-900">Student Check-In</div>
          <div className="text-xs text-slate-500 mt-1">
            Admit student and record entry timestamp
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('seat')}
          className={cn(
            'p-4 rounded-xl border text-left transition-all cursor-pointer',
            activeMode === 'seat'
              ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          )}
        >
          <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
            Step 2
          </div>
          <div className="font-semibold text-sm text-slate-900">Seat QR Pairing</div>
          <div className="text-xs text-slate-500 mt-1">
            Scan desk QR to occupy seat and mark on map
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('checkout')}
          className={cn(
            'p-4 rounded-xl border text-left transition-all cursor-pointer',
            activeMode === 'checkout'
              ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          )}
        >
          <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
            Step 3
          </div>
          <div className="font-semibold text-sm text-slate-900">Check-Out &amp; Release</div>
          <div className="text-xs text-slate-500 mt-1">
            Release seat back to available pool
          </div>
        </button>
      </div>

      {/* Main Scanner Viewfinder Container */}
      <Card>
        <CardContent className="p-6 sm:p-8">
          <div className="relative aspect-16/10 sm:aspect-16/8 rounded-2xl bg-slate-950 flex flex-col items-center justify-center p-6 text-center overflow-hidden border border-slate-800">
            {/* Camera targeting brackets */}
            <div className="w-56 h-56 sm:w-64 sm:h-64 border-2 border-indigo-400/50 rounded-2xl flex flex-col justify-between p-3 relative">
              <div className="flex justify-between">
                <span className="w-4 h-4 border-t-2 border-l-2 border-indigo-400" />
                <span className="w-4 h-4 border-t-2 border-r-2 border-indigo-400" />
              </div>

              {/* Scanning visual indicator */}
              <div className="flex flex-col items-center gap-2">
                <ScanLine className="w-10 h-10 text-indigo-400 animate-pulse" />
                <span className="text-xs font-mono text-indigo-200 uppercase tracking-wider">
                  Awaiting QR Input
                </span>
              </div>

              <div className="flex justify-between">
                <span className="w-4 h-4 border-b-2 border-l-2 border-indigo-400" />
                <span className="w-4 h-4 border-b-2 border-r-2 border-indigo-400" />
              </div>
            </div>

            {/* Viewfinder footer note */}
            <p className="text-xs text-slate-400 mt-4 max-w-sm">
              Camera feeds will be integrated in subsequent tasks via WebRTC QR scanner.
            </p>
          </div>

          {/* Manual Input Fallback */}
          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Keyboard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Or manually type Student ID / Seat barcode (e.g. STU-10492)..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
            <Button
              variant="outline"
              size="md"
              className="w-full sm:w-auto shrink-0"
              onClick={() => alert(`LibSync: Manual entry for "${manualCode || 'STU-10492'}" will be verified.`)}
            >
              Submit ID
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
