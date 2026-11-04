import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import clsx from 'clsx'
import { AdminPageHeader } from './AdminLayout'
import { BookCover, COVER_PALETTES } from '../../components/art/BookCover'
import { GenreIcon } from '../../components/art/Icons'
import { MagicalButton } from '../../components/ui/MagicalButton'
import { ErrorNotice, Notice, Spinner } from '../../components/ui/Feedback'
import { api, ApiError } from '../../lib/api'
import { formatFaDate, MOOD_META, PALETTE_LABELS, STATUS_LABELS, toFa } from '../../lib/format'
import { useApi, useSeo } from '../../lib/hooks'
import type { AdminGenres, AdminNovelDetail } from './types'

interface FormState {
  title: string
  slug: string
  subtitle: string
  description: string
  status: 'DRAFT' | 'ONGOING' | 'COMPLETED'
  contentWarning: string
  coverImageUrl: string
  coverPalette: string
  coverMotif: string
  moods: string[]
  genreSlugs: string[]
  featured: boolean
  featuredNote: string
  seoTitle: string
  seoDescription: string
}

const EMPTY_FORM: FormState = {
  title: '',
  slug: '',
  subtitle: '',
  description: '',
  status: 'DRAFT',
  contentWarning: '',
  coverImageUrl: '',
  coverPalette: 'plum',
  coverMotif: 'moon',
  moods: [],
  genreSlugs: [],
  featured: false,
  featuredNote: '',
  seoTitle: '',
  seoDescription: '',
}

const inputClass =
  'mt-1.5 w-full rounded-xl border border-plum/15 bg-white/85 px-3.5 py-2 text-[12.5px] text-plum outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20'

const MOTIF_LABELS: Record<string, string> = {
  moon: 'ماه',
  castle: 'قلعه',
  rose: 'گل رز',
  forest: 'جنگل',
  lantern: 'فانوس',
  cat: 'گربه',
  key: 'کلید',
  dragon: 'اژدها',
}

export function AdminNovelEditor() {
  const { id } = useParams()
  const isNew = !id
  const navigate = useNavigate()
  const { data, loading, error, reload } = useApi<{ novel: AdminNovelDetail }>(isNew ? null : `/admin/novels/${id}`)
  const { data: meta } = useApi<AdminGenres>('/admin/genres')

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [chapters, setChapters] = useState<AdminNovelDetail['chapters']>([])
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [busyChapter, setBusyChapter] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useSeo({
    title: isNew ? 'رمان تازه' : 'ویرایش رمان',
    description: 'میز نویسندهٔ مون‌بری',
    path: isNew ? '/admin/novels/new' : `/admin/novels/${id}`,
    noindex: true,
  })

  useEffect(() => {
    if (!data?.novel) return
    const novel = data.novel
    setForm({
      title: novel.title,
      slug: novel.slug,
      subtitle: novel.subtitle ?? '',
      description: novel.description,
      status: novel.status,
      contentWarning: novel.contentWarning ?? '',
      coverImageUrl: novel.coverImageUrl ?? '',
      coverPalette: novel.coverPalette,
      coverMotif: novel.coverMotif,
      moods: novel.moods,
      genreSlugs: novel.genreSlugs,
      featured: novel.featured,
      featuredNote: novel.featuredNote ?? '',
      seoTitle: novel.seoTitle ?? '',
      seoDescription: novel.seoDescription ?? '',
    })
    setChapters(novel.chapters)
  }, [data])

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((previous) => ({ ...previous, [key]: value }))
  }

  function toggleInArray(key: 'moods' | 'genreSlugs', value: string) {
    setForm((previous) => ({
      ...previous,
      [key]: previous[key].includes(value)
        ? previous[key].filter((item) => item !== value)
        : [...previous[key], value],
    }))
  }

  async function save() {
    setFormError(null)
    setMessage(null)
    if (form.title.trim().length < 2) {
      setFormError('عنوان رمان باید دست‌کم دو نویسه باشد.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim() || undefined,
        subtitle: form.subtitle.trim(),
        description: form.description,
        status: form.status,
        contentWarning: form.contentWarning,
        coverImageUrl: form.coverImageUrl,
        coverPalette: form.coverPalette,
        coverMotif: form.coverMotif,
        moods: form.moods,
        genreSlugs: form.genreSlugs,
        featured: form.featured,
        featuredNote: form.featuredNote,
        seoTitle: form.seoTitle,
        seoDescription: form.seoDescription,
      }
      if (isNew) {
        const created = await api<{ novel: { id: string } }>('/admin/novels', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        navigate(`/admin/novels/${created.novel.id}`, { replace: true })
        return
      }
      await api(`/admin/novels/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
      setMessage('رمان ذخیره شد.')
      reload()
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'ذخیره انجام نشد.')
    } finally {
      setSaving(false)
    }
  }

  async function uploadCover(file: File) {
    setUploading(true)
    setFormError(null)
    try {
      const body = new FormData()
      body.append('cover', file)
      const result = await api<{ url: string }>('/admin/upload', { method: 'POST', body })
      update('coverImageUrl', result.url)
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'بارگذاری تصویر انجام نشد.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function deleteNovel() {
    if (!id) return
    if (!window.confirm('این رمان و همهٔ فصل‌هایش برای همیشه حذف شود؟')) return
    try {
      await api(`/admin/novels/${id}`, { method: 'DELETE' })
      navigate('/admin/novels', { replace: true })
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'حذف انجام نشد.')
    }
  }

  async function addChapter() {
    if (!id) return
    try {
      const created = await api<{ chapter: { id: string } }>(`/admin/novels/${id}/chapters`, {
        method: 'POST',
        body: JSON.stringify({ title: `فصل ${toFa(chapters.length + 1)}` }),
      })
      navigate(`/admin/novels/${id}/chapters/${created.chapter.id}`)
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'فصل ساخته نشد.')
    }
  }

  async function toggleChapterStatus(chapterId: string, current: 'DRAFT' | 'PUBLISHED') {
    setBusyChapter(chapterId)
    try {
      await api(`/admin/chapters/${chapterId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: current === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED' }),
      })
      reload()
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'وضعیت فصل تغییر نکرد.')
    } finally {
      setBusyChapter(null)
    }
  }

  async function deleteChapter(chapterId: string) {
    if (!window.confirm('این فصل حذف شود؟')) return
    setBusyChapter(chapterId)
    try {
      await api(`/admin/chapters/${chapterId}`, { method: 'DELETE' })
      reload()
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'فصل حذف نشد.')
    } finally {
      setBusyChapter(null)
    }
  }

  async function moveChapter(index: number, direction: -1 | 1) {
    if (!id) return
    const next = [...chapters]
    const target = index + direction
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    setChapters(next.map((chapter, position) => ({ ...chapter, number: position + 1 })))
    try {
      await api(`/admin/novels/${id}/chapters/reorder`, {
        method: 'POST',
        body: JSON.stringify({ ids: next.map((chapter) => chapter.id) }),
      })
      reload()
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'ترتیب فصل‌ها ذخیره نشد.')
      reload()
    }
  }

  if (!isNew && loading && !data) {
    return (
      <div className="container-page py-16">
        <div className="skeleton h-8 w-52 rounded-full" />
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="skeleton h-96 rounded-2xl" />
          <div className="skeleton h-72 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!isNew && error) {
    return (
      <div className="mt-10">
        <ErrorNotice message={error} onRetry={reload} />
      </div>
    )
  }

  return (
    <>
      <AdminPageHeader
        eyebrow={isNew ? 'رمان تازه' : 'ویرایش رمان'}
        title={isNew ? 'ساختن رمان تازه' : form.title || 'ویرایش رمان'}
        description="عنوان، توضیح، جلد و دسته‌بندی‌ها را کامل کن؛ بعد فصل‌ها را بنویس. تا وقتی وضعیت «پیش‌نویس» است، هیچ‌کس بیرون از این میز آن را نمی‌بیند."
        actions={
          <>
            <MagicalButton onClick={save} variant="primary" size="sm" disabled={saving}>
              {saving ? <Spinner className="h-4 w-4" /> : isNew ? 'ساختن رمان' : 'ذخیرهٔ تغییرات'}
            </MagicalButton>
            <MagicalButton to="/admin/novels" variant="outline" size="sm">
              بازگشت
            </MagicalButton>
          </>
        }
      />

      {message && <div className="mt-4 max-w-2xl"><Notice tone="success">{message}</Notice></div>}
      {formError && <div className="mt-4 max-w-2xl"><Notice tone="error">{formError}</Notice></div>}

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_330px]">
        <div className="space-y-5">
          <section className="rounded-2xl border border-gold/25 bg-[#fffaf1] p-5">
            <h2 className="font-display text-sm font-bold text-plum">شناسنامهٔ رمان</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-[11px] text-ink/55">
                عنوان
                <input value={form.title} onChange={(event) => update('title', event.target.value)} className={inputClass} placeholder="مثلاً قلعهٔ مه" />
              </label>
              <label className="block text-[11px] text-ink/55">
                نشانی (slug)
                <input value={form.slug} onChange={(event) => update('slug', event.target.value)} className={inputClass} dir="ltr" placeholder="ghale-ye-meh" />
                <span className="mt-1 block text-[9.5px] text-ink/35">خالی بگذاری، خودکار ساخته می‌شود.</span>
              </label>
            </div>
            <label className="mt-4 block text-[11px] text-ink/55">
              زیرعنوان
              <input value={form.subtitle} onChange={(event) => update('subtitle', event.target.value)} className={inputClass} placeholder="یک جملهٔ کوتاه دربارهٔ این قصه" />
            </label>
            <label className="mt-4 block text-[11px] text-ink/55">
              توضیح رمان
              <textarea
                rows={6}
                value={form.description}
                onChange={(event) => update('description', event.target.value)}
                className={`${inputClass} leading-7`}
                placeholder="خواننده در صفحهٔ رمان این متن را می‌بیند. از حال‌وهوای قصه بنویس، بدون لو دادن پایان."
              />
            </label>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-[11px] text-ink/55">
                وضعیت انتشار
                <select
                  value={form.status}
                  onChange={(event) => update('status', event.target.value as FormState['status'])}
                  className={inputClass}
                >
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <span className="mt-1 block text-[9.5px] text-ink/35">برای انتشار واقعی، دست‌کم یک فصل منتشرشده لازم است.</span>
              </label>
              <label className="block text-[11px] text-ink/55">
                هشدار محتوا (اختیاری)
                <input
                  value={form.contentWarning}
                  onChange={(event) => update('contentWarning', event.target.value)}
                  className={inputClass}
                  placeholder="مثلاً فضای تاریک و اضطراب"
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-gold/25 bg-[#fffaf1] p-5">
            <h2 className="font-display text-sm font-bold text-plum">دسته‌بندی و حال‌وهوا</h2>
            <p className="mt-1 text-[10.5px] text-ink/40">ژانرها در صفحهٔ رمان و فیلترها دیده می‌شوند؛ حال‌وهواها در «امشب دلت چه داستانی می‌خواهد؟».</p>
            <div className="mt-3">
              <p className="text-[10.5px] text-ink/45">ژانرها</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(meta?.genres ?? []).map((genre) => (
                  <button
                    key={genre.slug}
                    type="button"
                    onClick={() => toggleInArray('genreSlugs', genre.slug)}
                    aria-pressed={form.genreSlugs.includes(genre.slug)}
                    className={clsx('chip', form.genreSlugs.includes(genre.slug) && 'chip-active')}
                  >
                    <GenreIcon icon={genre.icon} className="h-3.5 w-3.5" />
                    {genre.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-[10.5px] text-ink/45">حال‌وهوا</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.entries(MOOD_META).map(([key, mood]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleInArray('moods', key)}
                    aria-pressed={form.moods.includes(key)}
                    className={clsx('chip', form.moods.includes(key) && 'chip-active')}
                  >
                    {mood.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-gold/25 bg-[#fffaf1] p-5">
            <h2 className="font-display text-sm font-bold text-plum">انتخاب جادوگر کوچولو</h2>
            <p className="mt-1 text-[10.5px] text-ink/40">این رمان در بخش ویژهٔ صفحهٔ اول نمایش داده می‌شود.</p>
            <label className="mt-3 flex items-center gap-2 text-[12px] text-ink/65">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) => update('featured', event.target.checked)}
                className="h-4 w-4 rounded border-plum/30 accent-[#8a5f74]"
              />
              این رمان پیشنهاد ویژهٔ صفحهٔ اول باشد
            </label>
            {form.featured && (
              <label className="mt-3 block text-[11px] text-ink/55">
                یادداشت پیشنهاد
                <textarea
                  rows={3}
                  value={form.featuredNote}
                  onChange={(event) => update('featuredNote', event.target.value)}
                  className={`${inputClass} leading-6`}
                  placeholder="چرا این قصه را برای امشب پیشنهاد می‌کنی؟"
                />
              </label>
            )}
          </section>

          {!isNew && (
            <section className="rounded-2xl border border-gold/25 bg-[#fffaf1] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-sm font-bold text-plum">فصل‌ها</h2>
                  <p className="mt-1 text-[10.5px] text-ink/40">
                    {toFa(chapters.length)} فصل — ترتیب نمایش در سایت از بالا به پایین است.
                  </p>
                </div>
                <MagicalButton onClick={addChapter} size="sm" variant="gold">
                  فصل تازه
                </MagicalButton>
              </div>

              <ol className="mt-4 space-y-2">
                {chapters.map((chapter, index) => (
                  <li key={chapter.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-gold/20 bg-white/60 p-3">
                    <div className="flex flex-col">
                      <button
                        type="button"
                        onClick={() => void moveChapter(index, -1)}
                        disabled={index === 0}
                        aria-label="جابه‌جایی به بالا"
                        className="text-[10px] text-ink/40 hover:text-plum disabled:opacity-25"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => void moveChapter(index, 1)}
                        disabled={index === chapters.length - 1}
                        aria-label="جابه‌جایی به پایین"
                        className="text-[10px] text-ink/40 hover:text-plum disabled:opacity-25"
                      >
                        ▼
                      </button>
                    </div>
                    <span className="w-7 text-center font-display text-[12px] text-ink/50">{toFa(chapter.number)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-medium text-plum">{chapter.title}</p>
                      <p className="mt-0.5 text-[9.5px] text-ink/40">
                        {toFa(chapter.wordCount)} واژه · {chapter.publishedAt ? formatFaDate(chapter.publishedAt) : 'بدون تاریخ انتشار'}
                      </p>
                    </div>
                    <span
                      className={clsx(
                        'rounded-full px-2 py-0.5 text-[9.5px]',
                        chapter.status === 'PUBLISHED' ? 'bg-forest/15 text-[#3d5142]' : 'bg-plum/10 text-ink/50',
                      )}
                    >
                      {chapter.status === 'PUBLISHED' ? 'منتشرشده' : 'پیش‌نویس'}
                    </span>
                    <div className="flex gap-1.5">
                      <Link
                        to={`/admin/novels/${id}/chapters/${chapter.id}`}
                        className="rounded-full border border-plum/15 px-2.5 py-1 text-[10px] text-plum hover:border-gold/60"
                      >
                        نوشتن
                      </Link>
                      <button
                        type="button"
                        onClick={() => void toggleChapterStatus(chapter.id, chapter.status)}
                        disabled={busyChapter === chapter.id}
                        className="rounded-full border border-plum/15 px-2.5 py-1 text-[10px] text-ink/60 hover:border-gold/60"
                      >
                        {chapter.status === 'PUBLISHED' ? 'برداشتن از انتشار' : 'انتشار'}
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteChapter(chapter.id)}
                        disabled={busyChapter === chapter.id}
                        className="rounded-full border border-berry/30 px-2.5 py-1 text-[10px] text-[#a3556c] hover:border-berry/60"
                      >
                        حذف
                      </button>
                    </div>
                  </li>
                ))}
                {!chapters.length && (
                  <p className="rounded-xl border border-dashed border-gold/30 p-4 text-center text-[11px] text-ink/45">
                    هنوز فصلی نوشته نشده. با «فصل تازه» شروع کن.
                  </p>
                )}
              </ol>
            </section>
          )}

          <section className="rounded-2xl border border-gold/25 bg-[#fffaf1] p-5">
            <h2 className="font-display text-sm font-bold text-plum">سئو و اشتراک‌گذاری</h2>
            <p className="mt-1 text-[10.5px] text-ink/40">اگر خالی بماند، عنوان و توضیح رمان استفاده می‌شود.</p>
            <label className="mt-3 block text-[11px] text-ink/55">
              عنوان سئو
              <input value={form.seoTitle} onChange={(event) => update('seoTitle', event.target.value)} className={inputClass} />
            </label>
            <label className="mt-3 block text-[11px] text-ink/55">
              توضیح سئو
              <textarea
                rows={2}
                value={form.seoDescription}
                onChange={(event) => update('seoDescription', event.target.value)}
                className={`${inputClass} leading-6`}
                placeholder="حدود ۱۵۰ نویسه"
              />
            </label>
          </section>

          {!isNew && (
            <section className="rounded-2xl border border-berry/35 bg-[#fbeeea] p-5">
              <h2 className="font-display text-sm font-bold text-[#7c4048]">حذف رمان</h2>
              <p className="mt-1 text-[10.5px] leading-6 text-[#7c4048]/80">
                حذف رمان، همهٔ فصل‌ها، علاقه‌مندی‌ها و پیشرفت خواندن مرتبط را هم پاک می‌کند. این کار برگشت‌پذیر نیست.
              </p>
              <button
                type="button"
                onClick={deleteNovel}
                className="mt-3 rounded-full border border-[#b06a72] px-3 py-1.5 text-[11px] text-[#7c4048] transition hover:bg-[#b06a72]/10"
              >
                حذف کامل این رمان
              </button>
            </section>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-gold/25 bg-[#fffaf1] p-4">
            <p className="text-[11px] text-ink/55">پیش‌نمایش جلد</p>
            <div className="mt-3">
              <BookCover
                title={form.title || 'عنوان رمان'}
                palette={form.coverPalette}
                motif={form.coverMotif}
                coverImageUrl={form.coverImageUrl || null}
                className="aspect-[2/3] w-full"
              />
            </div>
            <div className="mt-3 space-y-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) void uploadCover(file)
                }}
              />
              <MagicalButton
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'در حال بارگذاری…' : 'بارگذاری تصویر جلد'}
              </MagicalButton>
              {form.coverImageUrl && (
                <button
                  type="button"
                  onClick={() => update('coverImageUrl', '')}
                  className="w-full rounded-full border border-plum/15 py-1.5 text-[10.5px] text-ink/50 hover:border-berry/50 hover:text-[#a3556c]"
                >
                  برداشتن تصویر و برگشت به جلد نقاشی‌شده
                </button>
              )}
            </div>

            <div className="mt-4">
              <p className="text-[10.5px] text-ink/50">رنگ جلد</p>
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                {(meta?.palettes ?? Object.keys(COVER_PALETTES)).map((palette) => {
                  const colors = COVER_PALETTES[palette]
                  return (
                    <button
                      key={palette}
                      type="button"
                      onClick={() => update('coverPalette', palette)}
                      aria-pressed={form.coverPalette === palette}
                      className={clsx(
                        'rounded-lg border p-1.5 text-[9px] transition',
                        form.coverPalette === palette ? 'border-gold ring-1 ring-gold/50' : 'border-plum/10 hover:border-gold/40',
                      )}
                    >
                      <span
                        className="mb-1 block h-5 w-full rounded"
                        style={{ background: `linear-gradient(135deg, ${colors.from}, ${colors.to})` }}
                      />
                      {PALETTE_LABELS[palette] ?? palette}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-[10.5px] text-ink/50">نقش جلد</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(meta?.motifs ?? Object.keys(MOTIF_LABELS)).map((motif) => (
                  <button
                    key={motif}
                    type="button"
                    onClick={() => update('coverMotif', motif)}
                    aria-pressed={form.coverMotif === motif}
                    className={clsx('chip py-1 text-[10px]', form.coverMotif === motif && 'chip-active')}
                  >
                    {MOTIF_LABELS[motif] ?? motif}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {!isNew && data?.novel && (
            <div className="rounded-2xl border border-gold/25 bg-[#fffaf1] p-4 text-[11px] text-ink/60">
              <p className="text-[10px] text-ink/40">آمار این رمان</p>
              <p className="mt-2">بازدید واقعی: {toFa(data.novel.views)}</p>
              <p className="mt-1">علاقه‌مندی: {toFa(data.novel.favorites)}</p>
              <p className="mt-1">آخرین ویرایش: {formatFaDate(data.novel.updatedAt)}</p>
              {data.novel.isDemo && (
                <p className="mt-2 rounded-lg bg-lavender/30 px-2 py-1.5 text-[9.5px] leading-5 text-[#4a3a63]">
                  این یک قصهٔ نمونه است؛ آزادی ویرایشش کنی یا کامل حذفش کنی.
                </p>
              )}
              {form.status !== 'DRAFT' && (
                <Link to={`/novels/${data.novel.slug}`} className="mt-3 inline-block text-[10.5px] text-plum underline underline-offset-4">
                  دیدن در سایت
                </Link>
              )}
            </div>
          )}

          <div className="rounded-2xl border border-gold/25 bg-[#fffaf1] p-4 text-[10.5px] leading-6 text-ink/50">
            <p className="font-display text-[11px] font-bold text-plum">یادآوری</p>
            رمان پیش‌نویس در هیچ صفحهٔ عمومی دیده نمی‌شود. فصل پیش‌نویس هم حتی اگر رمان منتشر شده باشد، نشانی عمومی
            ندارد.
          </div>
        </aside>
      </div>
    </>
  )
}
