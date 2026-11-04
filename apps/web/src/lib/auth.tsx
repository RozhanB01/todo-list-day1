import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { api, ApiError } from './api'
import type { SessionUser } from './types'
import { loadGuestProgress, clearGuestProgress } from './reader-prefs'

interface AuthValue {
  user: SessionUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<SessionUser>
  register: (email: string, password: string, displayName: string) => Promise<SessionUser>
  logout: () => Promise<void>
  refresh: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthValue | null>(null)

async function mergeGuestProgress() {
  const guest = Object.values(loadGuestProgress())
  if (!guest.length) return
  try {
    await api('/me/progress/merge', {
      method: 'POST',
      body: JSON.stringify({
        items: guest.map((entry) => ({
          novelId: entry.novelId,
          chapterId: entry.chapterId,
          percent: entry.percent,
          finished: entry.finished,
        })),
      }),
    })
    clearGuestProgress()
  } catch {
    /* keep the local copy if the merge fails */
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const data = await api<{ user: SessionUser | null }>('/auth/me')
      setUser(data.user)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const login = useCallback(async (email: string, password: string) => {
    const data = await api<{ user: SessionUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    setUser(data.user)
    await mergeGuestProgress()
    return data.user
  }, [])

  const register = useCallback(async (email: string, password: string, displayName: string) => {
    const data = await api<{ user: SessionUser }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    })
    setUser(data.user)
    await mergeGuestProgress()
    return data.user
  }, [])

  const logout = useCallback(async () => {
    try {
      await api('/auth/logout', { method: 'POST' })
    } catch (error) {
      if (!(error instanceof ApiError)) throw error
    }
    setUser(null)
  }, [])

  const value = useMemo<AuthValue>(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      refresh,
      isAdmin: user?.role === 'ADMIN',
    }),
    [user, loading, login, register, logout, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
