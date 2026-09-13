import { BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../ui/Card'
import type { SectionUsageData } from './mockReports'

export function SectionUsage({ data }: { data: SectionUsageData[] }) {
  const max = Math.max(...data.map((item) => item.visits), 1)
  const busiest = data.reduce((highest, item) => item.visits > highest.visits ? item : highest, data[0])
  return <Card><CardHeader title="Section-Wise Usage" subtitle="Visit distribution across library sections" action={<BarChart3 className="h-4 w-4 text-slate-400" />} /><CardContent className="space-y-4 p-5 sm:p-6">{data.map((item) => <div key={item.section} className="space-y-1.5"><div className="flex items-center justify-between text-xs"><span className="font-semibold text-slate-700">Section {item.section}</span><span className="font-mono font-semibold text-slate-600">{item.visits} visits</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${item.section === busiest.section ? 'bg-indigo-600' : 'bg-sky-400'}`} style={{ width: `${(item.visits / max) * 100}%` }} /></div></div>)}<p className="border-t border-slate-100 pt-3 text-xs text-slate-500"><span className="font-semibold text-slate-800">Highest usage:</span> Section {busiest.section}</p></CardContent></Card>
}
