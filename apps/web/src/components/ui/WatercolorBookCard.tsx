import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { BookCover } from '../art/BookCover'
import { IconBookmark, IconClock, IconHeart } from '../art/Icons'
import { readingLength, STATUS_LABELS, toFa } from '../../lib/format'
import type { Novel } from '../../lib/types'
import { MagicalButton } from './MagicalButton'

export interface NovelCardProps {
  novel: Novel
  favorited?: boolean
  onToggleFavorite?: () => void
  resume?: { chapterSlug: string; percent: number } | null
  className?: string
}

export function WatercolorBookCard({ novel, favorited, onToggleFavorite, resume, className }: NovelCardProps) {
  const startSlug = resume?.chapterSlug || novel.chapters[0]?.slug
  const hasProgress = Boolean(resume?.chapterSlug)

  return (
    <article
      className={clsx(
        'group relative flex h-full flex-col overflow-hidden rounded-[22px] border border-gold/25 bg-[#fffaf1] p-4 shadow-card transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/50 hover:shadow-[0_30px_60px_-26px_rgba(39,26,59,0.45)]',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_60%_at_0%_0%,rgba(255,255,255,0.75),transparent_55%)]" />

      <div className="relative">
        <Link to={`/novels/${novel.slug}`} className="block" aria-label={`جزئیات ${novel.title}`}>
          <div className="relative overflow-hidden rounded-[14px]">
            <BookCover
              title={novel.title}
              palette={novel.coverPalette}
              motif={novel.coverMotif}
              coverImageUrl={novel.coverImageUrl}
              className="aspect-[2/3] w-full transition-transform duration-700 group-hover:scale-[1.035]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-plum/35 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <span
              className={clsx(
                'absolute right-2.5 top-2.5 rounded-full px-2.5 py-1 text-[10px] tracking-wide shadow-sm backdrop-blur',
                novel.status === 'COMPLETED'
                  ? 'bg-[#506A55]/90 text-parchment'
                  : 'bg-[#2a2148]/85 text-parchment',
              )}
            >
              {STATUS_LABELS[novel.status]}
            </span>
            {novel.isDemo && (
              <span className="absolute left-2.5 top-2.5 rounded-full bg-white/80 px-2 py-0.5 text-[9px] text-plum/70">
                نمونه
              </span>
            )}
          </div>
        </Link>

        {onToggleFavorite && (
          <button
            type="button"
            onClick={onToggleFavorite}
            aria-label={favorited ? `حذف ${novel.title} از علاقه‌مندی‌ها` : `افزودن ${novel.title} به علاقه‌مندی‌ها`}
            aria-pressed={Boolean(favorited)}
            className={clsx(
              'absolute bottom-2.5 left-2.5 grid h-9 w-9 place-items-center rounded-full border backdrop-blur transition',
              favorited
                ? 'border-berry/70 bg-berry/85 text-plum'
                : 'border-white/50 bg-plum/45 text-parchment hover:bg-plum/70',
            )}
          >
            <IconHeart className="h-4 w-4" filled={Boolean(favorited)} />
          </button>
        )}
      </div>

      <div className="relative mt-4 flex flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-1.5">
          {novel.genres.slice(0, 2).map((genre) => (
            <span key={genre.slug} className="chip py-0.5 text-[10px]">
              {genre.name}
            </span>
          ))}
        </div>

        <h3 className="mt-2 font-display text-lg font-bold leading-snug text-plum">
          <Link to={`/novels/${novel.slug}`} className="transition-colors hover:text-[#6b4270]">
            {novel.title}
          </Link>
        </h3>
        <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-6 text-ink/60">{novel.description}</p>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink/55">
          <span className="inline-flex items-center gap-1">
            <IconBookmark className="h-3.5 w-3.5" />
            {toFa(novel.chapterCount)} فصل
          </span>
          <span className="inline-flex items-center gap-1">
            <IconClock className="h-3.5 w-3.5" />
            {readingLength(novel.readingMinutes)}
          </span>
          {novel.favoriteCount > 0 && (
            <span className="inline-flex items-center gap-1">
              <IconHeart className="h-3.5 w-3.5" filled />
              {toFa(novel.favoriteCount)}
            </span>
          )}
        </div>

        <div className="mt-auto pt-4">
          {startSlug ? (
            <MagicalButton
              to={`/read/${novel.slug}/${startSlug}`}
              variant={hasProgress ? 'gold' : 'primary'}
              size="sm"
              className="w-full"
            >
              {hasProgress ? 'ادامهٔ مطالعه' : 'شروع مطالعه'}
            </MagicalButton>
          ) : (
            <div className="rounded-full border border-plum/10 bg-vanilla/60 px-3 py-2 text-center text-[11px] text-ink/50">
              فصل‌ها به‌زودی منتشر می‌شوند
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
