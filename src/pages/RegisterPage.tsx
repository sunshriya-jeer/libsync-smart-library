import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BookOpenCheck,
  CheckCircle2,
  GraduationCap,
  IdCard,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ScanBarcode,
  User,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'

export function RegisterPage() {
  const { isLoading, error, signUpStudent, clearError } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [studentId, setStudentId] = useState('')
  const [collegeBarcode, setCollegeBarcode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    clearError()
  }, [clearError])

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">
        <LoaderCircle className="h-6 w-6 animate-spin text-indigo-600" aria-label="Checking session" />
      </main>
    )
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)
    setSuccessMessage(null)
    clearError()

    const trimmedName = fullName.trim()
    const trimmedEmail = email.trim()
    const trimmedStudentId = studentId.trim()
    const trimmedBarcode = collegeBarcode.trim()

    if (!trimmedName) {
      setFormError('Please enter your full name.')
      return
    }

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setFormError('Please enter a valid institutional email address.')
      return
    }

    if (!trimmedStudentId) {
      setFormError('Student ID / PRN is required.')
      return
    }

    if (!trimmedBarcode) {
      setFormError('College Barcode is required. Please check your physical student ID card.')
      return
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match. Please re-enter your password.')
      return
    }

    setIsSubmitting(true)
    const err = await signUpStudent({
      email: trimmedEmail,
      password,
      fullName: trimmedName,
      studentId: trimmedStudentId,
      collegeBarcode: trimmedBarcode,
    })
    setIsSubmitting(false)

    if (err) {
      if (err.toLowerCase().includes('check your email') || err.toLowerCase().includes('confirm your account')) {
        setSuccessMessage(err)
        return
      }
      setFormError(err)
      return
    }

    // Success: navigate to the student portal
    navigate('/student', { replace: true })
  }

  const visibleError = formError ?? error

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg items-center justify-center">
        <section className="w-full rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                <BookOpenCheck className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">LibSync</h1>
                <p className="text-xs font-medium text-slate-400">Student Portal Registration</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 border border-indigo-100">
              <GraduationCap className="h-3.5 w-3.5" />
              Student Pass
            </span>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Create your account</h2>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Link your student library record to access your digital pass and attendance.
            </p>
          </div>

          {successMessage ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 text-sm flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
                <div>
                  <p className="font-semibold">Account registration initiated!</p>
                  <p className="mt-1 text-xs sm:text-sm text-emerald-700">{successMessage}</p>
                </div>
              </div>
              <Link to="/login" className="block">
                <Button variant="primary" size="lg" className="w-full">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Full Name */}
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Full Name <span className="text-rose-500">*</span>
                <span className="relative mt-1.5 block">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs sm:text-sm text-slate-900 outline-hidden transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    placeholder="e.g. Aarav Sharma"
                  />
                </span>
              </label>

              {/* Email */}
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Institutional Email <span className="text-rose-500">*</span>
                <span className="relative mt-1.5 block">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs sm:text-sm text-slate-900 outline-hidden transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    placeholder="student@campus.edu"
                  />
                </span>
              </label>

              {/* Student ID & College Barcode Grid */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Student ID / PRN <span className="text-rose-500">*</span>
                  <span className="relative mt-1.5 block">
                    <IdCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      required
                      className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs sm:text-sm font-mono text-slate-900 outline-hidden transition-colors placeholder:text-slate-400 placeholder:font-sans focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      placeholder="STU-2026-XXXX"
                    />
                  </span>
                </label>

                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  College Barcode <span className="text-rose-500">*</span>
                  <span className="relative mt-1.5 block">
                    <ScanBarcode className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={collegeBarcode}
                      onChange={(e) => setCollegeBarcode(e.target.value)}
                      required
                      className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs sm:text-sm font-mono text-slate-900 outline-hidden transition-colors placeholder:text-slate-400 placeholder:font-sans focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      placeholder="Card barcode number"
                    />
                  </span>
                </label>
              </div>
              <p className="text-[11px] text-slate-400">
                The College Barcode is printed on your physical college ID card issued during admission.
              </p>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password <span className="text-rose-500">*</span>
                  <span className="relative mt-1.5 block">
                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs sm:text-sm text-slate-900 outline-hidden transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      placeholder="Min. 6 chars"
                    />
                  </span>
                </label>

                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Confirm Password <span className="text-rose-500">*</span>
                  <span className="relative mt-1.5 block">
                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs sm:text-sm text-slate-900 outline-hidden transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      placeholder="Re-enter password"
                    />
                  </span>
                </label>
              </div>

              {visibleError && (
                <p className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-700 leading-relaxed" role="alert">
                  {visibleError}
                </p>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
                icon={isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : undefined}
              >
                {isSubmitting ? 'Verifying & Creating Account...' : 'Register & Link Account'}
              </Button>

              <div className="pt-2 text-center text-xs text-slate-500">
                Already registered?{' '}
                <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
                  Sign in here
                </Link>
              </div>
            </form>
          )}
        </section>
      </div>
    </main>
  )
}
