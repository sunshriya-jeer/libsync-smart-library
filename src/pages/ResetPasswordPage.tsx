import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpenCheck, CheckCircle2, LoaderCircle, LockKeyhole } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'

export function ResetPasswordPage() {
  const { session, profile, isLoading, isPasswordRecovery, updatePassword, signOut } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const urlError = useMemo(() => {
    if (typeof window === 'undefined') return null
    const hash = window.location.hash.startsWith('#')
      ? window.location.hash.slice(1)
      : window.location.hash
    const hashParams = new URLSearchParams(hash)
    const searchParams = new URLSearchParams(window.location.search)

    const desc = hashParams.get('error_description') || searchParams.get('error_description')
    if (desc) {
      return desc.replace(/\+/g, ' ')
    }

    const err = hashParams.get('error') || searchParams.get('error')
    if (err) {
      return 'The password reset link is invalid or has expired.'
    }

    return null
  }, [])

  if (isLoading) return <ResetLoading />

  if (urlError || (!session && !isPasswordRecovery)) {
    return (
      <AuthMessage
        title="Password reset link unavailable"
        body={urlError || 'This reset link is either invalid, already used, or has expired. Please request a new link.'}
        action={
          <Button type="button" onClick={() => navigate('/login')}>
            Return to sign in
          </Button>
        }
      />
    )
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setMessage(null)

    if (!session) {
      setError('No active password reset session was found. Please request a new link.')
      return
    }

    if (password.length < 6) {
      setError('Your new password must be at least 6 characters long.')
      return
    }

    if (password !== confirmation) {
      setError('The passwords do not match.')
      return
    }

    setIsSubmitting(true)
    const updateError = await updatePassword(password)
    setIsSubmitting(false)
    if (updateError) {
      setError(updateError)
      return
    }

    setMessage('Your password has been successfully updated.')
    setPassword('')
    setConfirmation('')
  }

  const handleSignInWithNewPassword = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  const handleGoToDashboard = () => {
    navigate(profile?.role === 'student' ? '/student' : '/', { replace: true })
  }

  const canGoToDashboard = Boolean(session && profile?.role)

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center justify-center">
        <section className="w-full rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <BookOpenCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">LibSync</h1>
              <p className="text-xs font-medium text-slate-400">Library administration</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Set a new password</h2>
          <p className="mt-1 text-sm text-slate-500">Choose a new password for your LibSync account.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <PasswordField label="New password" value={password} onChange={setPassword} />
            <PasswordField label="Confirm new password" value={confirmation} onChange={setConfirmation} />

            {error && (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700" role="alert">
                {error}
              </p>
            )}

            {message && (
              <p className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700" role="status">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                {message}
              </p>
            )}

            {!message && (
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
                icon={isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : undefined}
              >
                {isSubmitting ? 'Updating password...' : 'Update password'}
              </Button>
            )}

            {message && (
              <div className="space-y-2 pt-2">
                {canGoToDashboard && (
                  <Button type="submit" size="lg" className="w-full" onClick={handleGoToDashboard}>
                    Continue to dashboard
                  </Button>
                )}
                <Button
                  type="button"
                  variant={canGoToDashboard ? 'outline' : 'primary'}
                  size="lg"
                  className="w-full"
                  onClick={handleSignInWithNewPassword}
                >
                  Sign in with new password
                </Button>
              </div>
            )}

            {!message && (
              <button
                type="button"
                className="w-full text-center text-sm font-medium text-indigo-600 hover:text-indigo-700"
                onClick={() => navigate('/login')}
              >
                Return to sign in
              </button>
            )}
          </form>
        </section>
      </div>
    </main>
  )
}

function PasswordField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <span className="relative mt-1.5 block">
        <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="password"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-hidden transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </span>
    </label>
  )
}

function ResetLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <LoaderCircle className="h-6 w-6 animate-spin text-indigo-600" aria-label="Checking reset session" />
    </main>
  )
}

function AuthMessage({ title, body, action }: { title: string; body: string; action: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <section className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">{body}</p>
        <div className="mt-6">{action}</div>
      </section>
    </main>
  )
}