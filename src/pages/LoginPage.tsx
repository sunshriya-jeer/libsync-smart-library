import { useEffect, useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { BookOpenCheck, LoaderCircle, LockKeyhole, Mail } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'

export function LoginPage() {
  const { session, profile, isLoading, error, signInWithPassword, resetPasswordForEmail, clearError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [resetMessage, setResetMessage] = useState<string | null>(null)

  useEffect(() => {
    clearError()
  }, [clearError])

  if (isLoading) {
    return <AuthLoading />
  }

  if (session) {
    if (profile?.role === 'student') {
      return <Navigate to="/student" replace />
    }
    if (profile?.role === 'admin' || profile?.role === 'librarian') {
      return <Navigate to="/" replace />
    }
  }

  const toggleForgotPassword = () => {
    setIsForgotPassword((current) => !current)
    setFormError(null)
    setResetMessage(null)
    clearError()
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setFormError(null)
    clearError()
    const signInError = await signInWithPassword(email.trim(), password)
    setIsSubmitting(false)
    if (signInError) {
      setFormError(signInError)
      return
    }
    const destination = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/'
    navigate(destination, { replace: true })
  }

  const handleResetRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setFormError(null)
    setResetMessage(null)
    clearError()
    const resetError = await resetPasswordForEmail(email.trim())
    setIsSubmitting(false)
    if (resetError) {
      setFormError(resetError)
      return
    }
    setResetMessage('If an account exists for that email, a password reset link has been sent.')
  }

  const visibleError = formError ?? error

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

          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">{isForgotPassword ? 'Reset your password' : 'Welcome back'}</h2>
            <p className="mt-1 text-sm text-slate-500">{isForgotPassword ? 'Enter your email and we will send a reset link.' : 'Sign in to manage your library.'}</p>
          </div>

          <form className="space-y-4" onSubmit={isForgotPassword ? handleResetRequest : handleSubmit}>
            <label className="block text-sm font-medium text-slate-700">
              Email
              <span className="relative mt-1.5 block">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-hidden transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  placeholder="you@example.com"
                />
              </span>
            </label>

            {!isForgotPassword && <label className="block text-sm font-medium text-slate-700">
              Password
              <span className="relative mt-1.5 block">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-hidden transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  placeholder="Enter your password"
                />
              </span>
            </label>}

            {visibleError && (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700" role="alert">
                {visibleError}
              </p>
            )}
            {resetMessage && <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700" role="status">{resetMessage}</p>}

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting} icon={isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : undefined}>
              {isSubmitting ? (isForgotPassword ? 'Sending link...' : 'Signing in...') : (isForgotPassword ? 'Send reset link' : 'Sign in')}
            </Button>
            <button type="button" className="w-full text-center text-sm font-medium text-indigo-600 hover:text-indigo-700" onClick={toggleForgotPassword}>
              {isForgotPassword ? 'Return to sign in' : 'Forgot password?'}
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}

function AuthLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">
      <LoaderCircle className="h-6 w-6 animate-spin text-indigo-600" aria-label="Checking session" />
    </main>
  )
}