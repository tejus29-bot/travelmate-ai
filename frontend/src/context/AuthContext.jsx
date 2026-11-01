import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../services/supabase'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

// Demo user for when Supabase is not configured
const DEMO_USER = {
  id: 'demo-user-001',
  email: 'demo@travelmate.ai',
  user_metadata: {
    full_name: 'Demo Traveler',
    avatar_url: null,
  },
  created_at: new Date().toISOString(),
  isDemo: true,
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const isDemoMode = !supabase

  useEffect(() => {
    if (isDemoMode) {
      // In demo mode, check localStorage for a fake session
      const demoLoggedIn = localStorage.getItem('travelmate_demo_logged_in')
      if (demoLoggedIn === 'true') {
        setUser(DEMO_USER)
        setSession({ access_token: 'demo-token', user: DEMO_USER })
      }
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [isDemoMode])

  const signUp = useCallback(async ({ email, password, fullName }) => {
    if (isDemoMode) {
      // Demo mode: fake signup
      localStorage.setItem('travelmate_demo_logged_in', 'true')
      setUser(DEMO_USER)
      setSession({ access_token: 'demo-token', user: DEMO_USER })
      toast.success('Welcome to TravelMate AI! (Demo Mode)')
      return { data: { user: DEMO_USER }, error: null }
    }

    try {
      // Register through backend with pre-confirmed email to avoid Supabase email rate limits
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName }),
      })

      if (response.ok) {
        // Automatically sign in the user immediately
        const { data: signData, error: signError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signError) throw signError
        toast.success('Account created! Welcome to TravelMate AI!')
        return { data: signData, error: null }
      }

      const errJson = await response.json().catch(() => ({}))
      if (errJson.detail) {
        throw new Error(errJson.detail)
      }

      // Fallback to standard Supabase signup
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      })

      if (error) throw error

      toast.success('Account created!')
      return { data, error: null }
    } catch (error) {
      toast.error(error.message || 'Sign up failed')
      return { data: null, error }
    }
  }, [isDemoMode])

  const signIn = useCallback(async ({ email, password }) => {
    if (isDemoMode) {
      // Demo mode: any credentials work
      localStorage.setItem('travelmate_demo_logged_in', 'true')
      setUser(DEMO_USER)
      setSession({ access_token: 'demo-token', user: DEMO_USER })
      toast.success('Signed in successfully! (Demo Mode)')
      return { data: { user: DEMO_USER }, error: null }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      toast.success('Welcome back!')
      return { data, error: null }
    } catch (error) {
      toast.error(error.message || 'Sign in failed')
      return { data: null, error }
    }
  }, [isDemoMode])

  const signOut = useCallback(async () => {
    if (isDemoMode) {
      localStorage.removeItem('travelmate_demo_logged_in')
      setUser(null)
      setSession(null)
      toast.success('Signed out')
      return
    }

    try {
      await supabase.auth.signOut()
      toast.success('Signed out successfully')
    } catch (error) {
      toast.error('Sign out failed')
    }
  }, [isDemoMode])

  const resetPassword = useCallback(async (email) => {
    if (isDemoMode) {
      toast.success('Demo mode: Password reset email simulated!')
      return { error: null }
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      toast.success('Password reset email sent! Check your inbox.')
      return { error: null }
    } catch (error) {
      toast.error(error.message || 'Failed to send reset email')
      return { error }
    }
  }, [isDemoMode])

  const signInWithGoogle = useCallback(async () => {
    if (isDemoMode) {
      localStorage.setItem('travelmate_demo_logged_in', 'true')
      setUser(DEMO_USER)
      setSession({ access_token: 'demo-token', user: DEMO_USER })
      toast.success('Google sign-in simulated! (Demo Mode)')
      return { error: null }
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      })
      if (error) throw error
      return { error: null }
    } catch (error) {
      toast.error(error.message || 'Google sign-in failed')
      return { error }
    }
  }, [isDemoMode])

  const updateProfile = useCallback(async (updates) => {
    if (isDemoMode) {
      toast.success('Profile updated! (Demo Mode)')
      return { error: null }
    }

    try {
      const { error } = await supabase.auth.updateUser({
        data: updates,
      })
      if (error) throw error
      toast.success('Profile updated successfully')
      return { error: null }
    } catch (error) {
      toast.error(error.message || 'Profile update failed')
      return { error }
    }
  }, [isDemoMode])

  const getDisplayName = useCallback(() => {
    if (!user) return 'Traveler'
    return (
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      'Traveler'
    )
  }, [user])

  const getAccessToken = useCallback(() => {
    return session?.access_token || null
  }, [session])

  const value = {
    user,
    session,
    loading,
    isDemoMode,
    signUp,
    signIn,
    signOut,
    resetPassword,
    signInWithGoogle,
    updateProfile,
    getDisplayName,
    getAccessToken,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
