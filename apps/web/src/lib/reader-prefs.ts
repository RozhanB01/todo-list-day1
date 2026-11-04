export type ReaderTheme = 'parchment' | 'night' | 'rose'

export interface ReaderPrefs {
  theme: ReaderTheme
  fontSize: number
  lineHeight: number
  width: number
}

export const THEME_TOKENS: Record<
  ReaderTheme,
  { label: string; hint: string; bg: string; ink: string; accent: string; muted: string; panel: string }
> = {
  parchment: {
    label: 'طلاییِ کاغذ',
    hint: 'کاغذ گرم و جوهر قهوه‌ای',
    bg: '#FFF5E8',
    ink: '#3B2C43',
    accent: '#A97C46',
    muted: '#7B6A63',
    panel: '#FAECD8',
  },
  night: {
    label: 'شب ماه‌گرفته',
    hint: 'بنفشِ عمیق و متن کرم',
    bg: '#241A38',
    ink: '#FBEFDC',
    accent: '#D6AC69',
    muted: '#C7B7DF',
    panel: '#2E2347',
  },
  rose: {
    label: 'رؤیای رز',
    hint: 'صورتی روشن و جوهر آلویی',
    bg: '#F8E4E8',
    ink: '#3A2140',
    accent: '#B4708C',
    muted: '#7A5F6B',
    panel: '#F2D2DA',
  },
}

export const DEFAULT_PREFS: ReaderPrefs = {
  theme: 'parchment',
  fontSize: 20,
  lineHeight: 2.1,
  width: 44,
}

const PREFS_KEY = 'moonberry.reader.prefs'

export function loadPrefs(): ReaderPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (!raw) return DEFAULT_PREFS
    const parsed = JSON.parse(raw) as Partial<ReaderPrefs>
    return {
      theme: parsed.theme && parsed.theme in THEME_TOKENS ? parsed.theme : DEFAULT_PREFS.theme,
      fontSize: Number(parsed.fontSize) || DEFAULT_PREFS.fontSize,
      lineHeight: Number(parsed.lineHeight) || DEFAULT_PREFS.lineHeight,
      width: Number(parsed.width) || DEFAULT_PREFS.width,
    }
  } catch {
    return DEFAULT_PREFS
  }
}

export function savePrefs(prefs: ReaderPrefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
  } catch {
    /* preferences stay in memory when storage is unavailable */
  }
}

export function applyPrefs(prefs: ReaderPrefs) {
  const tokens = THEME_TOKENS[prefs.theme]
  const root = document.documentElement
  root.style.setProperty('--reader-bg', tokens.bg)
  root.style.setProperty('--reader-ink', tokens.ink)
  root.style.setProperty('--reader-accent', tokens.accent)
  root.style.setProperty('--reader-muted', tokens.muted)
  root.style.setProperty('--reader-font-size', `${prefs.fontSize}px`)
  root.style.setProperty('--reader-line-height', String(prefs.lineHeight))
  root.style.setProperty('--reader-width', `${prefs.width}rem`)
}

export interface GuestProgress {
  novelId: string
  novelSlug: string
  novelTitle: string
  chapterId: string
  chapterSlug: string
  chapterTitle: string
  percent: number
  finished: boolean
  updatedAt: string
}

const GUEST_KEY = 'moonberry.guest.progress'

export function loadGuestProgress(): Record<string, GuestProgress> {
  try {
    const raw = localStorage.getItem(GUEST_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function saveGuestProgress(entry: GuestProgress) {
  try {
    const all = loadGuestProgress()
    all[entry.novelId] = entry
    localStorage.setItem(GUEST_KEY, JSON.stringify(all))
  } catch {
    /* ignore storage failures */
  }
}

export function clearGuestProgress() {
  try {
    localStorage.removeItem(GUEST_KEY)
  } catch {
    /* ignore */
  }
}

export function guestProgressFor(novelId: string): GuestProgress | null {
  return loadGuestProgress()[novelId] ?? null
}
