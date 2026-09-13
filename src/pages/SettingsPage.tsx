import { useState } from 'react'
import { CheckCircle2, RotateCcw, Save, Settings2 } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { AdminProfile } from '../components/settings/AdminProfile'
import { EditProfileModal } from '../components/settings/EditProfileModal'
import { LibraryInformation } from '../components/settings/LibraryInformation'
import { LibraryPreferences } from '../components/settings/LibraryPreferences'
import { SeatConfiguration } from '../components/settings/SeatConfiguration'
import { SettingsNavigation, type SettingsSection } from '../components/settings/SettingsNavigation'
import { INITIAL_MOCK_SETTINGS, getSeatCounts, type MockSettings } from '../components/settings/mockSettings'
import { INITIAL_MOCK_SEATS } from '../components/seats/mockSeats'

export function SettingsPage() {
  const [draft, setDraft] = useState<MockSettings>(INITIAL_MOCK_SETTINGS)
  const [activeSection, setActiveSection] = useState<SettingsSection>('library')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState('')
  const [showReset, setShowReset] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const counts = getSeatCounts(INITIAL_MOCK_SEATS)

  const updateLibrary = (field: keyof MockSettings['library'], value: string | Record<'A' | 'B' | 'C' | 'D', boolean>) => setDraft((current) => ({ ...current, library: { ...current.library, [field]: value } }))
  const updatePreference = (field: keyof MockSettings['preferences'], value: boolean) => setDraft((current) => ({ ...current, preferences: { ...current.preferences, [field]: value } }))

  const validate = () => {
    const nextErrors: Record<string, string> = {}
    const library = draft.library
    if (!library.libraryName.trim()) nextErrors.libraryName = 'Library name is required.'
    if (!library.libraryCode.trim()) nextErrors.libraryCode = 'Library code is required.'
    if (!/^\S+@\S+\.\S+$/.test(library.contactEmail)) nextErrors.contactEmail = 'Enter a valid contact email.'
    if (!library.openingTime) nextErrors.openingTime = 'Opening time is required.'
    if (!library.closingTime) nextErrors.closingTime = 'Closing time is required.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const saveChanges = () => {
    if (!validate()) { setSuccessMessage(''); setActiveSection('library'); return }
    setSuccessMessage('Settings saved successfully.')
  }

  const resetSettings = () => {
    setDraft(INITIAL_MOCK_SETTINGS)
    setErrors({})
    setSuccessMessage('Settings restored to the demo defaults.')
    setShowReset(false)
  }

  const saveProfile = (profile: MockSettings['admin']) => {
    const next = { ...draft, admin: profile }
    setDraft(next)
    setShowProfile(false)
    setSuccessMessage('Administrator profile updated.')
  }

  return <div className="space-y-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><div className="flex items-center gap-2"><Badge variant="primary" size="sm">Administration</Badge><span className="text-xs text-slate-400">•</span><span className="text-xs font-medium text-slate-500">Local configuration</span></div><h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Settings</h2><p className="mt-1 text-xs text-slate-500 sm:text-sm">Manage library configuration, preferences, and administrator settings.</p></div><div className="flex gap-2"><Button type="button" variant="outline" size="md" icon={<RotateCcw className="h-4 w-4" />} onClick={() => setShowReset(true)}>Reset</Button><Button type="button" variant="primary" size="md" icon={<Save className="h-4 w-4" />} onClick={saveChanges}>Save Changes</Button></div></div>{successMessage && <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm text-emerald-800"><CheckCircle2 className="h-4 w-4" />{successMessage}</div>}<div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]"><SettingsNavigation activeSection={activeSection} onChange={setActiveSection} /><div className="min-w-0">{activeSection === 'library' && <Card><CardHeader title="Library Information" subtitle="Basic identity and operating hours" /><CardContent><LibraryInformation value={draft.library} errors={errors} onChange={updateLibrary} /></CardContent></Card>}{activeSection === 'seats' && <Card><CardHeader title="Seat Configuration" subtitle="Capacity and section preferences from the current mock seat system" /><CardContent><SeatConfiguration value={draft.library} counts={counts} onChange={updateLibrary} /></CardContent></Card>}{activeSection === 'preferences' && <Card><CardHeader title="Library Preferences" subtitle="Local display and workflow options" /><CardContent><LibraryPreferences value={draft.preferences} onChange={updatePreference} /></CardContent></Card>}{activeSection === 'administrator' && <Card><CardHeader title="Administrator" subtitle="Demo administrator profile for this local workspace" /><CardContent><AdminProfile value={draft.admin} onEdit={() => setShowProfile(true)} /></CardContent></Card>}<div className="mt-4 flex items-center gap-2 text-xs text-slate-400"><Settings2 className="h-4 w-4" />Changes are stored in local page state only.</div></div></div>{showProfile && <EditProfileModal profile={draft.admin} onClose={() => setShowProfile(false)} onSave={saveProfile} />}{showReset && <ResetConfirmation onCancel={() => setShowReset(false)} onConfirm={resetSettings} />}</div>
}

function ResetConfirmation({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) { return <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><button type="button" className="absolute inset-0 bg-slate-900/40 backdrop-blur-2xs" onClick={onCancel} aria-label="Close reset confirmation" /><div role="dialog" aria-modal="true" aria-labelledby="reset-title" className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"><h2 id="reset-title" className="font-semibold text-slate-900">Reset settings?</h2><p className="mt-1 text-sm leading-relaxed text-slate-500">Restore all library information, preferences, and section options to the demo defaults.</p><div className="mt-6 flex justify-end gap-2"><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button><Button type="button" variant="danger" onClick={onConfirm}>Reset settings</Button></div></div></div> }
