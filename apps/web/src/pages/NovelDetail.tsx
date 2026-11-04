import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import clsx from 'clsx'
import { BookCover } from '../components/art/BookCover'
import { FloralDivider, StarField } from '../components/art/Ornaments'
import { IconClock, IconHeart, IconSparkle } from '../components/art/Icons'
import { MagicalButton } from '../components/ui/MagicalButton'
import { EmptyState, ErrorNotice, Notice } from '../components/ui/Feedback'
import { WatercolorBookCard } from '../components/ui/WatercolorBookCard'
import { StorybookSection } from '../components/ui/StorybookSection'
import { api, trackView } from '../lib/api'
import { formatFaDate, MOOD_META, readingLength, STATUS_LABELS, toFa } from '../lib/format'
import { useApi, useSeo } from '../lib/hooks'
import { usePersonalLibrary } from '../lib/usePersonalLibrary'
import type { NovelDetailPayload } from '../lib/types'

export function NovelDetailPage() {
  const { slug = '' } = useParams()
  const { data, loading, error, reload } = useApi<NovelDetailPayload>(`/novels/${encodeURIComponent(slug)}`)
  const personal = usePersonalLibrary()
  const [notice, setNotice] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const novel = data?.novel
  const resume = novel ? personal.resumeFor(novel) : null

  useSeo({
    title: novel?.seoTitle || novel?.title || 'رمان مون‌بری',
    description: novel?.seoDescription || novel?.description || 'رمانی از کتابخانهٔ مون‌بری',
    path: `/novels/${slug}`,
    type: 'book',
    jsonLd:
      novel && data
        ? {
            '@context': 'https://schema.org',
            '@type': 'Book',
            name: novel.title,
            description: novel.seoDescription || novel.description,
            inLanguage: 'fa-IR',
            numberOfPages: undefined,
            author: { '@type': 'Person', name: 'نویسندهٔ مون‌بری' },
            publisher: { '@type': 'Organization', name: 'مون‌بری' },
            genre: novel.genres.map((genre) => genre.name),
            datePublished: novel.publishedAt ?? undefined,
            hasPart: novel.chapters.map((chapter) => ({
              '@type': 'Chapter',
              name: chapter.title,
              position: chapter.number,
            })),
          }
        : null,
  })

  useEffect(() => {
    if (novel?.id) void trackView(novel.id)
  }, [novel?.id])

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 2200)
    return () => window.clearTimeout(timer)
  }, [copied])

  if (loading) {
    return (
      <div className="container-page py-16">
        <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
          <div className="skeleton aspect-[2/3] w-full max-w-[280px] rounded-2xl" />
          <div>
            <div className="skeleton h-8 w-2/3 rounded-full" />
            <div className="skeleton mt-4 h-4 w-1/3 rounded-full" />
            <div className="skeleton mt-8 h-3 w-full rounded-full" />
            <div className="skeleton mt-2 h-3 w-11/12 rounded-full" />
            <div className="skeleton mt-2 h-3 w-3/4 rounded-full" />
            <div className="mt-8 flex gap-3">
              <div className="skeleton h-11 w-40 rounded-full" />
              <div className="skeleton h-11 w-32 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !novel) {
    return (
      <div className="container-page py-20">
        <EmptyState
          title="این قصه پیدا نشد"
          description={error || 'شاید نشانی عوض شده باشد. از کتابخانه دوباره انتخاب کن.'}
          pose="lantern"
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <MagicalButton to="/novels" size="sm">بازگشت به کتابخانه</MagicalButton>
              <MagicalButton variant="outline" size="sm" onClick={reload}>تلاش دوباره</MagicalButton>
            </div>
          }
        />
      </div>
    )
  }

  const startHref = resume?.chapterSlug
    ? `/read/${novel.slug}/${resume.chapterSlug}`
    : novel.chapters[0]
      ? `/read/${novel.slug}/${novel.chapters[0].slug}`
      : null

  function handleFavorite() {
    if (!personal.user) {
      setNotice('برای ذخیرهٔ این رمان در کتابخانهٔ شخصی، اول وارد حساب خودت شو. خواندن قصه‌ها بدون حساب هم آزاد است.')
      return
    }
    setNotice(null)
    if (novel) void personal.toggleFavorite(novel.id)
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
    } catch {
      setNotice('مرورگر اجازهٔ کپی نداد؛ می‌توانی نشانی بالای صفحه را خودت کپی کنی.')
    }
  }

  return (
    <div className="bg-parchment">
      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#2a2149,#241c3f_55%,#f8e9d4)] pb-16 pt-8 text-parchment sm:pb-20">
        <StarField count={26} seed={31} />
        <div className="container-page relative">
          <nav className="flex flex-wrap items-center gap-2 text-[11px] text-lavender/60" aria-label="مسیر صفحه">
            <Link to="/" className="hover:text-gold">خانه</Link>
            <span>/</span>
            <Link to="/novels" className="hover:text-gold">رمان‌ها</Link>
            <span>/</span>
            <span className="text-parchment/85">{novel.title}</span>
          </nav>

          <div className="mt-8 grid gap-8 lg:grid-cols-[290px_1fr] lg:gap-12">
            <div className="relative mx-auto w-52 sm:w-60 lg:mx-0 lg:w-full">
              <div className="absolute -inset-3 -z-10 rounded-[24px] border border-gold/25" />
              <BookCover
                title={novel.title}
                palette={novel.coverPalette}
                motif={novel.coverMotif}
                coverImageUrl={novel.coverImageUrl}
                size="lg"
                className="aspect-[2/3] w-full"
              />
              <div className="mt-4 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={handleFavorite}
                  aria-pressed={personal.favoriteIds.has(novel.id)}
                  className={clsx(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] transition',
                    personal.favoriteIds.has(novel.id)
                      ? 'border-berry/60 bg-berry/20 text-[#7b4356]'
                      : 'border-parchment/25 text-parchment/75 hover:border-gold/60 hover:text-gold',
                  )}
                >
                  <IconHeart className="h-3.5 w-3.5" filled={personal.favoriteIds.has(novel.id)} />
                  {personal.favoriteIds.has(novel.id) ? 'در علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
                </button>
                <button
                  type="button"
                  onClick={copyLink}
                  className="rounded-full border border-parchment/25 px-3 py-1.5 text-[11px] text-parchment/70 transition hover:border-gold/60 hover:text-gold"
                >
                  {copied ? 'کپی شد' : 'هم‌رسانی'}
                </button>
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-gold/40 bg-gold/15 px-2.5 py-1 text-[10.5px] text-gold">
                  {STATUS_LABELS[novel.status]}
                </span>
                {novel.isDemo && (
                  <span className="rounded-full border border-parchment/25 px-2.5 py-1 text-[10px] text-parchment/60">
                    قصهٔ نمونه
                  </span>
                )}
                {novel.genres.map((genre) => (
                  <Link
                    key={genre.slug}
                    to={`/novels?genre=${genre.slug}`}
                    className="rounded-full border border-parchment/20 bg-white/5 px-2.5 py-1 text-[10.5px] text-parchment/75 transition hover:border-gold/50 hover:text-gold"
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>

              <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight text-parchment sm:text-4xl">{novel.title}</h1>
              {novel.subtitle && <p className="mt-2 font-display text-sm text-lavender/80">{novel.subtitle}</p>}

              <p className="mt-5 max-w-3xl text-[13px] leading-8 text-lavender/75">{novel.description}</p>

              <dl className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-3 text-[11px] text-lavender/60">
                <div>
                  <dt className="text-[10px] text-lavender/45">نویسنده</dt>
                  <dd className="mt-1 text-parchment/85">نویسندهٔ مون‌بری</dd>
                </div>
                <div>
                  <dt className="text-[10px] text-lavender/45">فصل‌های منتشرشده</dt>
                  <dd className="mt-1 text-parchment/85">{toFa(novel.chapterCount)} فصل</dd>
                </div>
                <div>
                  <dt className="text-[10px] text-lavender/45">زمان تقریبی مطالعه</dt>
                  <dd className="mt-1 flex items-center gap-1 text-parchment/85">
                    <IconClock className="h-3 w-3" /> {readingLength(novel.readingMinutes)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] text-lavender/45">آخرین به‌روزرسانی</dt>
                  <dd className="mt-1 text-parchment/85">
                    {novel.latestChapter?.publishedAt ? formatFaDate(novel.latestChapter.publishedAt) : '—'}
                  </dd>
                </div>
              </dl>

              {novel.contentWarning && (
                <div className="mt-6 max-w-2xl rounded-xl border border-berry/40 bg-berry/10 px-4 py-3 text-[11.5px] leading-6 text-berry/90">
                  <span className="font-semibold">هشدار محتوا: </span>
                  {novel.contentWarning}
                </div>
              )}

              <div className="mt-8 flex flex-wrap gap-3">
                {startHref ? (
                  <MagicalButton to={startHref} variant="gold" size="lg" icon={<IconSparkle className="h-4 w-4" />}>
                    {resume ? 'ادامهٔ مطالعه' : 'شروع مطالعه'}
                  </MagicalButton>
                ) : (
                  <span className="rounded-full border border-parchment/20 px-4 py-2 text-[12px] text-parchment/55">
                    فصل‌ها به‌زودی منتشر می‌شوند
                  </span>
                )}
                <MagicalButton to="/novels" variant="night" size="lg">
                  بازگشت به کتابخانه
                </MagicalButton>
              </div>

              {resume && (
                <p className="mt-3 text-[11px] text-lavender/50">
                  آخرین جای خواندن تو در این رمان ذخیره شده است؛ از همان‌جا ادامه بده.
                </p>
              )}

              {notice && (
                <div className="mt-5 max-w-xl">
                  <Notice>
                    {notice}{' '}
                    <Link to="/login" className="font-medium underline underline-offset-4">ورود</Link>
                  </Notice>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-parchment to-transparent" />
      </section>

      <div className="container-page pb-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          <section aria-labelledby="chapters-title">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">فهرست فصل‌ها</p>
                <h2 id="chapters-title" className="mt-2 font-display text-xl font-bold text-plum sm:text-2xl">
                  فصل‌های {novel.title}
                </h2>
              </div>
              <span className="text-[11px] text-ink/45">{toFa(novel.chapterCount)} فصل</span>
            </div>
            <div className="mt-4 w-40">
              <FloralDivider className="w-full" />
            </div>

            {novel.chapters.length === 0 ? (
              <div className="mt-6">
                <EmptyState title="هنوز فصلی منتشر نشده" description="به‌محض انتشار اولین فصل، همین‌جا برای خواندن باز می‌شود." compact />
              </div>
            ) : (
              <ol className="mt-6 space-y-2.5">
                {novel.chapters.map((chapter) => {
                  const isCurrent = resume?.chapterSlug === chapter.slug
                  return (
                    <li key={chapter.id}>
                      <Link
                        to={`/read/${novel.slug}/${chapter.slug}`}
                        className={clsx(
                          'group flex items-start gap-4 rounded-2xl border p-4 transition',
                          isCurrent
                            ? 'border-gold/60 bg-[#fff7e9] shadow-sm'
                            : 'border-gold/20 bg-[#fffaf1] hover:border-gold/45 hover:shadow-card',
                        )}
                      >
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/40 bg-vanilla/70 font-display text-sm font-bold text-[#8a5f74]">
                          {toFa(chapter.number)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="font-display text-[14px] font-semibold text-plum group-hover:text-[#6b4270]">
                              {chapter.title}
                            </span>
                            {isCurrent && (
                              <span className="rounded-full bg-gold/25 px-2 py-0.5 text-[9.5px] text-[#7a5a33]">آخرین جای تو</span>
                            )}
                          </span>
                          {chapter.summary && (
                            <span className="mt-1 line-clamp-1 block text-[11px] leading-5 text-ink/50">{chapter.summary}</span>
                          )}
                          <span className="mt-1.5 flex flex-wrap items-center gap-3 text-[10px] text-ink/40">
                            <span>{formatFaDate(chapter.publishedAt)}</span>
                            <span className="inline-flex items-center gap-1">
                              <IconClock className="h-3 w-3" />
                              {toFa(chapter.readingMinutes)} دقیقه
                            </span>
                            <span>{toFa(chapter.wordCount)} واژه</span>
                          </span>
                        </span>
                        <span className="shrink-0 self-center rounded-full border border-gold/35 px-3 py-1 text-[10px] text-[#8a5f74] transition group-hover:bg-gold/15">
                          خواندن
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ol>
            )}
          </section>

          <aside className="space-y-5">
            <div className="ornament-frame rounded-[22px] p-5">
              <p className="eyebrow">دربارهٔ این قصه</p>
              <ul className="mt-4 space-y-3 text-[12px] text-ink/65">
                <li className="flex items-center justify-between gap-3">
                  <span className="text-ink/45">وضعیت</span>
                  <span>{STATUS_LABELS[novel.status]}</span>
                </li>
                <li className="flex items-center justify-between gap-3">
                  <span className="text-ink/45">فصل‌ها</span>
                  <span>{toFa(novel.chapterCount)}</span>
                </li>
                <li className="flex items-center justify-between gap-3">
                  <span className="text-ink/45">واژگان</span>
                  <span>{toFa(novel.totalWords)}</span>
                </li>
                <li className="flex items-start justify-between gap-3">
                  <span className="shrink-0 text-ink/45">حال‌وهوا</span>
                  <span className="text-end">
                    {novel.moods.length
                      ? novel.moods.map((mood) => MOOD_META[mood]?.label ?? mood).join(' · ')
                      : '—'}
                  </span>
                </li>
                <li className="flex items-center justify-between gap-3">
                  <span className="text-ink/45">علاقه‌مندی خوانندگان</span>
                  <span>{novel.favoriteCount > 0 ? toFa(novel.favoriteCount) : 'هنوز ذخیره‌ای نیست'}</span>
                </li>
                <li className="flex items-center justify-between gap-3">
                  <span className="text-ink/45">بازدید واقعی</span>
                  <span>{novel.viewCount > 0 ? toFa(novel.viewCount) : 'هنوز بازدیدی ثبت نشده'}</span>
                </li>
              </ul>
              <div className="mt-5 border-t border-gold/25 pt-4 text-[11px] leading-6 text-ink/50">
                خواندن این رمان بدون حساب هم آزاد است؛ با حساب، پیشرفت خواندن و نشانک‌ها روی همهٔ دستگاه‌هایت می‌ماند.
              </div>
            </div>

            {novel.featured && novel.featuredNote && (
              <div className="rounded-[22px] border border-gold/40 bg-[linear-gradient(145deg,#fffaf1,#f6e3c8)] p-5">
                <p className="eyebrow">انتخاب جادوگر کوچولو</p>
                <p className="mt-3 text-[12px] leading-7 text-ink/65">{novel.featuredNote}</p>
              </div>
            )}
          </aside>
        </div>
      </div>

      {data && data.related.length > 0 && (
        <StorybookSection tone="cream" title="قصه‌های هم‌خو" description="رمان‌هایی از همین کتابخانه که حال‌وهوای نزدیکی به این قصه دارند.">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.related.map((item) => (
              <WatercolorBookCard
                key={item.id}
                novel={item}
                favorited={personal.favoriteIds.has(item.id)}
                onToggleFavorite={() => {
                  if (!personal.user) {
                    setNotice('برای ذخیرهٔ رمان‌ها باید وارد حساب شوی.')
                    return
                  }
                  void personal.toggleFavorite(item.id)
                }}
                resume={personal.resumeFor(item)}
              />
            ))}
          </div>
        </StorybookSection>
      )}

      {error && (
        <div className="container-page pb-16">
          <ErrorNotice message={error} onRetry={reload} />
        </div>
      )}

    </div>
  )
}
