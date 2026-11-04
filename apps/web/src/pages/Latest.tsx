import { Link } from 'react-router-dom'
import { BookCover } from '../components/art/BookCover'
import { FloralDivider, StarField } from '../components/art/Ornaments'
import { IconClock } from '../components/art/Icons'
import { EmptyState, RowSkeleton } from '../components/ui/Feedback'
import { MagicalButton } from '../components/ui/MagicalButton'
import { useApi, useSeo } from '../lib/hooks'
import { formatFaDate, toFa } from '../lib/format'
import type { LatestChapter } from '../lib/types'

export function LatestPage() {
  const { data, loading, error, reload } = useApi<{ chapters: LatestChapter[] }>('/latest-chapters?limit=20')

  useSeo({
    title: 'تازه‌ترین فصل‌ها',
    description: 'آخرین فصل‌هایی که در کتابخانهٔ مون‌بری منتشر شده‌اند، به ترتیب تاریخ انتشار.',
    path: '/latest',
  })

  return (
    <div className="bg-parchment">
      <section className="relative overflow-hidden bg-night-sky py-12 text-parchment sm:py-16">
        <StarField count={24} seed={53} />
        <div className="container-page relative">
          <p className="eyebrow text-gold">تازه از دفتر نویسنده</p>
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">تازه‌ترین فصل‌ها</h1>
          <p className="mt-3 max-w-2xl text-[13px] leading-7 text-lavender/75">
            هر فصل تازه، یک چراغ است که در کتابخانه روشن می‌شود. جدیدترین‌ها بالای فهرست‌اند.
          </p>
          <div className="mt-5">
            <FloralDivider className="w-52" tone="light" />
          </div>
        </div>
      </section>

      <div className="container-page py-12">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <RowSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <EmptyState
            title="فهرست تازه‌ها باز نشد"
            description={error}
            action={<MagicalButton variant="outline" size="sm" onClick={reload}>تلاش دوباره</MagicalButton>}
          />
        ) : (data?.chapters.length ?? 0) === 0 ? (
          <EmptyState
            title="هنوز فصلی منتشر نشده"
            description="به‌زودی اولین فصل‌ها همین‌جا روشن می‌شوند."
            pose="lantern"
            action={<MagicalButton to="/novels" size="sm">دیدن رمان‌ها</MagicalButton>}
          />
        ) : (
          <ol className="space-y-3">
            {data?.chapters.map((chapter, index) => (
              <li key={chapter.id}>
                <Link
                  to={`/read/${chapter.novel.slug}/${chapter.slug}`}
                  className="group flex items-center gap-4 rounded-2xl border border-gold/25 bg-[#fffaf1] p-4 transition hover:-translate-y-0.5 hover:border-gold/55 hover:shadow-card sm:gap-6"
                >
                  <span className="hidden w-8 shrink-0 text-center font-wordmark text-lg text-gold/70 sm:block">
                    {toFa(index + 1)}
                  </span>
                  <BookCover
                    title={chapter.novel.title}
                    palette={chapter.novel.coverPalette}
                    motif={chapter.novel.coverMotif}
                    coverImageUrl={chapter.novel.coverImageUrl}
                    size="sm"
                    className="h-24 w-16 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-ink/45">
                      {chapter.novel.title} · فصل {toFa(chapter.number)}
                    </p>
                    <p className="mt-1 font-display text-[15px] font-semibold text-plum group-hover:text-[#6b4270]">
                      {chapter.title}
                    </p>
                    <p className="mt-2 flex flex-wrap items-center gap-3 text-[10.5px] text-ink/45">
                      <span>{formatFaDate(chapter.publishedAt)}</span>
                      <span className="inline-flex items-center gap-1">
                        <IconClock className="h-3 w-3" />
                        {toFa(chapter.readingMinutes)} دقیقه
                      </span>
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full border border-gold/40 px-3 py-1 text-[10px] text-[#8a5f74] transition group-hover:bg-gold/15">
                    خواندن
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}
