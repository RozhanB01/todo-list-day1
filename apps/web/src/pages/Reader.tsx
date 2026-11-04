import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import clsx from 'clsx'
import { IconArrow, IconBookmark, IconClock, IconClose, IconHeart, IconSettings } from '../components/art/Icons'
import { WitchMascot } from '../components/art/WitchMascot'
import { MagicalButton } from '../components/ui/MagicalButton'
import { Notice } from '../components/ui/Feedback'
import { api, ApiError, trackView } from '../lib/api'
import { useAuth } from '../lib/auth'
import { formatFaDate, toFa } from '../lib/format'
import { useApi, useSeo } from '../lib/hooks'
import {
  DEFAULT_PREFS,
  THEME_TOKENS,
  applyPrefs,
  loadGuestProgress,
  loadPrefs,
  saveGuestProgress,
  savePrefs,
  type ReaderPrefs,
  type ReaderTheme,
} from '../lib/reader-prefs'
import { usePersonalLibrary } from '../lib/usePersonalLibrary'
import type { ChapterPayload } from '../lib/types'

const WIDTHS = [
  { value: 36, label: 'باریک' },
  { value: 44, label: 'متعادل' },
  { value: 52, label: 'پهن' },
]

const LINE_HEIGHTS = [
  { value: 1.85, label: 'فشرده' },
  { value: 2.1, label: 'متعادل' },
  { value: 2.4, label: 'باز' },
]

export function ReaderPage() {
  const { novelSlug = '', chapterSlug = '' } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const personal = usePersonalLibrary()
  const { data, loading, error, reload } = useApi<ChapterPayload>(
    `/novels/${encodeURIComponent(novelSlug)}/chapters/${encodeURIComponent(chapterSlug)}`,
  )

  const [prefs, setPrefs] = useState<ReaderPrefs>(() => loadPrefs())
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [bookmarkState, setBookmarkState] = useState<'idle' | 'saving'>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [percent, setPercent] = useState(0)
  const articleRef = useRef<HTMLDivElement>(null)
  const topRef = useRef<HTMLDivElement>(null)
  const savedPercentRef = useRef(0)
  const restoredRef = useRef(false)

  const tokens = THEME_TOKENS[prefs.theme]

  useEffect(() => {
    applyPrefs(prefs)
    savePrefs(prefs)
  }, [prefs])

  useSeo({
    title: data ? `${data.chapter.title} — ${data.novel.title}` : 'خواندن در مون‌بری',
    description: data
      ? `فصل ${toFa(data.chapter.number)} از رمان «${data.novel.title}» در مون‌بری: ${data.chapter.title}`
      : undefined,
    path: `/read/${novelSlug}/${chapterSlug}`,
    type: 'article',
    jsonLd: data
      ? {
          '@context': 'https://schema.org',
          '@type': 'Chapter',
          name: data.chapter.title,
          position: data.chapter.number,
          isPartOf: { '@type': 'Book', name: data.novel.title },
          inLanguage: 'fa-IR',
          datePublished: data.chapter.publishedAt ?? undefined,
        }
      : null,
  })

  useEffect(() => {
    if (data) void trackView(data.novel.id, data.chapter.id)
  }, [data?.novel.id, data?.chapter.id])

  // restore the reader's approximate position for this chapter
  useEffect(() => {
    restoredRef.current = false
  }, [chapterSlug])

  useEffect(() => {
    if (!data || restoredRef.current) return
    restoredRef.current = true
    const serverProgress = personal.library?.reading.find((item) => item.novel.slug === data.novel.slug)
    const guest = loadGuestProgress()[data.novel.id]
    const savedChapterSlug =
      (serverProgress?.chapter?.slug === chapterSlug && serverProgress?.chapter?.slug) ||
      (guest?.chapterSlug === chapterSlug && guest?.chapterSlug)
    const savedPercent =
      serverProgress?.chapter?.slug === chapterSlug ? serverProgress.percent : guest?.chapterSlug === chapterSlug ? guest.percent : 0
    if (!savedChapterSlug || savedPercent < 4) return
    const timer = window.setTimeout(() => {
      const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
      window.scrollTo({ top: scrollable * (savedPercent / 100), behavior: 'auto' })
    }, 320)
    return () => window.clearTimeout(timer)
  }, [data, chapterSlug, personal.library])

  const persistProgress = useCallback(
    (value: number) => {
      if (!data) return
      const finished = Boolean(!data.next && value >= 92)
      if (Math.abs(value - savedPercentRef.current) < 2 && !finished) return
      savedPercentRef.current = value

      if (user) {
        void api('/me/progress', {
          method: 'PUT',
          body: JSON.stringify({
            novelId: data.novel.id,
            chapterId: data.chapter.id,
            percent: value,
            finished,
          }),
        }).catch(() => undefined)
      } else {
        saveGuestProgress({
          novelId: data.novel.id,
          novelSlug: data.novel.slug,
          novelTitle: data.novel.title,
          chapterId: data.chapter.id,
          chapterSlug: data.chapter.slug,
          chapterTitle: data.chapter.title,
          percent: value,
          finished,
          updatedAt: new Date().toISOString(),
        })
      }
    },
    [data, user],
  )

  useEffect(() => {
    const onScroll = () => {
      const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
      const value = Math.round(Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100)))
      setPercent(value)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [data?.chapter.id])

  useEffect(() => {
    if (!data) return
    const timer = window.setTimeout(() => persistProgress(percent), 1400)
    return () => window.clearTimeout(timer)
  }, [percent, data, persistProgress])

  useEffect(() => {
    return () => {
      persistProgress(savedPercentRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.chapter.id])

  // keyboard: RTL reading, left arrow = next chapter
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return
      if (!data) return
      if (event.key === 'ArrowLeft' && data.next) {
        navigate(`/read/${data.novel.slug}/${data.next.slug}`)
      }
      if (event.key === 'ArrowRight' && data.previous) {
        navigate(`/read/${data.novel.slug}/${data.previous.slug}`)
      }
      if (event.key === 'Escape') {
        setSettingsOpen(false)
        setDrawerOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [data, navigate])

  const bookmarked = useMemo(() => {
    if (!data || !personal.library) return false
    return personal.library.bookmarks.some(
      (item) => item.chapter.slug === data.chapter.slug && item.novel?.slug === data.novel.slug,
    )
  }, [personal.library, data])

  async function toggleBookmark() {
    if (!data) return
    if (!user) {
      setMessage('برای گذاشتن نشانک باید وارد حساب خودت شوی. پیشرفت خواندن به‌صورت مهمان روی همین دستگاه ذخیره می‌شود.')
      return
    }
    setBookmarkState('saving')
    setMessage(null)
    try {
      if (bookmarked) {
        await api(`/me/bookmarks/${data.chapter.id}`, { method: 'DELETE' })
        setMessage('نشانک این فصل برداشته شد.')
      } else {
        await api('/me/bookmarks', {
          method: 'POST',
          body: JSON.stringify({ chapterId: data.chapter.id }),
        })
        setMessage('این فصل در نشانک‌های تو ذخیره شد.')
      }
      personal.reload()
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : 'نشانک ذخیره نشد؛ دوباره تلاش کن.')
    } finally {
      setBookmarkState('idle')
    }
  }

  function setTheme(theme: ReaderTheme) {
    setPrefs((previous) => ({ ...previous, theme }))
  }

  function adjustFont(delta: number) {
    setPrefs((previous) => ({
      ...previous,
      fontSize: Math.min(28, Math.max(16, previous.fontSize + delta)),
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-parchment">
        <div className="container-page py-20">
          <div className="mx-auto max-w-2xl">
            <div className="skeleton h-4 w-24 rounded-full" />
            <div className="skeleton mt-6 h-8 w-2/3 rounded-full" />
            <div className="skeleton mt-10 h-3 w-full rounded-full" />
            <div className="skeleton mt-3 h-3 w-11/12 rounded-full" />
            <div className="skeleton mt-3 h-3 w-full rounded-full" />
            <div className="skeleton mt-3 h-3 w-10/12 rounded-full" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-parchment">
        <div className="container-page py-24">
          <div className="ornament-frame mx-auto max-w-md rounded-[24px] p-8 text-center">
            <WitchMascot pose="lantern" className="mx-auto h-32 w-auto" decorative />
            <h1 className="mt-4 font-display text-lg font-bold text-plum">این فصل باز نمی‌شود</h1>
            <p className="mt-2 text-[12.5px] leading-7 text-ink/60">
              {error || 'شاید این فصل پیش‌نویس باشد یا نشانی عوض شده باشد.'}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <MagicalButton to={`/novels/${novelSlug}`} size="sm">صفحهٔ رمان</MagicalButton>
              <MagicalButton variant="outline" size="sm" onClick={reload}>تلاش دوباره</MagicalButton>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentIndex = data.chapters.findIndex((chapter) => chapter.slug === data.chapter.slug)

  return (
    <div className="min-h-screen transition-colors duration-500" style={{ background: tokens.bg, color: tokens.ink }}>
      <div className="fixed inset-x-0 top-0 z-40 h-1" style={{ background: `${tokens.muted}33` }} aria-hidden="true">
        <div className="h-full transition-[width] duration-200" style={{ width: `${percent}%`, background: tokens.accent }} />
      </div>

      <header
        className="sticky top-0 z-30 border-b backdrop-blur-md"
        style={{ borderColor: `${tokens.accent}33`, background: `${tokens.bg}f2` }}
      >
        <div ref={topRef} className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-2.5 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <Link
              to={`/novels/${data.novel.slug}`}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border transition hover:opacity-80"
              style={{ borderColor: `${tokens.accent}55`, color: tokens.ink }}
              aria-label="بازگشت به صفحهٔ رمان"
            >
              <IconArrow direction="right" className="h-4 w-4" />
            </Link>
            <div className="min-w-0">
              <p className="truncate text-[10.5px]" style={{ color: tokens.muted }}>
                {data.novel.title}
              </p>
              <p className="truncate font-display text-[13px] font-semibold">{data.chapter.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="hidden rounded-full border px-2.5 py-1 text-[10px] sm:inline" style={{ borderColor: `${tokens.accent}44`, color: tokens.muted }}>
              {toFa(percent)}٪ خوانده‌شده
            </span>
            <button
              type="button"
              onClick={() => void toggleBookmark()}
              disabled={bookmarkState === 'saving'}
              aria-pressed={bookmarked}
              aria-label={bookmarked ? 'برداشتن نشانک' : 'گذاشتن نشانک'}
              className={clsx('grid h-9 w-9 place-items-center rounded-full border transition', bookmarked ? 'bg-berry/20' : 'hover:opacity-80')}
              style={{ borderColor: bookmarked ? '#E8A1B5' : `${tokens.accent}55`, color: bookmarked ? '#a3556c' : tokens.ink }}
            >
              <IconBookmark className="h-4 w-4" filled={bookmarked} />
            </button>
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-full border text-[10px] transition hover:opacity-80"
              style={{ borderColor: `${tokens.accent}55` }}
              aria-label="فهرست فصل‌ها"
            >
              <span className="font-display text-[10px] font-bold">{toFa(data.chapters.length)}</span>
            </button>
            <button
              type="button"
              onClick={() => setSettingsOpen((value) => !value)}
              aria-expanded={settingsOpen}
              aria-label="تنظیمات خواندن"
              className="grid h-9 w-9 place-items-center rounded-full border transition hover:opacity-80"
              style={{ borderColor: settingsOpen ? tokens.accent : `${tokens.accent}55` }}
            >
              <IconSettings className="h-4 w-4" />
            </button>
          </div>
        </div>

        {settingsOpen && (
          <>
            <button type="button" className="fixed inset-0 z-10 cursor-default" aria-hidden="true" onClick={() => setSettingsOpen(false)} />
            <div
              className="absolute left-3 right-3 z-20 mx-auto mt-1 max-w-sm rounded-2xl border p-4 shadow-2xl sm:left-auto sm:right-6 sm:w-80"
              style={{ background: tokens.panel, borderColor: `${tokens.accent}55`, color: tokens.ink }}
              role="dialog"
              aria-label="تنظیمات خواندن"
            >
              <div className="flex items-center justify-between">
                <p className="font-display text-[13px] font-semibold">تنظیمات خواندن</p>
                <button type="button" onClick={() => setSettingsOpen(false)} aria-label="بستن تنظیمات" className="rounded-full p-1 hover:opacity-70">
                  <IconClose className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4">
                <p className="text-[10.5px]" style={{ color: tokens.muted }}>حال‌وهوای صفحه</p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {(Object.keys(THEME_TOKENS) as ReaderTheme[]).map((theme) => {
                    const item = THEME_TOKENS[theme]
                    const active = prefs.theme === theme
                    return (
                      <button
                        key={theme}
                        type="button"
                        onClick={() => setTheme(theme)}
                        aria-pressed={active}
                        className="rounded-xl border p-2 text-center transition"
                        style={{
                          background: item.bg,
                          color: item.ink,
                          borderColor: active ? item.accent : `${item.accent}44`,
                          boxShadow: active ? `0 0 0 2px ${item.accent}55` : 'none',
                        }}
                      >
                        <span className="mx-auto mb-1.5 block h-1.5 w-8 rounded-full" style={{ background: item.accent }} />
                        <span className="block text-[9.5px] leading-4">{item.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-[10.5px]" style={{ color: tokens.muted }}>اندازهٔ متن</p>
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => adjustFont(-1)} aria-label="کوچک‌کردن متن" className="grid h-8 w-8 place-items-center rounded-full border text-sm" style={{ borderColor: `${tokens.accent}55` }}>
                    ا−
                  </button>
                  <span className="w-10 text-center text-[11px]">{toFa(prefs.fontSize)}px</span>
                  <button type="button" onClick={() => adjustFont(1)} aria-label="بزرگ‌کردن متن" className="grid h-8 w-8 place-items-center rounded-full border text-sm" style={{ borderColor: `${tokens.accent}55` }}>
                    ا+
                  </button>
                </div>
              </div>

              <div className="mt-3">
                <p className="text-[10.5px]" style={{ color: tokens.muted }}>فاصلهٔ سطرها</p>
                <div className="mt-1.5 flex gap-1.5">
                  {LINE_HEIGHTS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setPrefs((previous) => ({ ...previous, lineHeight: option.value }))}
                      className="flex-1 rounded-lg border py-1.5 text-[10.5px]"
                      style={{
                        borderColor: prefs.lineHeight === option.value ? tokens.accent : `${tokens.accent}33`,
                        background: prefs.lineHeight === option.value ? `${tokens.accent}22` : 'transparent',
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-3">
                <p className="text-[10.5px]" style={{ color: tokens.muted }}>عرض متن</p>
                <div className="mt-1.5 flex gap-1.5">
                  {WIDTHS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setPrefs((previous) => ({ ...previous, width: option.value }))}
                      className="flex-1 rounded-lg border py-1.5 text-[10.5px]"
                      style={{
                        borderColor: prefs.width === option.value ? tokens.accent : `${tokens.accent}33`,
                        background: prefs.width === option.value ? `${tokens.accent}22` : 'transparent',
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPrefs(DEFAULT_PREFS)}
                className="mt-4 w-full rounded-lg border py-1.5 text-[10.5px] opacity-75 hover:opacity-100"
                style={{ borderColor: `${tokens.accent}44` }}
              >
                بازگشت به تنظیمات پیش‌فرض
              </button>
              <p className="mt-3 text-[9.5px] leading-5" style={{ color: tokens.muted }}>
                تنظیمات روی همین دستگاه ذخیره می‌شود. کلیدهای ← و → برای فصل بعد و قبل کار می‌کنند.
              </p>
            </div>
          </>
        )}
      </header>

      {message && (
        <div className="mx-auto mt-3 max-w-3xl px-4">
          <Notice tone={message.includes('ذخیره شد') || message.includes('برداشته شد') ? 'success' : 'info'}>{message}</Notice>
        </div>
      )}

      <main className="mx-auto px-4 pb-16 pt-8 sm:px-6 sm:pt-12" style={{ maxWidth: `calc(var(--reader-width) + 4rem)` }}>
        <div className="text-center">
          <Link to={`/novels/${data.novel.slug}`} className="font-display text-[12px] tracking-wide opacity-70 hover:opacity-100" style={{ color: tokens.accent }}>
            {data.novel.title}
          </Link>
          <p className="mt-3 text-[10.5px]" style={{ color: tokens.muted }}>
            فصل {toFa(data.chapter.number)} از {toFa(data.novel.chapterCount)}
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold leading-relaxed sm:text-[2rem]" style={{ color: tokens.ink }}>
            {data.chapter.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-[10.5px]" style={{ color: tokens.muted }}>
            <span className="inline-flex items-center gap-1">
              <IconClock className="h-3 w-3" /> {toFa(data.chapter.readingMinutes)} دقیقه مطالعه
            </span>
            <span>·</span>
            <span>{toFa(data.chapter.wordCount)} واژه</span>
            {data.chapter.publishedAt && (
              <>
                <span>·</span>
                <span>{formatFaDate(data.chapter.publishedAt)}</span>
              </>
            )}
          </div>
          <div className="mx-auto mt-6 h-px w-24" style={{ background: `${tokens.accent}66` }} />
        </div>

        <article
          ref={articleRef}
          className="chapter-body mt-9"
          style={{ maxWidth: 'var(--reader-width)', marginInline: 'auto' }}
          dangerouslySetInnerHTML={{ __html: data.chapter.contentHtml }}
        />

        <div className="mx-auto mt-12 flex max-w-xl flex-col items-center gap-3 border-t pt-8 text-center" style={{ borderColor: `${tokens.accent}33` }}>
          <WitchMascot pose="reading" className="h-24 w-auto opacity-90" decorative />
          <p className="font-display text-[12px]" style={{ color: tokens.muted }}>
            {data.next ? 'ادامهٔ قصه در فصل بعدی منتظر توست.' : 'این آخرین فصل منتشرشده از این قصه است تا امروز.'}
          </p>
        </div>

        <nav className="mt-6 grid gap-3 sm:grid-cols-2" aria-label="ناوبری فصل‌ها">
          {data.previous ? (
            <Link
              to={`/read/${data.novel.slug}/${data.previous.slug}`}
              className="group flex items-center gap-3 rounded-2xl border p-4 text-start transition hover:opacity-90"
              style={{ borderColor: `${tokens.accent}44`, background: `${tokens.accent}0d` }}
            >
              <IconArrow direction="right" className="h-5 w-5 shrink-0" style={{ color: tokens.accent }} />
              <span className="min-w-0">
                <span className="block text-[9.5px]" style={{ color: tokens.muted }}>فصل قبلی</span>
                <span className="block truncate font-display text-[12.5px] font-semibold">{data.previous.title}</span>
              </span>
            </Link>
          ) : (
            <span className="hidden sm:block" />
          )}

          {data.next ? (
            <Link
              to={`/read/${data.novel.slug}/${data.next.slug}`}
              className="group flex items-center justify-end gap-3 rounded-2xl border p-4 text-end transition hover:opacity-90"
              style={{ borderColor: `${tokens.accent}66`, background: `${tokens.accent}18` }}
            >
              <span className="min-w-0">
                <span className="block text-[9.5px]" style={{ color: tokens.muted }}>فصل بعدی</span>
                <span className="block truncate font-display text-[12.5px] font-semibold">{data.next.title}</span>
              </span>
              <IconArrow direction="left" className="h-5 w-5 shrink-0" style={{ color: tokens.accent }} />
            </Link>
          ) : (
            <Link
              to={`/novels/${data.novel.slug}`}
              className="flex items-center justify-end gap-3 rounded-2xl border p-4 text-end transition hover:opacity-90"
              style={{ borderColor: `${tokens.accent}44`, background: `${tokens.accent}0d` }}
            >
              <span>
                <span className="block text-[9.5px]" style={{ color: tokens.muted }}>پایان این بخش</span>
                <span className="block font-display text-[12.5px] font-semibold">بازگشت به صفحهٔ رمان</span>
              </span>
              <IconArrow direction="left" className="h-5 w-5 shrink-0" style={{ color: tokens.accent }} />
            </Link>
          )}
        </nav>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/novels"
            className="rounded-full border px-4 py-2 text-[11px] transition hover:opacity-80"
            style={{ borderColor: `${tokens.accent}55`, color: tokens.ink }}
          >
            بازگشت به کتابخانه
          </Link>
          <Link
            to="/library"
            className="inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-[11px] transition hover:opacity-80"
            style={{ borderColor: `${tokens.accent}55`, color: tokens.ink }}
          >
            <IconHeart className="h-3.5 w-3.5" /> کتابخانهٔ من
          </Link>
        </div>
      </main>

      {drawerOpen && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="فهرست فصل‌ها">
          <button type="button" className="absolute inset-0 bg-plum/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} aria-label="بستن فهرست" />
          <div
            className="absolute inset-y-0 right-0 flex w-[88%] max-w-sm animate-riseIn flex-col border-s"
            style={{ background: tokens.panel, borderColor: `${tokens.accent}44`, color: tokens.ink }}
          >
            <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: `${tokens.accent}33` }}>
              <div>
                <p className="text-[10px]" style={{ color: tokens.muted }}>فهرست فصل‌ها</p>
                <p className="mt-0.5 font-display text-sm font-semibold">{data.novel.title}</p>
              </div>
              <button type="button" onClick={() => setDrawerOpen(false)} aria-label="بستن فهرست" className="rounded-full p-1.5 hover:opacity-70">
                <IconClose className="h-5 w-5" />
              </button>
            </div>
            <ol className="flex-1 overflow-y-auto px-3 py-3">
              {data.chapters.map((chapter, index) => {
                const active = chapter.slug === data.chapter.slug
                return (
                  <li key={chapter.id}>
                    <Link
                      to={`/read/${data.novel.slug}/${chapter.slug}`}
                      onClick={() => setDrawerOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition"
                      style={{ background: active ? `${tokens.accent}22` : 'transparent' }}
                      aria-current={active ? 'page' : undefined}
                    >
                      <span className="w-6 text-center text-[10px]" style={{ color: tokens.muted }}>
                        {toFa(chapter.number)}
                      </span>
                      <span className={clsx('flex-1 truncate text-[12px]', active && 'font-semibold')}>{chapter.title}</span>
                      {index === currentIndex && <span className="h-1.5 w-1.5 rounded-full" style={{ background: tokens.accent }} />}
                    </Link>
                  </li>
                )
              })}
            </ol>
            <div className="safe-bottom border-t px-5 py-4 text-[10px]" style={{ borderColor: `${tokens.accent}33`, color: tokens.muted }}>
              پیشرفت خواندن به‌صورت خودکار ذخیره می‌شود.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
