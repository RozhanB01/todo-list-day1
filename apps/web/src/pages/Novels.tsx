import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import clsx from 'clsx'
import { WatercolorBookCard } from '../components/ui/WatercolorBookCard'
import { CardSkeleton, EmptyState, ErrorNotice, Notice } from '../components/ui/Feedback'
import { MagicalButton } from '../components/ui/MagicalButton'
import { StorybookSection } from '../components/ui/StorybookSection'
import { GenreIcon, IconSearch } from '../components/art/Icons'
import { FloralDivider } from '../components/art/Ornaments'
import { useApi, useSeo } from '../lib/hooks'
import { usePersonalLibrary } from '../lib/usePersonalLibrary'
import { MOOD_META, toFa } from '../lib/format'
import type { Genre, Novel } from '../lib/types'

const STATUS_OPTIONS = [
  { value: '', label: 'همه' },
  { value: 'ongoing', label: 'در حال انتشار' },
  { value: 'completed', label: 'کامل‌شده' },
]

const LENGTH_OPTIONS = [
  { value: '', label: 'هر طولی' },
  { value: 'short', label: 'کوتاه' },
  { value: 'long', label: 'بلند' },
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'جدیدترین' },
  { value: 'popular', label: 'محبوب‌ترین' },
  { value: 'updated', label: 'آخرین به‌روزرسانی' },
  { value: 'chapters', label: 'بیشترین فصل' },
]

export function NovelsPage() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const genre = params.get('genre') ?? ''
  const mood = params.get('mood') ?? ''
  const status = params.get('status') ?? ''
  const length = params.get('length') ?? ''
  const sort = params.get('sort') ?? 'newest'

  const [searchInput, setSearchInput] = useState(q)
  const [notice, setNotice] = useState<string | null>(null)
  const personal = usePersonalLibrary()

  useEffect(() => {
    setSearchInput(q)
  }, [q])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (searchInput === q) return
      const next = new URLSearchParams(params)
      if (searchInput.trim()) next.set('q', searchInput.trim())
      else next.delete('q')
      setParams(next, { replace: true })
    }, 350)
    return () => window.clearTimeout(timer)
  }, [searchInput, q, params, setParams])

  const { data: genreData } = useApi<{ genres: Genre[] }>('/genres')

  const query = useMemo(() => {
    const search = new URLSearchParams()
    if (q) search.set('q', q)
    if (genre) search.set('genre', genre)
    if (mood) search.set('mood', mood)
    if (status) search.set('status', status)
    if (length) search.set('length', length)
    if (sort) search.set('sort', sort)
    const value = search.toString()
    return `/novels${value ? `?${value}` : ''}`
  }, [q, genre, mood, status, length, sort])

  const { data, loading, error, reload } = useApi<{ novels: Novel[]; total: number }>(query)

  useSeo({
    title: 'رمان‌های مون‌بری',
    description:
      'همهٔ رمان‌ها و داستان‌های منتشرشده در مون‌بری؛ با فیلتر ژانر، حال‌وهوا، وضعیت انتشار و جست‌وجوی فارسی.',
    path: '/novels',
  })

  function update(key: string, value: string) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  function clearAll() {
    setParams(new URLSearchParams(), { replace: true })
    setSearchInput('')
  }

  const activeFilterCount = [genre, mood, status, length, q].filter(Boolean).length

  function handleFavorite(novel: Novel) {
    if (!personal.user) {
      setNotice('برای ذخیرهٔ رمان‌ها در کتابخانهٔ شخصی باید وارد حساب خودت شوی.')
      return
    }
    setNotice(null)
    void personal.toggleFavorite(novel.id)
  }

  return (
    <div className="bg-parchment">
      <section className="relative overflow-hidden bg-night-sky py-12 text-parchment sm:py-16">
        <div className="pointer-events-none absolute inset-0 opacity-20" aria-hidden="true">
          <svg viewBox="0 0 1200 320" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
            <path d="M0 280c180-90 300 20 470-40s260-120 450-60 220 40 280 30" stroke="#D6AC69" strokeWidth="1" fill="none" />
            <path d="M0 300c200-70 320 10 500-60s280-90 450-40" stroke="#C7B7DF" strokeWidth="1" fill="none" opacity="0.6" />
          </svg>
        </div>
        <div className="container-page relative">
          <p className="eyebrow text-gold">کتابخانه</p>
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">همهٔ رمان‌های مون‌بری</h1>
          <p className="mt-3 max-w-2xl text-[13px] leading-7 text-lavender/75">
            {data ? `${toFa(data.total)} قصه در کتابخانه` : 'در حال شمردن قفسه‌ها…'} — با ژانر، حال‌وهوا و وضعیت انتشار
            مرتب کن، یا نامی را جست‌وجو کن.
          </p>

          <div className="mt-7 flex max-w-xl items-center gap-3 rounded-full border border-gold/40 bg-[#fffaf1] px-5 py-3 shadow-lg">
            <IconSearch className="h-4.5 w-4.5 shrink-0 text-[#8a6fa0]" />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="جست‌وجو در نام و توضیح رمان‌ها…"
              aria-label="جست‌وجو در رمان‌ها"
              className="w-full bg-transparent text-[13.5px] text-plum outline-none placeholder:text-ink/40"
            />
            {searchInput && (
              <button type="button" onClick={() => setSearchInput('')} className="text-[11px] text-ink/45 hover:text-plum">
                پاک کردن
              </button>
            )}
          </div>
          <div className="mt-3 max-w-xl">
            <FloralDivider className="w-56" tone="light" />
          </div>
        </div>
      </section>

      <div className="container-page -mt-6 pb-16 sm:pb-20">
        <div className="relative rounded-[22px] border border-gold/30 bg-[#fffaf1] p-5 shadow-card sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
            <div>
              <p className="mb-2.5 text-[11px] text-ink/50">ژانر</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => update('genre', '')} className={clsx('chip', !genre && 'chip-active')}>
                  همه
                </button>
                {(genreData?.genres ?? []).map((item) => (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() => update('genre', item.slug)}
                    aria-pressed={genre === item.slug}
                    className={clsx('chip', genre === item.slug && 'chip-active')}
                  >
                    <GenreIcon icon={item.icon} className="h-3.5 w-3.5" />
                    {item.name}
                    <span className="text-[10px] text-ink/40">{toFa(item.novelCount)}</span>
                  </button>
                ))}
              </div>

              <p className="mb-2.5 mt-4 text-[11px] text-ink/50">حال‌وهوا</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => update('mood', '')} className={clsx('chip', !mood && 'chip-active')}>
                  هر حالی
                </button>
                {Object.entries(MOOD_META).map(([key, meta]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => update('mood', key)}
                    aria-pressed={mood === key}
                    className={clsx('chip', mood === key && 'chip-active')}
                  >
                    {meta.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
              <label className="text-[11px] text-ink/50">
                وضعیت
                <select
                  value={status}
                  onChange={(event) => update('status', event.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-plum/15 bg-white/70 px-3 py-2 text-[12px] text-plum outline-none focus:border-gold"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
              <label className="text-[11px] text-ink/50">
                طول قصه
                <select
                  value={length}
                  onChange={(event) => update('length', event.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-plum/15 bg-white/70 px-3 py-2 text-[12px] text-plum outline-none focus:border-gold"
                >
                  {LENGTH_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
              <label className="text-[11px] text-ink/50">
                مرتب کردن
                <select
                  value={sort}
                  onChange={(event) => update('sort', event.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-plum/15 bg-white/70 px-3 py-2 text-[12px] text-plum outline-none focus:border-gold"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={clearAll}
                  disabled={!activeFilterCount}
                  className="w-full rounded-xl border border-plum/15 px-3 py-2 text-[11.5px] text-ink/60 transition hover:border-gold/60 hover:text-plum disabled:opacity-40"
                >
                  پاک کردن فیلترها
                </button>
              </div>
            </div>
          </div>
          {sort === 'popular' && (
            <p className="mt-3 text-[10.5px] text-ink/40">
              ترتیب محبوب‌ترین فقط بر اساس علاقه‌مندی و بازدید واقعی خوانندگان محاسبه می‌شود؛ اگر داده‌ای نباشد، ترتیب
              انتشار حفظ می‌شود.
            </p>
          )}
        </div>

        {notice && (
          <div className="mt-5 max-w-2xl">
            <Notice>
              {notice}{' '}
              <a href="/login" className="font-medium underline underline-offset-4">ورود به مون‌بری</a>
            </Notice>
          </div>
        )}

        <div className="mt-8">
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <CardSkeleton key={index} />
              ))}
            </div>
          ) : error ? (
            <ErrorNotice message={error} onRetry={reload} />
          ) : (data?.novels.length ?? 0) === 0 ? (
            <EmptyState
              title="در این قفسه چیزی پیدا نشد"
              description="شاید با کلمهٔ دیگری امتحان کنی، یا فیلترها را برداری تا همهٔ قصه‌ها را ببینی."
              action={<MagicalButton variant="outline" size="sm" onClick={clearAll}>نمایش همهٔ رمان‌ها</MagicalButton>}
            />
          ) : (
            <>
              <p className="mb-4 text-[11.5px] text-ink/45">
                {toFa(data?.novels.length ?? 0)} رمان{activeFilterCount ? ' با این فیلترها' : ''}
              </p>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {data?.novels.map((novel) => (
                  <WatercolorBookCard
                    key={novel.id}
                    novel={novel}
                    favorited={personal.favoriteIds.has(novel.id)}
                    onToggleFavorite={() => handleFavorite(novel)}
                    resume={personal.resumeFor(novel)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
