export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const FALLBACK = 'ارتباط با مون‌بری برقرار نشد. اتصال اینترنتت را بررسی کن و دوباره تلاش کن.'

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  let response: Response
  try {
    response = await fetch(`/api${path}`, {
      credentials: 'include',
      ...init,
      headers,
    })
  } catch {
    throw new ApiError(FALLBACK, 0)
  }

  const isJson = (response.headers.get('content-type') || '').includes('application/json')
  const payload = isJson ? await response.json().catch(() => null) : null

  if (!response.ok) {
    throw new ApiError(payload?.error || FALLBACK, response.status)
  }
  return payload as T
}

export function buildQuery(params: Record<string, string | undefined | null>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value)
  }
  const query = search.toString()
  return query ? `?${query}` : ''
}

/** Stable pseudo-visitor key used only to de-duplicate real view counts. */
export function visitorKey(): string {
  const key = 'moonberry.visitor'
  try {
    const existing = localStorage.getItem(key)
    if (existing) return existing
    const created = `v-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
    localStorage.setItem(key, created)
    return created
  } catch {
    return 'anon'
  }
}

export async function trackView(novelId: string, chapterId?: string) {
  try {
    await api('/novels/' + novelId + '/views', {
      method: 'POST',
      body: JSON.stringify({ visitorKey: visitorKey(), chapterId }),
    })
  } catch {
    /* statistics are best-effort */
  }
}
