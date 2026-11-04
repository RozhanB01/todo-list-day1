import { useCallback, useEffect, useRef, useState } from 'react'
import { api, ApiError } from './api'

interface ApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
  reload: () => void
}

export function useApi<T>(path: string | null, deps: unknown[] = []): ApiState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(Boolean(path))
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)
  const latest = useRef(0)

  const reload = useCallback(() => setTick((value) => value + 1), [])

  useEffect(() => {
    if (!path) {
      setLoading(false)
      return
    }
    const requestId = latest.current + 1
    latest.current = requestId
    setLoading(true)
    setError(null)

    api<T>(path)
      .then((payload) => {
        if (latest.current === requestId) setData(payload)
      })
      .catch((err: unknown) => {
        if (latest.current === requestId) {
          setError(err instanceof ApiError ? err.message : 'چیزی درست پیش نرفت.')
        }
      })
      .finally(() => {
        if (latest.current === requestId) setLoading(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, tick, ...deps])

  return { data, loading, error, reload }
}

interface SeoOptions {
  title: string
  description?: string
  path?: string
  type?: string
  image?: string
  jsonLd?: Record<string, unknown> | null
  noindex?: boolean
}

function setMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(selector)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, key)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

export function useSeo({ title, description, path, type = 'website', image, jsonLd, noindex }: SeoOptions) {
  useEffect(() => {
    const site = 'مون‌بری | Moonberry'
    document.title = title ? `${title} | ${site}` : site

    if (description) {
      setMeta('meta[name="description"]', 'name', 'description', description)
      setMeta('meta[property="og:description"]', 'property', 'og:description', description)
    }
    setMeta('meta[property="og:title"]', 'property', 'og:title', title)
    setMeta('meta[property="og:type"]', 'property', 'og:type', type)
    setMeta('meta[name="robots"]', 'name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')

    const origin = window.location.origin
    const url = `${origin}${path ?? window.location.pathname}`
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = url
    setMeta('meta[property="og:url"]', 'property', 'og:url', url)
    setMeta('meta[property="og:locale"]', 'property', 'og:locale', 'fa_IR')
    if (image) setMeta('meta[property="og:image"]', 'property', 'og:image', `${origin}${image}`)

    const previous = document.getElementById('moonberry-structured-data')
    if (previous) previous.remove()
    if (jsonLd) {
      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.id = 'moonberry-structured-data'
      script.textContent = JSON.stringify(jsonLd)
      document.head.appendChild(script)
    }

    return () => {
      const script = document.getElementById('moonberry-structured-data')
      if (script) script.remove()
    }
  }, [title, description, path, type, image, jsonLd, noindex])
}
