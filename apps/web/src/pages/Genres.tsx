import { Link } from 'react-router-dom'
import { GenreIcon, IconSparkle } from '../components/art/Icons'
import { FloralDivider, StarField } from '../components/art/Ornaments'
import { EmptyState } from '../components/ui/Feedback'
import { MagicalButton } from '../components/ui/MagicalButton'
import { useApi, useSeo } from '../lib/hooks'
import { usePersonalLibrary } from '../lib/usePersonalLibrary'
import { MOOD_META, toFa } from '../lib/format'
import type { Genre } from '../lib/types'

export function GenresPage() {
  const { data, loading } = useApi<{ genres: Genre[] }>('/genres')
  const personal = usePersonalLibrary()

  useSeo({
    title: 'دسته‌بندی‌های مون‌بری',
    description: 'دسته‌بندی رمان‌های مون‌بری بر اساس ژانر و حال‌وهوا: فانتزی، رازآلود، عاشقانه، ماجراجویی و بیشتر.',
    path: '/genres',
  })

  return (
    <div className="bg-parchment">
      <section className="relative overflow-hidden bg-night-sky py-12 text-parchment sm:py-16">
        <StarField count={30} seed={41} />
        <div className="container-page relative">
          <p className="eyebrow text-gold">قفسه‌های کتابخانه</p>
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">دسته‌بندی‌ها</h1>
          <p className="mt-3 max-w-2xl text-[13px] leading-7 text-lavender/75">
            از ژانر شروع کن یا سراغ حال‌وهوا برو؛ هر دو راه به یک قصهٔ خوب می‌رسند.
          </p>
          <div className="mt-5">
            <FloralDivider className="w-52" tone="light" />
          </div>
        </div>
      </section>

      <div className="container-page py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => <div key={index} className="skeleton h-36 rounded-2xl" />)
            : data?.genres.map((genre) => (
                <Link
                  key={genre.slug}
                  to={`/novels?genre=${genre.slug}`}
                  className="group flex items-start gap-4 rounded-[22px] border border-gold/25 bg-[#fffaf1] p-5 transition hover:-translate-y-1 hover:border-gold/55 hover:shadow-card"
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-plum/6 text-[#8a5f74] transition group-hover:bg-gold/25 group-hover:text-plum">
                    <GenreIcon icon={genre.icon} className="h-6 w-6" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-baseline gap-2">
                      <span className="font-display text-[15px] font-bold text-plum">{genre.name}</span>
                      <span className="text-[10px] text-ink/40">{toFa(genre.novelCount)} رمان</span>
                    </span>
                    <span className="mt-1.5 block text-[11.5px] leading-6 text-ink/55">{genre.description}</span>
                  </span>
                </Link>
              ))}
        </div>

        <section className="mt-14">
          <p className="eyebrow">یا شاید دنبال یک حال باشی</p>
          <h2 className="mt-3 font-display text-xl font-bold text-plum sm:text-2xl">امشب دلت چه داستانی می‌خواد؟</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {Object.entries(MOOD_META).map(([key, meta]) => (
              <Link
                key={key}
                to={`/novels?mood=${key}`}
                className="group rounded-2xl border border-gold/25 bg-[#fffaf1] px-3 py-4 text-center transition hover:-translate-y-1 hover:border-gold/55 hover:shadow-card"
              >
                <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-plum/6 text-[#8a5f74] group-hover:bg-gold/25">
                  <IconSparkle className="h-4 w-4" />
                </span>
                <span className="mt-2 block font-display text-[12px] font-semibold leading-5 text-plum">{meta.label}</span>
                <span className="mt-1 block text-[9.5px] leading-4 text-ink/40">{meta.hint}</span>
              </Link>
            ))}
          </div>
        </section>

        {!loading && !data?.genres.length && (
          <div className="mt-10">
            <EmptyState title="هنوز ژانری ثبت نشده" description="به‌زودی دسته‌بندی‌ها در این صفحه می‌آیند." compact />
          </div>
        )}

        <div className="mt-12 flex flex-wrap gap-3">
          <MagicalButton to="/novels" variant="primary" size="md">
            دیدن همهٔ رمان‌ها
          </MagicalButton>
          <MagicalButton to={personal.lastRead?.chapterSlug ? `/read/${personal.lastRead.novelSlug}/${personal.lastRead.chapterSlug}` : '/library'} variant="outline" size="md">
            ادامهٔ مطالعه
          </MagicalButton>
        </div>
      </div>
    </div>
  )
}
