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

interface AuthProfile {
  role: AuthRole
}

interface AuthContextValue {
  session: Session | null
  profile: AuthProfile | null
  isLoading: boolean
  error: string | null
  isPasswordRecovery: boolean
  signInWithPassword: (email: string, password: string) => Promise<string | null>
  resetPasswordForEmail: (email: string) => Promise<string | null>
  updatePassword: (password: string) => Promise<string | null>
  signOut: () => Promise<string | null>
  getCurrentSession: () => Promise<Session | null>
  clearError: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

async function getProfile(userId: string, accessToken?: string): Promise<AuthProfile> {
  let query = supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)

  if (accessToken) {
    query = query.setHeader('Authorization', `Bearer ${accessToken}`)
  }

  const { data, error } = await query.maybeSingle()

  if (error) {
    console.error('[useAuth] Profile query failed:', {
      code: error.code,
      message: error.message,
      hint: error.hint,
      details: error.details,
    })
    throw new Error('Unable to load your profile.')
  }

  if (!data) {
    console.warn('[useAuth] No profile record found for user id:', userId)
    throw new Error('No library profile was found for this account.')
  }

  if (data.role !== 'admin' && data.role !== 'librarian' && data.role !== 'student') {
    throw new Error('Your account has an unsupported library role.')
  }

  return { role: data.role }
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
      const currentProfile = await getProfile(currentSession.user.id, currentSession.access_token)
      if (currentProfile.role === 'student' && !isRecoveryContext) {
        setProfile(null)
        setError('Student accounts cannot access the admin application.')
        await supabase.auth.signOut()
        setSession(null)
        return null
      }
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
      const message = getSignInErrorMessage(signInError)
      setError(message)
      return message
    }

    try {
      const currentProfile = await getProfile(data.session.user.id, data.session.access_token)
      if (currentProfile.role === 'student') {
        const message = 'Student accounts cannot access the admin application.'
        setError(message)
        await supabase.auth.signOut()
        return message
      }

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