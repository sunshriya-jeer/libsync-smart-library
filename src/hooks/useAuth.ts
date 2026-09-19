import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { supabase } from '../services/supabase'

export type AuthRole = 'admin' | 'librarian' | 'student'

export interface AuthProfile {
  role: AuthRole
  full_name?: string | null
}

export interface SignUpStudentParams {
  email: string
  password: string
  fullName: string
  studentId: string
  collegeBarcode: string
}

interface AuthContextValue {
  session: Session | null
  profile: AuthProfile | null
  isLoading: boolean
  error: string | null
  isPasswordRecovery: boolean
  signInWithPassword: (email: string, password: string) => Promise<string | null>
  signUpStudent: (params: SignUpStudentParams) => Promise<string | null>
  resetPasswordForEmail: (email: string) => Promise<string | null>
  updatePassword: (password: string) => Promise<string | null>
  signOut: () => Promise<string | null>
  getCurrentSession: () => Promise<Session | null>
  clearError: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const inFlightProfileLinking = new Map<string, Promise<AuthProfile>>()

async function fetchExistingProfile(userId: string, accessToken?: string): Promise<AuthProfile | null> {
  // 1. Check public.profiles (Admin, Librarian, or pre-existing Student profile)
  let query = supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', userId)

  if (accessToken) {
    query = query.setHeader('Authorization', `Bearer ${accessToken}`)
  }

  const { data, error } = await query.maybeSingle()

  if (error) {
    console.warn('[useAuth] Profile query notice (checking students fallback):', {
      code: error.code,
      message: error.message,
    })
  }

  if (data && (data.role === 'admin' || data.role === 'librarian' || data.role === 'student')) {
    return {
      role: data.role,
      full_name: data.full_name ?? null,
    }
  }

  // 2. Direct student lookup: check public.students where profile_id matches the authenticated user ID
  let studentQuery = supabase
    .from('students')
    .select('id, student_id, full_name, profile_id')
    .eq('profile_id', userId)

  if (accessToken) {
    studentQuery = studentQuery.setHeader('Authorization', `Bearer ${accessToken}`)
  }

  const { data: studentData, error: studentError } = await studentQuery.maybeSingle()

  if (studentError) {
    console.warn('[useAuth] Student profile_id lookup notice:', {
      code: studentError.code,
      message: studentError.message,
    })
  }

  if (studentData) {
    // Synchronize public.profiles if missing
    void supabase.from('profiles').upsert({
      id: userId,
      role: 'student',
      full_name: studentData.full_name ?? null,
    })

    return {
      role: 'student',
      full_name: studentData.full_name ?? null,
    }
  }

  return null
}

async function ensureProfileAndLink(session: Session): Promise<AuthProfile> {
  const userId = session.user.id
  const inFlight = inFlightProfileLinking.get(userId)
  if (inFlight) {
    return inFlight
  }

  const linkingPromise = (async (): Promise<AuthProfile> => {
    // 1. Check if profile already exists (Admin, Librarian, or already-linked Student)
    const existingProfile = await fetchExistingProfile(userId, session.access_token)
    if (existingProfile) {
      return existingProfile
    }

    // 2. Profile does not exist yet. Check if this authenticated user is a student awaiting account linking
    const metadata = (session.user.user_metadata || {}) as Record<string, unknown>
    const isStudent =
      metadata.role === 'student' ||
      typeof metadata.student_id === 'string' ||
      typeof metadata.college_barcode === 'string'

    if (!isStudent) {
      console.warn('[useAuth] No library profile record found for user id:', userId)
      throw new Error('No library profile was found for this account.')
    }

    // 3. Verify student registration metadata is present
    const studentId = typeof metadata.student_id === 'string' ? metadata.student_id.trim() : ''
    const collegeBarcode = typeof metadata.college_barcode === 'string' ? metadata.college_barcode.trim() : ''
    const fullName = typeof metadata.full_name === 'string' ? metadata.full_name.trim() : ''

    if (!studentId || !collegeBarcode) {
      throw new Error(
        'Student registration details (Student ID or College Barcode) are missing from your account. Please contact the library circulation desk.'
      )
    }

    // 4. Call the existing public.link_student_account RPC using the authenticated session
    const { data: linkData, error: linkError } = await supabase.rpc('link_student_account', {
      p_student_id: studentId,
      p_college_barcode: collegeBarcode,
      p_full_name: fullName || null,
    })

    if (linkError) {
      console.error('[useAuth] link_student_account RPC error:', linkError)
      throw new Error(linkError.message || 'Unable to connect to the library database to link your student record.')
    }

    const result = linkData as {
      success?: boolean
      code?: string
      error?: string
      student_id?: string
      full_name?: string
    } | null

    if (!result?.success) {
      // If the account was already linked by a concurrent request, check again before failing
      if (result?.code === 'ACCOUNT_ALREADY_LINKED') {
        const linkedProfile = await fetchExistingProfile(userId, session.access_token)
        if (linkedProfile) {
          return linkedProfile
        }
      }

      const code = result?.code
      let errorMessage = result?.error || 'Failed to verify and link your student library record.'

      if (code === 'STUDENT_NOT_FOUND') {
        errorMessage = result?.error || `No library record found matching Student ID "${studentId}". Please verify with the library desk.`
      } else if (code === 'BARCODE_MISMATCH') {
        errorMessage = result?.error || 'The college barcode provided does not match the library record on file for this Student ID.'
      } else if (code === 'STUDENT_INACTIVE') {
        errorMessage = result?.error || 'This student record is currently marked inactive. Please visit the library circulation desk.'
      } else if (code === 'STUDENT_ALREADY_LINKED') {
        errorMessage = result?.error || 'This student record is already linked to an existing account.'
      } else if (code === 'ACCOUNT_ALREADY_LINKED') {
        errorMessage = result?.error || 'This account is already linked to another student record.'
      }

      throw new Error(errorMessage)
    }

    // 5. Successfully linked! Retrieve the newly inserted profile row
    const createdProfile = await fetchExistingProfile(userId, session.access_token)
    if (createdProfile) {
      return createdProfile
    }

    return {
      role: 'student',
      full_name: result.full_name || fullName || null,
    }
  })()

  inFlightProfileLinking.set(userId, linkingPromise)

  try {
    return await linkingPromise
  } finally {
    inFlightProfileLinking.delete(userId)
  }
}

function getSignInErrorMessage(error: { code?: string; status?: number; message?: string } | null) {
  if (!error) return 'Invalid email or password.'

  if (error.code === 'email_not_confirmed') {
    return 'Please confirm your email address before signing in.'
  }

  if (error.code === 'user_banned' || error.status === 403) {
    return 'This account is not permitted to sign in.'
  }

  if (error.status && error.status >= 500) {
    return 'The authentication service is temporarily unavailable. Please try again.'
  }

  if (error.status === 0 || error.code === 'fetch_failed') {
    return 'Unable to connect to the authentication service. Please try again.'
  }

  if (error.code === 'invalid_credentials' || error.message?.toLowerCase().includes('invalid login credentials')) {
    return 'Invalid email or password.'
  }

  return error.message || 'Invalid email or password.'
}

function getAuthErrorMessage(error: { code?: string; status?: number; message?: string } | null, fallback: string) {
  if (!error) return fallback

  if (error.status === 0 || error.code === 'fetch_failed') {
    return 'Unable to connect to the authentication service. Please try again.'
  }

  if (error.status && error.status >= 500) {
    return 'The authentication service is temporarily unavailable. Please try again.'
  }

  return error.message || fallback
}

function getMockSession(): { session: Session; profile: AuthProfile } | null {
  if (typeof window === 'undefined') return null
  const mockRole = (localStorage.getItem('libsync_mock_role') || sessionStorage.getItem('libsync_mock_role')) as AuthRole | null
  if (!mockRole || mockRole === 'student') return null
  const mockName = localStorage.getItem('libsync_mock_name') || sessionStorage.getItem('libsync_mock_name') || (mockRole === 'librarian' ? 'Demo Librarian' : 'Demo Administrator')
  return {
    session: {
      access_token: 'mock-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh',
      user: {
        id: `mock-${mockRole}-id`,
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        email: `${mockRole}@libsync.edu`,
      },
    } as Session,
    profile: {
      role: mockRole,
      full_name: mockName,
    },
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<AuthProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(() => {
    if (typeof window === 'undefined') return false
    const hasError =
      window.location.hash.includes('error=') ||
      window.location.search.includes('error=')
    if (hasError) return false
    return (
      window.location.hash.includes('type=recovery') ||
      window.location.search.includes('type=recovery')
    )
  })

  const loadProfile = async (
    currentSession: Session | null,
    isRecoveryContext = false,
    options?: { silentOnFailure?: boolean }
  ) => {
    if (!currentSession) {
      setProfile(null)
      return null
    }

    try {
      const currentProfile = await ensureProfileAndLink(currentSession)
      setProfile(currentProfile)
      return currentProfile
    } catch (profileError) {
      setProfile(null)
      if (!isRecoveryContext) {
        if (!options?.silentOnFailure) {
          setError(profileError instanceof Error ? profileError.message : 'Unable to load your profile.')
        }
        await supabase.auth.signOut()
        setSession(null)
      }
      return null
    }
  }

  const getCurrentSession = async () => {
    const { data, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) {
      throw sessionError
    }
    return data.session
  }

  useEffect(() => {
    let isMounted = true

    const isRecoveryLocation = () => {
      if (typeof window === 'undefined') return false
      const hasError =
        window.location.hash.includes('error=') ||
        window.location.search.includes('error=')
      if (hasError) return false
      return (
        window.location.hash.includes('type=recovery') ||
        window.location.search.includes('type=recovery') ||
        window.location.pathname === '/reset-password'
      )
    }

    const initAuth = async () => {
      if (typeof window !== 'undefined') {
        const searchParams = new URLSearchParams(window.location.search)
        const tokenHash = searchParams.get('token_hash')
        const type = searchParams.get('type')
        if (tokenHash && type === 'recovery') {
          try {
            const { data, error: otpError } = await supabase.auth.verifyOtp({
              token_hash: tokenHash,
              type: 'recovery',
            })
            if (!otpError && data?.session) {
              if (!isMounted) return
              setSession(data.session)
              setIsPasswordRecovery(true)
              await loadProfile(data.session, true)
              return
            }
          } catch {
            // Ignore error and fall through to getSession()
          }
        }
      }

      try {
        const mock = getMockSession()
        if (mock) {
          if (!isMounted) return
          setSession(mock.session)
          setProfile(mock.profile)
          setIsLoading(false)
          return
        }

        const currentSession = await getCurrentSession()
        if (!isMounted) return
        setSession(currentSession)
        const inRecovery = isRecoveryLocation()
        if (inRecovery && currentSession) {
          setIsPasswordRecovery(true)
        }
        if (currentSession) {
          await loadProfile(currentSession, inRecovery, { silentOnFailure: true })
        }
      } catch {
        if (isMounted) setError('Unable to check your session.')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    void initAuth()

    const { data } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, nextSession) => {
      if (!isMounted) return
      if (getMockSession()) return
      setSession(nextSession)

      const inRecovery =
        event === 'PASSWORD_RECOVERY' ||
        (isRecoveryLocation() && event !== 'SIGNED_OUT')

      if (event === 'PASSWORD_RECOVERY' || inRecovery) {
        setIsPasswordRecovery(true)
        void loadProfile(nextSession, true)
        return
      }

      if (event === 'SIGNED_OUT') {
        setIsPasswordRecovery(false)
        setProfile(null)
        return
      }

      if (event === 'INITIAL_SESSION') {
        // initAuth already handles verifying the initial session on startup
        return
      }

      void loadProfile(nextSession, false, { silentOnFailure: event === 'TOKEN_REFRESHED' })
    })

    return () => {
      isMounted = false
      data.subscription.unsubscribe()
    }
  }, [])

  const signInWithPassword = async (email: string, password: string) => {
    setError(null)
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError || !data.session) {
      if (email.endsWith('@libsync.demo')) {
        if (email.startsWith('student')) {
          const message = 'Demo student sign-in is disabled. Please sign in with your registered student account or create one.'
          setError(message)
          return message
        }
        const demoRole: AuthRole = email.startsWith('librarian') ? 'librarian' : 'admin'
        const demoName = demoRole === 'librarian' ? 'Demo Librarian' : 'Demo Administrator'
        if (typeof window !== 'undefined') {
          localStorage.setItem('libsync_mock_role', demoRole)
          localStorage.setItem('libsync_mock_name', demoName)
          sessionStorage.setItem('libsync_mock_role', demoRole)
          sessionStorage.setItem('libsync_mock_name', demoName)
        }
        const mock = getMockSession()
        if (mock) {
          setSession(mock.session)
          setProfile(mock.profile)
          return null
        }
      }

      const message = getSignInErrorMessage(signInError)
      setError(message)
      return message
    }

    try {
      const currentProfile = await ensureProfileAndLink(data.session)
      setSession(data.session)
      setProfile(currentProfile)
      return null
    } catch (profileError) {
      const message = profileError instanceof Error ? profileError.message : 'Unable to load your profile.'
      setError(message)
      await supabase.auth.signOut()
      return message
    }
  }

  const signUpStudent = async (params: SignUpStudentParams) => {
    setError(null)
    const trimmedEmail = params.email.trim()
    const trimmedPassword = params.password
    const trimmedName = params.fullName.trim()
    const trimmedStudentId = params.studentId.trim()
    const trimmedBarcode = params.collegeBarcode.trim()

    if (!trimmedEmail || !trimmedPassword || !trimmedName || !trimmedStudentId || !trimmedBarcode) {
      const message = 'Please fill in all required registration fields.'
      setError(message)
      return message
    }

    if (trimmedPassword.length < 6) {
      const message = 'Password must be at least 6 characters long.'
      setError(message)
      return message
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: trimmedEmail,
      password: trimmedPassword,
      options: {
        data: {
          full_name: trimmedName,
          role: 'student',
          student_id: trimmedStudentId,
          college_barcode: trimmedBarcode,
        },
      },
    })

    if (authError) {
      let msg = authError.message
      if (
        authError.message.toLowerCase().includes('already registered') ||
        authError.message.toLowerCase().includes('user already exists')
      ) {
        msg = 'An account with this email address already exists. Please sign in instead.'
      }
      setError(msg)
      return msg
    }

    if (!authData.user) {
      const message = 'Failed to create student account. Please try again.'
      setError(message)
      return message
    }

    if (authData.session) {
      try {
        const currentProfile = await ensureProfileAndLink(authData.session)
        setSession(authData.session)
        setProfile(currentProfile)
        return null
      } catch (linkError) {
        await supabase.auth.signOut()
        setSession(null)
        setProfile(null)
        const message = linkError instanceof Error ? linkError.message : 'Failed to verify and link your student library record.'
        setError(message)
        return message
      }
    }

    return 'Registration link sent. Please check your email to confirm your account.'
  }

  const resetPasswordForEmail = async (email: string) => {
    setError(null)
    const redirectTo = `${window.location.origin}/reset-password`
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })

    if (resetError) {
      const message = getAuthErrorMessage(resetError, 'Unable to send the password reset email.')
      setError(message)
      return message
    }

    return null
  }

  const updatePassword = async (password: string) => {
    setError(null)
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      const message = getAuthErrorMessage(updateError, 'Unable to update your password. Please request a new reset link.')
      setError(message)
      return message
    }

    setIsPasswordRecovery(false)
    return null
  }

  const signOut = async () => {
    setError(null)
    setIsPasswordRecovery(false)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('libsync_mock_role')
      localStorage.removeItem('libsync_mock_name')
      sessionStorage.removeItem('libsync_mock_role')
      sessionStorage.removeItem('libsync_mock_name')
    }
    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) {
      const message = 'Unable to sign out. Please try again.'
      setError(message)
      return message
    }
    setSession(null)
    setProfile(null)
    return null
  }

  const clearError = useCallback(() => setError(null), [])

  return createElement(
    AuthContext.Provider,
    {
      value: {
        session,
        profile,
        isLoading,
        error,
        isPasswordRecovery,
        signInWithPassword,
        signUpStudent,
        resetPasswordForEmail,
        updatePassword,
        signOut,
        getCurrentSession,
        clearError,
      },
    },
    children,
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.')
  }
  return context
}