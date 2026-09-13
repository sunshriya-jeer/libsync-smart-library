import { Edit3, Mail, ShieldCheck } from 'lucide-react'
import type { AdminProfile as AdminProfileData } from './mockSettings'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

interface AdminProfileProps { value: AdminProfileData; onEdit: () => void }

export function AdminProfile({ value, onEdit }: AdminProfileProps) {
  return <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div className="flex items-center gap-4"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"><ShieldCheck className="h-7 w-7" /></div><div><h3 className="font-semibold text-slate-900">{value.name}</h3><p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><Mail className="h-3.5 w-3.5" />{value.email}</p><div className="mt-2 flex flex-wrap gap-2"><Badge variant="primary" size="sm">{value.role}</Badge><Badge variant="outline" size="sm">{value.library}</Badge></div></div></div><Button type="button" variant="outline" size="md" icon={<Edit3 className="h-4 w-4" />} onClick={onEdit}>Edit Profile</Button></div>
}
