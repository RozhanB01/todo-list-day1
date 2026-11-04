import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { HomeHero } from '../components/home/HomeHero'
import { MoodDiscovery } from '../components/home/MoodDiscovery'
import { WatercolorBookCard } from '../components/ui/WatercolorBookCard'
import { StorybookSection } from '../components/ui/StorybookSection'
import { CardSkeleton, EmptyState, ErrorNotice, Notice, RowSkeleton } from '../components/ui/Feedback'
import { MagicalButton } from '../components/ui/MagicalButton'
import { BookCover } from '../components/art/BookCover'
import { GenreIcon, IconClock, IconHeart, IconSparkle } from '../components/art/Icons'
import { FloralDivider, StarField } from '../components/art/Ornaments'
import { WitchMascot } from '../components/art/WitchMascot'
import { relativeFa, STATUS_LABELS, toFa } from '../lib/format'
import { useApi, useSeo } from '../lib/hooks'
import { usePersonalLibrary } from '../lib/usePersonalLibrary'
import type { HomePayload, Novel } from '../lib/types'

const QUICK_LINKS = [
  { label: 'رمان‌های کامل', to: '/novels?status=completed', icon: 'book' },
  { label: 'ادامهٔ مطالعه', to: '/library', icon: 'lantern', dynamic: true },
  { label: 'در حال انتشار', to: '/novels?status=ongoing', icon: 'feather' },
  { label: 'برترین‌ها', to: '/novels?sort=popular', icon: 'wand' },
  { label: 'تازه‌ترین‌ها', to: '/latest', icon: 'compass' },
  { label: 'پیشنهاد مون‌بری', to: '#featured', icon: 'heart' },
]

export function HomePage() {
  const { data: home, loading, error, reload } = useApi<HomePayload>('/home')
  const personal = usePersonalLibrary()
  const navigate = useNavigate()
  const [activeMood, setActiveMood] = useState<string | null>(null)
  const [activeGenre, setActiveGenre] = useState<string | null>(null)
  const [sort, setSort] = useState<'newest' | 'popular'>('newest')
  const [notice, setNotice] = useState<string | null>(null)

  useSeo({
    title: 'مون‌بری؛ کتابخانهٔ جادویی قصه‌ها',
    description:
      'مون‌بری، کتابخانهٔ جادویی رمان‌های فارسی: رمان‌های دنباله‌دار فانتزی، رازآلود و عاشقانه از یک نویسندهٔ مستقل. قصه‌ات را انتخاب کن و همین‌جا بخوان.',
    path: '/',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Moonberry',
      alternateName: 'مون‌بری',
      inLanguage: 'fa-IR',
      description: 'کتابخانهٔ جادویی رمان‌ها و داستان‌های فارسی',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${window.location.origin}/novels?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  })

  const novels = home?.novels ?? []

  const filteredNovels = useMemo(() => {
    let list = [...novels]
    if (activeGenre) list = list.filter((novel) => novel.genres.some((genre) => genre.slug === activeGenre))
    if (activeMood) list = list.filter((novel) => novel.moods.includes(activeMood))
    if (sort === 'popular') list.sort((a, b) => b.favoriteCount - a.favoriteCount || b.viewCount - a.viewCount)
    return list
  }, [novels, activeGenre, activeMood, sort])

  const moodMatches = useMemo(
    () => (activeMood ? novels.filter((novel) => novel.moods.includes(activeMood)) : []),
    [novels, activeMood],
  )

  const related = useMemo(() => {
    const featured = home?.featured
    if (!featured) return novels.slice(0, 3)
    const genreSlugs = new Set(featured.genres.map((genre) => genre.slug))
    return novels
      .filter((novel) => novel.id !== featured.id)
      .map((novel) => ({
        novel,
        score:
          novel.genres.filter((genre) => genreSlugs.has(genre.slug)).length * 2 +
          novel.moods.filter((mood) => featured.moods.includes(mood)).length * 3,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((entry) => entry.novel)
  }, [home, novels])

  const continueHref = personal.lastRead?.chapterSlug
    ? `/read/${personal.lastRead.novelSlug}/${personal.lastRead.chapterSlug}`
    : personal.lastGuestEntry
      ? `/read/${personal.lastGuestEntry.novelSlug}/${personal.lastGuestEntry.chapterSlug}`
      : '/library'

  function handleFavorite(novel: Novel) {
    if (!personal.user) {
      setNotice('برای ذخیرهٔ علاقه‌مندی‌ها و ساختن کتابخانهٔ شخصی، اول وارد شو — خواندن قصه‌ها بدون حساب هم آزاد است.')
      return
    }
    setNotice(null)
    void personal.toggleFavorite(novel.id)
  }

  return (
    <>
      <HomeHero home={home} />

      <div className="container-page relative z-20 -mt-10">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[22px] border border-gold/35 bg-[#f7e6cd] shadow-[0_26px_50px_-30px_rgba(39,26,59,0.5)] sm:grid-cols-3 lg:grid-cols-6">
          {QUICK_LINKS.map((item) => {
            const target = item.dynamic ? continueHref : item.to
            return (
              <Link
                key={item.label}
                to={target}
                className="group flex items-center justify-center gap-2 bg-[#fffaf1] px-3 py-4 text-[12px] text-ink/70 transition hover:bg-white hover:text-plum"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-plum/6 text-[#8a5f74] transition group-hover:bg-gold/25 group-hover:text-plum">
                  <GenreIcon icon={item.icon} className="h-4 w-4" />
                </span>
                <span className="font-display font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>

      <StorybookSection
        id="library"
        eyebrow="کتابخانهٔ مون‌بری"
        title="رمان‌های جادویی مون‌بری"
        description="هر رمان یک اتاق تازه در این کتابخانه است؛ جلدش را ورق بزن، حال‌وهوایش را انتخاب کن و از همان فصل اول شروع کن."
        action={
          <MagicalButton to="/novels" variant="outline" size="sm">
            همهٔ رمان‌ها
          </MagicalButton>
        }
      >
        <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setActiveGenre(null)}
              className={clsx('chip shrink-0', !activeGenre && 'chip-active')}
            >
              همهٔ ژانرها
            </button>
            {(home?.genres ?? []).map((genre) => (
              <button
                key={genre.slug}
                type="button"
                onClick={() => setActiveGenre(activeGenre === genre.slug ? null : genre.slug)}
                aria-pressed={activeGenre === genre.slug}
                className={clsx('chip shrink-0', activeGenre === genre.slug && 'chip-active')}
              >
                <GenreIcon icon={genre.icon} className="h-3.5 w-3.5" />
                {genre.name}
              </button>
            ))}
          </div>

          <label className="flex shrink-0 items-center gap-2 text-[11px] text-ink/55">
            مرتب کردن:
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as 'newest' | 'popular')}
              className="rounded-full border border-plum/15 bg-[#fffaf1] px-3 py-1.5 text-[12px] text-plum outline-none focus:border-gold"
            >
              <option value="newest">جدیدترین</option>
              <option value="popular">محبوب‌ترین (بر اساس علاقه‌مندی واقعی)</option>
            </select>
          </label>
        </div>

        {notice && (
          <div className="mb-6 max-w-2xl">
            <Notice>
              {notice}{' '}
              <Link to="/login" className="font-medium underline underline-offset-4">
                ورود به مون‌بری
              </Link>
            </Notice>
          </div>
        )}

        {loading && !home ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <ErrorNotice message={error} onRetry={reload} />
        ) : filteredNovels.length === 0 ? (
          <EmptyState
            title="این قفسه امشب خالی است"
            description="با این فیلترها قصه‌ای پیدا نشد. می‌توانی فیلترها را برداری یا همهٔ رمان‌ها را ببینی."
            action={
              <MagicalButton
                variant="outline"
                size="sm"
                onClick={() => {
                  setActiveGenre(null)
                  setActiveMood(null)
                }}
              >
                برداشتن فیلترها
              </MagicalButton>
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredNovels.map((novel) => (
              <WatercolorBookCard
                key={novel.id}
                novel={novel}
                favorited={personal.favoriteIds.has(novel.id)}
                onToggleFavorite={() => handleFavorite(novel)}
                resume={personal.resumeFor(novel)}
              />
            ))}
          </div>
        )}
      </StorybookSection>

      <StorybookSection
        id="moods"
        tone="cream"
        eyebrow="کشف بر اساس حال‌وهوا"
        title="امشب دلت چه داستانی می‌خواد؟"
        description="گاهی آدم دنبال کتاب نمی‌گردد؛ دنبال یک حال‌وهواست. یکی از این شش حال را انتخاب کن."
      >
        {home ? (
          <MoodDiscovery
            moods={home.moods}
            genres={home.genres}
            activeMood={activeMood}
            onMoodChange={setActiveMood}
            matches={moodMatches}
            onToggleFavorite={handleFavorite}
            favoriteIds={personal.favoriteIds}
            resumeFor={personal.resumeFor}
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="skeleton h-36 rounded-[20px]" />
            ))}
          </div>
        )}
      </StorybookSection>

      {home?.featured && (
        <section id="featured" className="relative overflow-hidden bg-night-sky py-16 scroll-mt-24 sm:py-20">
          <StarField count={26} seed={11} />
          <div className="container-page relative grid items-center gap-10 lg:grid-cols-[300px_1fr]">
            <div className="relative mx-auto w-52 sm:w-60">
              <div className="absolute -inset-4 -z-10 rounded-full bg-gold/10 blur-2xl" />
              <BookCover
                title={home.featured.title}
                palette={home.featured.coverPalette}
                motif={home.featured.coverMotif}
                coverImageUrl={home.featured.coverImageUrl}
                size="lg"
                className="aspect-[2/3] w-full"
              />
            </div>
            <div>
              <p className="eyebrow flex items-center gap-2 text-gold">
                <IconSparkle className="h-3.5 w-3.5" /> انتخاب جادوگر کوچولو
              </p>
              <h2 className="mt-4 font-display text-2xl font-bold text-parchment sm:text-3xl">
                {home.featured.title}
              </h2>
              <p className="mt-3 max-w-2xl text-[13px] leading-7 text-lavender/75">
                {home.featured.featuredNote || home.featured.description}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-4 text-[11px] text-lavender/55">
                <span>{STATUS_LABELS[home.featured.status]}</span>
                <span className="h-1 w-1 rounded-full bg-gold/60" />
                <span>{toFa(home.featured.chapterCount)} فصل منتشرشده</span>
                <span className="h-1 w-1 rounded-full bg-gold/60" />
                <span>{home.featured.genres.map((genre) => genre.name).join(' · ')}</span>
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <MagicalButton to={`/novels/${home.featured.slug}`} variant="gold" size="md">
                  خواندن این قصه
                </MagicalButton>
                <MagicalButton
                  to={
                    home.featured.chapters[0]
                      ? `/read/${home.featured.slug}/${home.featured.chapters[0].slug}`
                      : '/novels'
                  }
                  variant="night"
                  size="md"
                >
                  شروع از فصل اول
                </MagicalButton>
              </div>
            </div>
          </div>
        </section>
      )}

      <StorybookSection
        id="latest-chapters"
        eyebrow="تازه از دفتر نویسنده"
        title="تازه‌ترین فصل‌ها"
        description="جدیدترین فصل‌هایی که از زیر قلم بیرون آمده‌اند و حالا منتظر تو هستند."
        action={
          <MagicalButton to="/latest" variant="outline" size="sm">
            همهٔ فصل‌ها
          </MagicalButton>
        }
      >
        {loading && !home ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <RowSkeleton key={index} />
            ))}
          </div>
        ) : (home?.latestChapters.length ?? 0) === 0 ? (
          <EmptyState
            title="هنوز فصلی منتشر نشده"
            description="به‌زودی اولین فصل‌ها همین‌جا روشن می‌شوند. تا آن موقع می‌توانی رمان‌ها را ببینی."
            pose="lantern"
            compact
          />
        ) : (
          <ul className="grid gap-3 lg:grid-cols-2">
            {home?.latestChapters.map((chapter) => (
              <li key={chapter.id}>
                <Link
                  to={`/read/${chapter.novel.slug}/${chapter.slug}`}
                  className="group flex items-center gap-4 rounded-2xl border border-gold/25 bg-[#fffaf1] p-3.5 transition hover:-translate-y-0.5 hover:border-gold/55 hover:shadow-card"
                >
                  <BookCover
                    title={chapter.novel.title}
                    palette={chapter.novel.coverPalette}
                    motif={chapter.novel.coverMotif}
                    coverImageUrl={chapter.novel.coverImageUrl}
                    size="sm"
                    className="h-[76px] w-[52px] shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-ink/45">
                      {chapter.novel.title} · فصل {toFa(chapter.number)}
                    </p>
                    <p className="mt-1 truncate font-display text-[14px] font-semibold text-plum group-hover:text-[#6b4270]">
                      {chapter.title}
                    </p>
                    <p className="mt-1.5 flex items-center gap-3 text-[10.5px] text-ink/45">
                      <span className="inline-flex items-center gap-1">
                        <IconClock className="h-3 w-3" />
                        {toFa(chapter.readingMinutes)} دقیقه
                      </span>
                      <span>{relativeFa(chapter.publishedAt)}</span>
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full border border-gold/40 px-3 py-1 text-[10px] text-[#8a5f74] transition group-hover:bg-gold/15">
                    خواندن
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </StorybookSection>

      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#f8e9d4,#fff5e8)] py-16 sm:py-20">
        <div className="pointer-events-none absolute -left-10 top-10 h-64 w-64 rounded-full bg-lavender/20 blur-3xl" />
        <div className="container-page relative grid items-center gap-10 lg:grid-cols-[1fr_320px]">
          <div>
            <p className="eyebrow">گوشهٔ دنج مون‌بری</p>
            <h2 className="mt-3 font-display text-2xl font-bold text-plum sm:text-3xl">
              یک نویسنده، یک فنجان چای، و قصه‌هایی که شب‌ها نوشته می‌شوند
            </h2>
            <p className="mt-4 max-w-2xl text-[13px] leading-8 text-ink/65">
              مون‌بری دفتر کار یک نویسندهٔ مستقل است، نه یک فروشگاه. این‌جا هر رمان با حوصله نوشته می‌شود، فصل‌به‌فصل
              منتشر می‌شود و پیش از انتشار چند بار خوانده و ویرایش می‌شود. اگر جایی از قصه دلت را برد، یا جایی جا گذاشت،
              برایم بنویس؛ خواننده‌ها بخشی از این دفترند.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <MagicalButton to="/about" variant="primary" size="md">
                آشنایی با دنیای مون‌بری
              </MagicalButton>
              <MagicalButton to="/contact" variant="outline" size="md">
                نوشتن برای نویسنده
              </MagicalButton>
            </div>
            <div className="mt-8 max-w-xs">
              <FloralDivider className="w-full" tone="plum" />
            </div>
          </div>
          <div className="relative mx-auto">
            <div className="absolute inset-x-4 bottom-4 -z-10 h-40 rounded-full bg-gold/20 blur-2xl" />
            <WitchMascot pose="lantern" className="h-64 w-auto sm:h-72" />
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <StorybookSection
          title="داستان‌هایی که شاید دوست داشته باشی"
          description="قصه‌هایی از همین کتابخانه که حال‌وهوایشان به انتخاب‌های تو نزدیک است."
          action={
            <MagicalButton to="/novels" variant="outline" size="sm">
              کشف بیشتر
            </MagicalButton>
          }
        >
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((novel) => (
              <WatercolorBookCard
                key={novel.id}
                novel={novel}
                favorited={personal.favoriteIds.has(novel.id)}
                onToggleFavorite={() => handleFavorite(novel)}
                resume={personal.resumeFor(novel)}
              />
            ))}
          </div>
        </StorybookSection>
      )}
    </>
  )
}
