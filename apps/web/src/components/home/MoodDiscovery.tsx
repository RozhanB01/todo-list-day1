import { useState } from 'react'
import clsx from 'clsx'
import { BookCover } from '../art/BookCover'
import { MoodIcon, IconSparkle } from '../art/Icons'
import { WitchMascot } from '../art/WitchMascot'
import { MagicalButton } from '../ui/MagicalButton'
import { Notice, Spinner } from '../ui/Feedback'
import { api } from '../../lib/api'
import { MOOD_META, toFa } from '../../lib/format'
import type { Genre, Novel } from '../../lib/types'

interface MoodDiscoveryProps {
  moods: Array<{ key: string; label: string; count: number }>
  genres: Genre[]
  activeMood: string | null
  onMoodChange: (mood: string | null) => void
  matches: Novel[]
  onToggleFavorite: (novel: Novel) => void
  favoriteIds: Set<string>
  resumeFor: (novel: Novel) => { chapterSlug: string } | null
}

export function MoodDiscovery({
  moods,
  genres,
  activeMood,
  onMoodChange,
  matches,
  onToggleFavorite,
  favoriteIds,
  resumeFor,
}: MoodDiscoveryProps) {
  const [oracleMood, setOracleMood] = useState<string | null>(null)
  const [oracleGenre, setOracleGenre] = useState<string | null>(null)
  const [result, setResult] = useState<{
    novel: Novel | null
    reason: string
    alternatives: Novel[]
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function findStory() {
    if (!oracleMood && !oracleGenre) {
      setError('اول یک حال‌وهوا یا ژانر انتخاب کن تا قصه را پیدا کنم.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const query = new URLSearchParams()
      if (oracleMood) query.set('mood', oracleMood)
      if (oracleGenre) query.set('genre', oracleGenre)
      const payload = await api<{ novel: Novel | null; reason: string; alternatives: Novel[] }>(
        `/recommend?${query.toString()}`,
      )
      setResult(payload)
    } catch {
      setError('این‌بار جادو کار نکرد؛ دوباره تلاش کن.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {moods.map((mood) => {
          const meta = MOOD_META[mood.key]
          const active = activeMood === mood.key
          return (
            <button
              key={mood.key}
              type="button"
              onClick={() => {
                const next = active ? null : mood.key
                onMoodChange(next)
                setOracleMood(next)
                document.getElementById('mood-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              aria-pressed={active}
              className={clsx(
                'group relative flex flex-col items-center gap-2.5 overflow-hidden rounded-[20px] border px-3 py-5 text-center transition-all duration-400',
                active
                  ? 'border-gold/70 bg-gradient-to-b from-[#fffaf0] to-[#f7e6cd] shadow-[0_18px_40px_-24px_rgba(39,26,59,0.5)]'
                  : 'border-gold/25 bg-[#fffaf1]/85 hover:-translate-y-1 hover:border-gold/50 hover:shadow-card',
              )}
            >
              <span
                className={clsx(
                  'grid h-12 w-12 place-items-center rounded-full transition-colors',
                  active ? 'bg-[#2f2450] text-gold' : 'bg-plum/6 text-[#8a5f74] group-hover:bg-plum/10',
                )}
              >
                <MoodIcon mood={mood.key} className="h-6 w-6" />
              </span>
              <span className="font-display text-[13px] font-semibold leading-6 text-plum">{meta?.label ?? mood.label}</span>
              <span className="text-[10px] text-ink/45">{toFa(mood.count)} قصه</span>
            </button>
          )
        })}
      </div>

      <div id="mood-results" className="scroll-mt-28">
        {activeMood ? (
          matches.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {matches.map((novel) => {
                const resume = resumeFor(novel)
                return (
                  <div
                    key={novel.id}
                    className="flex items-center gap-4 rounded-2xl border border-gold/25 bg-[#fffaf1] p-3 transition hover:border-gold/50 hover:shadow-card"
                  >
                    <BookCover
                      title={novel.title}
                      palette={novel.coverPalette}
                      motif={novel.coverMotif}
                      coverImageUrl={novel.coverImageUrl}
                      size="sm"
                      className="h-24 w-16 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-sm font-bold text-plum">{novel.title}</p>
                      <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-ink/55">{novel.description}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <MagicalButton
                          to={
                            resume
                              ? `/read/${novel.slug}/${resume.chapterSlug}`
                              : `/novels/${novel.slug}`
                          }
                          variant="outline"
                          size="sm"
                          className="px-3 py-1 text-[11px]"
                        >
                          {resume ? 'ادامه' : 'دیدن قصه'}
                        </MagicalButton>
                        <button
                          type="button"
                          onClick={() => onToggleFavorite(novel)}
                          className={clsx(
                            'rounded-full border px-2.5 py-1 text-[10px] transition',
                            favoriteIds.has(novel.id)
                              ? 'border-berry/60 bg-berry/20 text-[#7b4356]'
                              : 'border-plum/15 text-ink/50 hover:border-gold/50',
                          )}
                        >
                          {favoriteIds.has(novel.id) ? 'ذخیره شده' : 'ذخیره'}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-gold/25 bg-[#fffaf1] px-5 py-8 text-center">
              <p className="font-display text-sm text-plum">هنوز قصه‌ای با این حال‌وهوا منتشر نشده است.</p>
              <p className="mt-2 text-[12px] text-ink/55">می‌توانی حال‌وهوای دیگری را امتحان کنی یا همهٔ رمان‌ها را ببینی.</p>
              <MagicalButton to="/novels" variant="outline" size="sm" className="mt-4">
                دیدن همهٔ رمان‌ها
              </MagicalButton>
            </div>
          )
        ) : (
          <p className="text-center text-[12px] text-ink/45">
            یکی از حال‌وهواها را انتخاب کن تا قصه‌های هم‌خو با آن را نشانت بدهم.
          </p>
        )}
      </div>

      {/* قصهٔ امشب من */}
      <div className="relative overflow-hidden rounded-[26px] border border-gold/30 bg-[linear-gradient(135deg,#fffaf1,#f7e7d0)] p-6 sm:p-8">
        <div className="pointer-events-none absolute -left-6 -top-6 h-40 w-40 rounded-full bg-berry/12 blur-2xl" />
        <div className="grid gap-7 lg:grid-cols-[1fr_320px] lg:items-center">
          <div>
            <p className="eyebrow">قصهٔ امشب من</p>
            <h3 className="mt-3 font-display text-xl font-bold text-plum sm:text-2xl">
              بگو امشب دلت چه می‌خواهد، یک قصه برایت پیدا می‌کنم
            </h3>
            <p className="mt-2 max-w-xl text-[12.5px] leading-7 text-ink/60">
              این انتخاب با یک جست‌وجوی ساده در کتابخانه انجام می‌شود؛ بدون هیچ جادوی پنهانی. حال‌وهوا و ژانر را انتخاب کن.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <p className="mb-2 text-[11px] text-ink/50">حال‌وهوا</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(MOOD_META).map(([key, meta]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setOracleMood(oracleMood === key ? null : key)}
                      aria-pressed={oracleMood === key}
                      className={clsx('chip', oracleMood === key ? 'chip-active' : 'hover:border-gold/50')}
                    >
                      <MoodIcon mood={key} className="h-4 w-4" />
                      {meta.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-[11px] text-ink/50">ژانر</p>
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre) => (
                    <button
                      key={genre.slug}
                      type="button"
                      onClick={() => setOracleGenre(oracleGenre === genre.slug ? null : genre.slug)}
                      aria-pressed={oracleGenre === genre.slug}
                      className={clsx('chip', oracleGenre === genre.slug ? 'chip-active' : 'hover:border-gold/50')}
                    >
                      {genre.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <MagicalButton onClick={findStory} disabled={loading} variant="primary" size="md" icon={<IconSparkle className="h-4 w-4" />}>
                {loading ? 'در حال گشتن…' : 'قصه‌ام را پیدا کن'}
              </MagicalButton>
              {loading && <Spinner className="h-4 w-4 text-plum/60" />}
            </div>
            {error && <div className="mt-4 max-w-md"><Notice tone="error">{error}</Notice></div>}
          </div>

          <div className="relative flex items-center justify-center">
            <WitchMascot pose="reading" className="h-48 w-auto" decorative />
            <div className="pointer-events-none absolute inset-x-8 bottom-2 h-6 rounded-full bg-plum/10 blur-lg" />
          </div>
        </div>

        {result && (
          <div className="mt-7 border-t border-gold/25 pt-6">
            {result.novel ? (
              <div className="grid gap-5 sm:grid-cols-[120px_1fr] sm:items-center">
                <BookCover
                  title={result.novel.title}
                  palette={result.novel.coverPalette}
                  motif={result.novel.coverMotif}
                  coverImageUrl={result.novel.coverImageUrl}
                  className="h-44 w-28"
                />
                <div>
                  <p className="text-[11px] tracking-wide text-[#8a5f74]">پیشنهاد امشب</p>
                  <h4 className="mt-1 font-display text-lg font-bold text-plum">{result.novel.title}</h4>
                  <p className="mt-2 text-[12.5px] leading-7 text-ink/65">{result.reason}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <MagicalButton to={`/novels/${result.novel.slug}`} size="sm">
                      دیدن این قصه
                    </MagicalButton>
                    {result.alternatives.length > 0 && (
                      <span className="self-center text-[11px] text-ink/45">
                        یا شاید: {result.alternatives.map((novel) => novel.title).join('، ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-gold/30 bg-white/60 px-5 py-6 text-center">
                <p className="font-display text-sm text-plum">{result.reason}</p>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {result.alternatives.map((novel) => (
                    <MagicalButton key={novel.id} to={`/novels/${novel.slug}`} variant="outline" size="sm">
                      {novel.title}
                    </MagicalButton>
                  ))}
                  {!result.alternatives.length && (
                    <MagicalButton to="/novels" size="sm" variant="outline">
                      همهٔ رمان‌ها
                    </MagicalButton>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
