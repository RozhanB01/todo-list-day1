import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { BookCover } from '../components/art/BookCover'
import { FloralDivider } from '../components/art/Ornaments'
import { IconBookmark, IconClock, IconHeart, IconSparkle } from '../components/art/Icons'
import { MagicalButton } from '../components/ui/MagicalButton'
import { CardSkeleton, EmptyState } from '../components/ui/Feedback'
import { WatercolorBookCard } from '../components/ui/WatercolorBookCard'
import { useAuth } from '../lib/auth'
import { api } from '../lib/api'
import { formatFaDate, relativeFa, toFa } from '../lib/format'
import { useApi, useSeo } from '../lib/hooks'
import { loadGuestProgress } from '../lib/reader-prefs'
import { usePersonalLibrary } from '../lib/usePersonalLibrary'
import type { LibraryProgressItem, Novel } from '../lib/types'

type TabKey = 'reading' | 'favorites' | 'bookmarks' | 'finished'

const TABS: Array<{ key: TabKey; label: string; icon: 'clock' | 'heart' | 'bookmark' | 'sparkle' }> = [
  { key: 'reading', label: 'در حال مطالعه', icon: 'clock' },
  { key: 'favorites', label: 'علاقه‌مندی‌ها', icon: 'heart' },
  { key: 'bookmarks', label: 'نشانک‌ها', icon: 'bookmark' },
  { key: 'finished', label: 'خوانده‌شده‌ها', icon: 'sparkle' },
]

function TabIcon({ icon, className = 'h-4 w-4' }: { icon: 'clock' | 'heart' | 'bookmark' | 'sparkle'; className?: string }) {
  if (icon === 'heart') return <IconHeart className={className} />
  if (icon === 'bookmark') return <IconBookmark className={className} />
  if (icon === 'sparkle') return <IconSparkle className={className} />
  return <IconClock className={className} />
}

function ProgressRow({ item }: { item: LibraryProgressItem }) {
  const href = item.chapter ? `/read/${item.novel.slug}/${item.chapter.slug}` : `/novels/${item.novel.slug}`
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gold/25 bg-[#fffaf1] p-4 sm:flex-row sm:items-center">
      <Link to={`/novels/${item.novel.slug}`} className="shrink-0">
        <BookCover
          title={item.novel.title}
          palette={item.novel.coverPalette}
          motif={item.novel.coverMotif}
          coverImageUrl={item.novel.coverImageUrl}
          size="sm"
          className="h-24 w-16"
        />
      </Link>
      <div className="min-w-0 flex-1">
        <Link to={`/novels/${item.novel.slug}`} className="font-display text-[15px] font-bold text-plum hover:text-[#6b4270]">
          {item.novel.title}
        </Link>
        <p className="mt-1 text-[11.5px] text-ink/55">
          {item.chapter ? `فصل ${toFa(item.chapter.number)} — ${item.chapter.title}` : 'هنوز فصلی خوانده نشده'}
        </p>
        <div className="mt-2.5 flex items-center gap-3">
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-plum/10">
            <span className="block h-full rounded-full bg-gradient-to-l from-[#c79b58] to-[#e8c58c]" style={{ width: `${Math.round(item.percent)}%` }} />
          </span>
          <span className="w-14 shrink-0 text-end text-[10px] text-ink/45">{toFa(Math.round(item.percent))}٪</span>
        </div>
        <p className="mt-1.5 text-[10px] text-ink/40">آخرین بار {relativeFa(item.updatedAt)}</p>
      </div>
      <div className="shrink-0">
        <MagicalButton to={href} variant="gold" size="sm">
          ادامهٔ مطالعه
        </MagicalButton>
      </div>
    </div>
  )
}

export function LibraryPage() {
  const { user, loading: authLoading } = useAuth()
  const personal = usePersonalLibrary()
  const [tab, setTab] = useState<TabKey>('reading')
  const [message, setMessage] = useState<string | null>(null)

  const guestEntries = useMemo(() => Object.values(loadGuestProgress()), [])
  const { data: allNovels } = useApi<{ novels: Novel[] }>(!user ? '/novels' : null)

  useSeo({
    title: 'کتابخانهٔ من',
    description: 'قصه‌هایی که خوانده‌ای، ادامهشان، علاقه‌مندی‌ها و نشانک‌های تو در مون‌بری.',
    path: '/library',
    noindex: true,
  })

  async function removeBookmark(chapterSlug: string, chapterId: string) {
    try {
      await api(`/me/bookmarks/${chapterId}`, { method: 'DELETE' })
      personal.reload()
      setMessage('نشانک برداشته شد.')
    } catch {
      setMessage('نشانک برداشته نشد؛ دوباره تلاش کن.')
      void chapterSlug
    }
  }

  const guestNovels = useMemo(() => {
    const map = new Map((allNovels?.novels ?? []).map((novel) => [novel.id, novel]))
    return guestEntries
      .map((entry) => ({ entry, novel: map.get(entry.novelId) }))
      .filter((item): item is { entry: typeof guestEntries[number]; novel: Novel } => Boolean(item.novel))
      .sort((a, b) => new Date(b.entry.updatedAt).getTime() - new Date(a.entry.updatedAt).getTime())
  }, [allNovels, guestEntries])

  if (authLoading || (user && personal.loading && !personal.library)) {
    return (
      <div className="container-page py-16">
        <div className="skeleton h-10 w-52 rounded-full" />
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-parchment">
      <section className="relative overflow-hidden bg-night-sky py-12 text-parchment sm:py-16">
        <div className="pointer-events-none absolute inset-0 opacity-25" aria-hidden="true">
          <svg viewBox="0 0 1200 260" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
            <path d="M0 220C180 150 330 250 520 190s280-110 460-50 160 60 220 50" fill="none" stroke="#D6AC69" strokeWidth="1" />
          </svg>
        </div>
        <div className="container-page relative">
          <p className="eyebrow text-gold">گوشهٔ خودت</p>
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">کتابخانهٔ من</h1>
          <p className="mt-3 max-w-2xl text-[13px] leading-7 text-lavender/75">
            {user
              ? `سلام ${user.displayName}؛ این‌جا هر چیزی که خوانده‌ای، پسندیده‌ای و نشانک گذاشته‌ای منتظر توست.`
              : 'پیشرفت خواندن مهمان، روی همین دستگاه ذخیره می‌شود. برای نگه‌داشتن کتابخانه روی همهٔ دستگاه‌ها یک حساب بساز.'}
          </p>
          <div className="mt-5">
            <FloralDivider className="w-52" tone="light" />
          </div>
        </div>
      </section>

      <div className="container-page py-12">
        {!user ? (
          <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <h2 className="font-display text-lg font-bold text-plum">ادامهٔ خواندن روی این دستگاه</h2>
              <p className="mt-1.5 text-[12px] text-ink/55">
                {guestNovels.length
                  ? 'این رمان‌ها را روی همین مرورگر شروع کرده‌ای.'
                  : 'هنوز قصه‌ای را شروع نکرده‌ای. از کتابخانه یکی انتخاب کن.'}
              </p>
              <div className="mt-5 space-y-3">
                {!allNovels &&
                  Array.from({ length: 2 }).map((_, index) => (
                    <div key={index} className="skeleton h-28 rounded-2xl" />
                  ))}
                {allNovels && guestNovels.map(({ entry, novel }) => (
                  <div key={entry.novelId} className="flex items-center gap-4 rounded-2xl border border-gold/25 bg-[#fffaf1] p-4">
                    <BookCover
                      title={novel.title}
                      palette={novel.coverPalette}
                      motif={novel.coverMotif}
                      coverImageUrl={novel.coverImageUrl}
                      size="sm"
                      className="h-20 w-14 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-sm font-bold text-plum">{novel.title}</p>
                      <p className="mt-1 truncate text-[11px] text-ink/50">
                        {entry.chapterTitle} · {toFa(Math.round(entry.percent))}٪
                      </p>
                      <p className="mt-1 text-[10px] text-ink/40">{relativeFa(entry.updatedAt)}</p>
                    </div>
                    <MagicalButton to={`/read/${entry.novelSlug}/${entry.chapterSlug}`} size="sm" variant="outline">
                      ادامه
                    </MagicalButton>
                  </div>
                ))}
                {allNovels && guestNovels.length === 0 && (
                  <EmptyState
                    title="قفسه‌ات هنوز خالی است"
                    description="اولین قصه‌ات را انتخاب کن؛ از همان‌جا پیشرفتت ذخیره می‌شود."
                    compact
                    action={<MagicalButton to="/novels" size="sm">رفتن به کتابخانه</MagicalButton>}
                  />
                )}
              </div>
            </div>

            <aside className="ornament-frame h-fit rounded-[24px] p-6">
              <p className="eyebrow">کتابخانهٔ شخصی</p>
              <h2 className="mt-3 font-display text-lg font-bold text-plum">این قفسه را مال خودت کن</h2>
              <p className="mt-2 text-[12px] leading-7 text-ink/60">
                با یک حساب رایگان، علاقه‌مندی‌ها و نشانک‌ها را نگه می‌داری و هر جا وارد شوی، از همان فصل و همان جای صفحه
                ادامه می‌دهی.
              </p>
              <div className="mt-5 space-y-2.5">
                <MagicalButton to="/register" variant="gold" size="md" className="w-full">
                  ساخت حساب تازه
                </MagicalButton>
                <MagicalButton to="/login" variant="outline" size="md" className="w-full">
                  ورود به حساب موجود
                </MagicalButton>
              </div>
              <p className="mt-4 text-[10.5px] leading-6 text-ink/40">
                خواندن همهٔ قصه‌ها بدون حساب هم آزاد است؛ حساب فقط برای نگه‌داشتن کتابخانهٔ شخصی است.
              </p>
            </aside>
          </div>
        ) : (
          <>
            {personal.library?.lastRead && (
              <div className="mb-8 flex flex-col gap-4 rounded-[22px] border border-gold/35 bg-[linear-gradient(135deg,#fffaf1,#f7e6cd)] p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="eyebrow">آخرین فصل خوانده‌شده</p>
                  <p className="mt-2 font-display text-[15px] font-bold text-plum">
                    {personal.library.lastRead.novelTitle}
                  </p>
                  <p className="mt-1 text-[11.5px] text-ink/55">
                    {personal.library.lastRead.chapterTitle} · {toFa(Math.round(personal.library.lastRead.percent))}٪
                  </p>
                </div>
                <MagicalButton
                  to={`/read/${personal.library.lastRead.novelSlug}/${personal.library.lastRead.chapterSlug}`}
                  variant="gold"
                  size="md"
                >
                  برگشت به همان‌جا
                </MagicalButton>
              </div>
            )}

            <div className="no-scrollbar mb-7 flex gap-2 overflow-x-auto pb-1">
              {TABS.map((item) => {
                const count =
                  item.key === 'reading'
                    ? personal.library?.reading.length ?? 0
                    : item.key === 'favorites'
                      ? personal.library?.favorites.length ?? 0
                      : item.key === 'bookmarks'
                        ? personal.library?.bookmarks.length ?? 0
                        : personal.library?.finished.length ?? 0
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setTab(item.key)}
                    aria-pressed={tab === item.key}
                    className={clsx(
                      'inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-[12px] transition',
                      tab === item.key
                        ? 'border-gold/60 bg-gold/20 text-plum shadow-sm'
                        : 'border-plum/12 bg-[#fffaf1] text-ink/60 hover:border-gold/45',
                    )}
                  >
                    <TabIcon icon={item.icon} />
                    {item.label}
                    <span className="text-[10px] text-ink/40">{toFa(count)}</span>
                  </button>
                )
              })}
            </div>

            {message && <p className="mb-4 text-[11.5px] text-forest">{message}</p>}

            {tab === 'reading' && (
              <div className="space-y-3">
                {(personal.library?.reading.length ?? 0) === 0 ? (
                  <EmptyState
                    title="چیزی در حال خواندن نداری"
                    description="یکی از رمان‌ها را باز کن؛ پیشرفتت خودکار ذخیره می‌شود و همین‌جا ظاهر می‌شود."
                    compact
                    action={<MagicalButton to="/novels" size="sm">انتخاب قصه</MagicalButton>}
                  />
                ) : (
                  personal.library?.reading.map((item) => <ProgressRow key={item.novel.id} item={item} />)
                )}
              </div>
            )}

            {tab === 'favorites' && (
              (personal.library?.favorites.length ?? 0) === 0 ? (
                <EmptyState
                  title="هنوز رمانی را ذخیره نکرده‌ای"
                  description="با زدن قلب روی هر رمان، آن را در همین قفسه نگه می‌داری."
                  compact
                  action={<MagicalButton to="/novels" size="sm">گشتن در کتابخانه</MagicalButton>}
                />
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {personal.library?.favorites.map(({ novel }) => (
                    <WatercolorBookCard
                      key={novel.id}
                      novel={novel}
                      favorited
                      onToggleFavorite={() => void personal.toggleFavorite(novel.id)}
                      resume={personal.resumeFor(novel)}
                    />
                  ))}
                </div>
              )
            )}

            {tab === 'bookmarks' && (
              <div className="space-y-3">
                {(personal.library?.bookmarks.length ?? 0) === 0 ? (
                  <EmptyState
                    title="نشانکی نگذاشته‌ای"
                    description="در صفحهٔ خواندن، با نشانک بالای صفحه می‌توانی هر فصل را برای بعد نگه داری."
                    compact
                    pose="cat"
                    action={<MagicalButton to="/novels" size="sm">رفتن به کتابخانه</MagicalButton>}
                  />
                ) : (
                  personal.library?.bookmarks.map((item) => (
                    <div key={item.id} className="flex flex-col gap-3 rounded-2xl border border-gold/25 bg-[#fffaf1] p-4 sm:flex-row sm:items-center">
                      <div className="min-w-0 flex-1">
                        <p className="text-[10.5px] text-ink/45">{item.novel?.title}</p>
                        <p className="mt-1 font-display text-sm font-semibold text-plum">
                          فصل {toFa(item.chapter.number)} — {item.chapter.title}
                        </p>
                        <p className="mt-1 text-[10.5px] text-ink/40">{formatFaDate(item.createdAt)}</p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        {item.novel && (
                          <MagicalButton to={`/read/${item.novel.slug}/${item.chapter.slug}`} size="sm">
                            خواندن
                          </MagicalButton>
                        )}
                        <button
                          type="button"
                          onClick={() => void removeBookmark(item.chapter.slug, item.id)}
                          className="rounded-full border border-plum/15 px-3 py-1.5 text-[11px] text-ink/55 transition hover:border-berry/60 hover:text-[#a3556c]"
                        >
                          برداشتن
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === 'finished' && (
              <div className="space-y-3">
                {(personal.library?.finished.length ?? 0) === 0 ? (
                  <EmptyState
                    title="هنوز چیزی را کامل نکرده‌ای"
                    description="وقتی به آخرین فصل برسی، قصه خودش به قفسهٔ خوانده‌شده‌ها منتقل می‌شود."
                    compact
                  />
                ) : (
                  personal.library?.finished.map((item) => (
                    <div key={item.novel.id} className="flex items-center gap-4 rounded-2xl border border-gold/25 bg-[#fffaf1] p-4">
                      <BookCover
                        title={item.novel.title}
                        palette={item.novel.coverPalette}
                        motif={item.novel.coverMotif}
                        coverImageUrl={item.novel.coverImageUrl}
                        size="sm"
                        className="h-20 w-14 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-display text-sm font-bold text-plum">{item.novel.title}</p>
                        <p className="mt-1 text-[11px] text-ink/50">خوانده‌شده · {toFa(item.novel.chapterCount)} فصل</p>
                      </div>
                      <MagicalButton to={`/novels/${item.novel.slug}`} size="sm" variant="outline">
                        مرور قصه
                      </MagicalButton>
                    </div>
                  ))
                )}
              </div>
            )}

          </>
        )}
      </div>
    </div>
  )
}
