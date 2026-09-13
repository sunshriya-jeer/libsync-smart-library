import { Card, CardContent, CardHeader } from '../ui/Card'
import type { VisitDataPoint } from './mockReports'

export function VisitsChart({ data }: { data: VisitDataPoint[] }) {
  const max = Math.max(...data.map((point) => point.visits), 1)
  const width = 720
  const height = 220
  const chartWidth = width - 48
  const chartHeight = height - 46
  const points = data.map((point, index) => `${24 + (index * chartWidth) / Math.max(data.length - 1, 1)},${height - 24 - (point.visits / max) * chartHeight}`).join(' ')
  return <Card><CardHeader title="Visits Over Time" subtitle="Library visit volume for the selected period" /><CardContent className="p-5 sm:p-6"><div className="overflow-hidden" role="img" aria-label={`Visits chart with ${data.map((point) => `${point.label}: ${point.visits}`).join(', ')}`}><svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" preserveAspectRatio="none"><line x1="24" y1={height - 24} x2={width - 24} y2={height - 24} stroke="#e2e8f0" /><polyline points={points} fill="none" stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />{data.map((point, index) => { const x = 24 + (index * chartWidth) / Math.max(data.length - 1, 1); const y = height - 24 - (point.visits / max) * chartHeight; return <g key={point.label}><circle cx={x} cy={y} r="5" fill="#fff" stroke="#4f46e5" strokeWidth="3" /><text x={x} y={height - 6} textAnchor="middle" fontSize="11" fill="#64748b">{point.label}</text><text x={x} y={y - 12} textAnchor="middle" fontSize="11" fontWeight="600" fill="#1e293b">{point.visits}</text></g> })}</svg></div></CardContent></Card>
}
