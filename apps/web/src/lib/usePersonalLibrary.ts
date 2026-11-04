import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from './api'
import { useAuth } from './auth'
import { loadGuestProgress } from './reader-prefs'
import type { LibraryPayload, Novel } from './types'

export interface ResumePoint {
  chapterSlug: string
  percent: number
}

export function usePersonalLibrary() {
  const { user } = useAuth()
  const [library, setLibrary] = useState<LibraryPayload | null>(null)
  const [loading, setLoading] = useState(false)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!user) {
      setLibrary(null)
      return
    }
    let active = true
    setLoading(true)
    api<LibraryPayload>('/me/library')
      .then((payload) => {
        if (active) setLibrary(payload)
      })
      .catch(() => {
        if (active) setLibrary(null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [user, tick])

  const favoriteIds = useMemo(
    () => new Set((library?.favorites ?? []).map((item) => item.novel.id)),
    [library],
  )

  const toggleFavorite = useCallback(
    async (novelId: string) => {
      if (!user) return false
      const isFavorite = favoriteIds.has(novelId)
      setLibrary((previous) =>
        previous
          ? {
              ...previous,
              favorites: isFavorite
                ? previous.favorites.filter((item) => item.novel.id !== novelId)
                : previous.favorites,
            }
          : previous,
      )
      try {
        await api(`/me/favorites/${novelId}`, { method: isFavorite ? 'DELETE' : 'POST' })
        setTick((value) => value + 1)
        return true
      } catch {
        setTick((value) => value + 1)
        return false
      }
    },
    [user, favoriteIds],
  )

  const resumeFor = useCallback(
    (novel: Novel): ResumePoint | null => {
      const serverProgress = library?.reading.find((item) => item.novel.id === novel.id)
      if (serverProgress?.chapter) {
        return { chapterSlug: serverProgress.chapter.slug, percent: serverProgress.percent }
      }
      const guest = loadGuestProgress()[novel.id]
      if (guest) return { chapterSlug: guest.chapterSlug, percent: guest.percent }
      return null
    },
    [library],
  )

  const lastGuestEntry = useMemo(() => {
    const entries = Object.values(loadGuestProgress())
    if (!entries.length) return null
    return entries.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]
  }, [tick])

  return {
    user,
    library,
    loading,
    favoriteIds,
    toggleFavorite,
    resumeFor,
    lastRead: library?.lastRead ?? null,
    lastGuestEntry,
    reload: () => setTick((value) => value + 1),
  }
}
