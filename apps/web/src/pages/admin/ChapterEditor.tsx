import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import clsx from 'clsx'
import { AdminPageHeader } from './AdminLayout'
import { MagicalButton } from '../../components/ui/MagicalButton'
import { ErrorNotice, Notice, Spinner } from '../../components/ui/Feedback'
import { api, ApiError } from '../../lib/api'
import { formatFaDate, toFa } from '../../lib/format'
import { useApi, useSeo } from '../../lib/hooks'
import type { AdminNovelDetail } from './types'

function toLocalInput(iso: string | null) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const inputClass =
  'mt-1.5 w-full rounded-xl border border-plum/15 bg-white/85 px-3.5 py-2 text-[12.5px] text-plum outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20'

export function AdminChapterEditor() {
  const { id, chapterId } = useParams()
  const navigate = useNavigate()
  const { data, loading, error, reload } = useApi<{ novel: AdminNovelDetail }>(id ? `/admin/novels/${id}` : null)

  const chapter = useMemo(
    () => data?.novel.chapters.find((item) => item.id === chapterId) ?? null,
    [data, chapterId],
  )

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [number, setNumber] = useState(1)
  const [summary, setSummary] = useState('')
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT')
  const [publishedAt, setPublishedAt] = useState('')
  const [words, setWords] = useState(0)
  const [preview, setPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const editorRef = useRef<HTMLDivElement>(null)

  useSeo({
    title: chapter ? `ویرایش ${chapter.title}` : 'ویرایش فصل',
    description: 'میز نویسندهٔ مون‌بری',
    path: `/admin/novels/${id}/chapters/${chapterId}`,
    noindex: true,
  })

  useEffect(() => {
    if (!chapter) return
    setTitle(chapter.title)
    setSlug(chapter.slug)
    setNumber(chapter.number)
    setSummary(chapter.summary ?? '')
    setStatus(chapter.status)
    setPublishedAt(toLocalInput(chapter.publishedAt))
    setWords(chapter.wordCount)
    if (editorRef.current) {
      editorRef.current.innerHTML = chapter.contentHtml
    }
  }, [chapter?.id])

  function refreshWords() {
    if (!editorRef.current) return
    const text = (editorRef.current.innerText || '').trim()
    setWords(text ? text.split(/\s+/).length : 0)
  }

  function exec(command: string, value?: string) {
    editorRef.current?.focus()
    document.execCommand(command, false, value)
    refreshWords()
  }

  async function save(nextStatus?: 'DRAFT' | 'PUBLISHED') {
    if (!chapter) return
    setSaving(true)
    setFormError(null)
    setMessage(null)
    const contentHtml = editorRef.current?.innerHTML ?? ''
    const targetStatus = nextStatus ?? status
    try {
      await api(`/admin/chapters/${chapter.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: title.trim() || 'فصل بی‌نام',
          slug: slug.trim() || undefined,
          number,
          summary,
          contentHtml,
          status: targetStatus,
          publishedAt: publishedAt ? new Date(publishedAt).toISOString() : undefined,
        }),
      })
      setStatus(targetStatus)
      setMessage(
        targetStatus === 'PUBLISHED'
          ? 'فصل ذخیره و منتشر شد.'
          : 'فصل ذخیره شد و به‌عنوان پیش‌نویس نگه داشته شد.',
      )
      reload()
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'ذخیره انجام نشد.')
    } finally {
      setSaving(false)
    }
  }

  async function removeChapter() {
    if (!chapter || !id) return
    if (!window.confirm('این فصل برای همیشه حذف شود؟')) return
    try {
      await api(`/admin/chapters/${chapter.id}`, { method: 'DELETE' })
      navigate(`/admin/novels/${id}`)
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'حذف انجام نشد.')
    }
  }

  if (loading && !data) {
    return (
      <div className="mt-10 space-y-4">
        <div className="skeleton h-9 w-56 rounded-full" />
        <div className="skeleton h-[28rem] rounded-2xl" />
      </div>
    )
  }

  if (error || !data || !chapter) {
    return (
      <div className="mt-10">
        <ErrorNotice message={error || 'این فصل پیدا نشد.'} onRetry={reload} />
        <MagicalButton to={`/admin/novels/${id}`} variant="outline" size="sm" className="mt-4">
          بازگشت به رمان
        </MagicalButton>
      </div>
    )
  }

  return (
    <>
      <AdminPageHeader
        eyebrow={`${data.novel.title} · فصل ${toFa(chapter.number)}`}
        title={title || 'فصل بی‌نام'}
        description="متن فصل را این‌جا بنویس. پیش‌نویس‌ها در سایت دیده نمی‌شوند؛ انتشار فقط با زدن دکمهٔ انتشار انجام می‌شود."
        actions={
          <>
            <MagicalButton onClick={() => void save()} variant="outline" size="sm" disabled={saving}>
              {saving ? <Spinner className="h-4 w-4" /> : 'ذخیرهٔ پیش‌نویس'}
            </MagicalButton>
            <MagicalButton onClick={() => void save('PUBLISHED')} variant="gold" size="sm" disabled={saving}>
              انتشار فصل
            </MagicalButton>
            <MagicalButton to={`/admin/novels/${id}`} variant="outline" size="sm">
              بازگشت
            </MagicalButton>
          </>
        }
      />

      {message && <div className="mt-4 max-w-2xl"><Notice tone="success">{message}</Notice></div>}
      {formError && <div className="mt-4 max-w-2xl"><Notice tone="error">{formError}</Notice></div>}

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-gold/25 bg-[#fffaf1] p-5">
            <div className="grid gap-4 sm:grid-cols-[1fr_150px]">
              <label className="block text-[11px] text-ink/55">
                عنوان فصل
                <input value={title} onChange={(event) => setTitle(event.target.value)} className={inputClass} />
              </label>
              <label className="block text-[11px] text-ink/55">
                شمارهٔ فصل
                <input
                  type="number"
                  min={1}
                  value={number}
                  onChange={(event) => setNumber(Number(event.target.value) || 1)}
                  className={inputClass}
                  dir="ltr"
                />
              </label>
            </div>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <label className="block text-[11px] text-ink/55">
                نشانی فصل (slug)
                <input value={slug} onChange={(event) => setSlug(event.target.value)} className={inputClass} dir="ltr" />
              </label>
              <label className="block text-[11px] text-ink/55">
                خلاصه (اختیاری)
                <input value={summary} onChange={(event) => setSummary(event.target.value)} className={inputClass} />
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-gold/25 bg-[#fffaf1] p-4">
            <div className="flex flex-wrap items-center gap-1 border-b border-plum/10 pb-3">
              {[
                { label: 'پاراگراف', command: 'formatBlock', value: 'p' },
                { label: 'عنوان', command: 'formatBlock', value: 'h2' },
                { label: 'زیرعنوان', command: 'formatBlock', value: 'h3' },
              ].map((button) => (
                <button
                  key={button.label}
                  type="button"
                  onClick={() => exec(button.command, button.value)}
                  className="rounded-lg border border-plum/10 px-2.5 py-1 text-[11px] text-ink/65 transition hover:border-gold/50 hover:text-plum"
                >
                  {button.label}
                </button>
              ))}
              <span className="mx-1 h-4 w-px bg-plum/10" />
              <button type="button" onClick={() => exec('bold')} className="rounded-lg border border-plum/10 px-2.5 py-1 text-[11px] font-bold text-ink/65 hover:border-gold/50" title="درشت">
                ب
              </button>
              <button type="button" onClick={() => exec('italic')} className="rounded-lg border border-plum/10 px-2.5 py-1 text-[11px] italic text-ink/65 hover:border-gold/50" title="کج">
                ک
              </button>
              <button type="button" onClick={() => exec('insertUnorderedList')} className="rounded-lg border border-plum/10 px-2.5 py-1 text-[11px] text-ink/65 hover:border-gold/50">
                فهرست
              </button>
              <button type="button" onClick={() => exec('formatBlock', 'blockquote')} className="rounded-lg border border-plum/10 px-2.5 py-1 text-[11px] text-ink/65 hover:border-gold/50">
                نقل‌قول
              </button>
              <button type="button" onClick={() => exec('insertHorizontalRule')} className="rounded-lg border border-plum/10 px-2.5 py-1 text-[11px] text-ink/65 hover:border-gold/50">
                جداکننده
              </button>
              <span className="mx-1 h-4 w-px bg-plum/10" />
              <button type="button" onClick={() => exec('undo')} className="rounded-lg border border-plum/10 px-2.5 py-1 text-[11px] text-ink/65 hover:border-gold/50">
                بازگشت
              </button>
              <button type="button" onClick={() => exec('redo')} className="rounded-lg border border-plum/10 px-2.5 py-1 text-[11px] text-ink/65 hover:border-gold/50">
                جلو
              </button>
              <span className="ms-auto text-[10px] text-ink/40">{toFa(words)} واژه</span>
              <button
                type="button"
                onClick={() => setPreview((value) => !value)}
                className={clsx(
                  'rounded-lg border px-2.5 py-1 text-[11px] transition',
                  preview ? 'border-gold/60 bg-gold/15 text-plum' : 'border-plum/10 text-ink/55 hover:border-gold/50',
                )}
              >
                {preview ? 'بازگشت به نوشتن' : 'پیش‌نمایش'}
              </button>
            </div>

            <div
              ref={editorRef}
              contentEditable={!preview}
              suppressContentEditableWarning
              role="textbox"
              aria-multiline="true"
              aria-label="متن فصل"
              dir="rtl"
              className={clsx('editor-surface mt-3 rounded-xl bg-white/70 px-5 py-4', preview && 'hidden')}
              onInput={refreshWords}
              onPaste={(event) => {
                event.preventDefault()
                const text = event.clipboardData.getData('text/plain')
                document.execCommand('insertText', false, text)
                refreshWords()
              }}
            />

            {preview && (
              <div className="mt-3 rounded-xl border border-gold/25 bg-[#fffdf7] px-6 py-5">
                <div className="chapter-body" style={{ ['--reader-font-size' as string]: '18px' }} dangerouslySetInnerHTML={{ __html: editorRef.current?.innerHTML ?? '' }} />
              </div>
            )}

            <p className="mt-2 text-[9.5px] text-ink/35">
              متن به‌صورت HTML امن ذخیره می‌شود؛ فونت، اندازه و فاصلهٔ خواندن را خواننده انتخاب می‌کند.
            </p>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-gold/25 bg-[#fffaf1] p-4">
            <p className="text-[11px] text-ink/55">وضعیت انتشار</p>
            <div className="mt-3 flex gap-2">
              {(['DRAFT', 'PUBLISHED'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatus(value)}
                  className={clsx(
                    'flex-1 rounded-xl border py-2 text-[11px] transition',
                    status === value ? 'border-gold/70 bg-gold/15 text-plum' : 'border-plum/12 text-ink/55 hover:border-gold/40',
                  )}
                >
                  {value === 'PUBLISHED' ? 'منتشرشده' : 'پیش‌نویس'}
                </button>
              ))}
            </div>
            <label className="mt-4 block text-[11px] text-ink/55">
              تاریخ انتشار
              <input
                type="datetime-local"
                value={publishedAt}
                onChange={(event) => setPublishedAt(event.target.value)}
                className={inputClass}
                dir="ltr"
              />
              <span className="mt-1 block text-[9.5px] text-ink/35">
                {chapter.publishedAt ? `فعلی: ${formatFaDate(chapter.publishedAt)}` : 'خالی بماند، هنگام انتشار خودکار ثبت می‌شود.'}
              </span>
            </label>
            <div className="mt-4 space-y-2">
              <MagicalButton onClick={() => void save(status)} size="sm" className="w-full" variant="primary" disabled={saving}>
                ذخیره
              </MagicalButton>
              {status === 'DRAFT' && (
                <MagicalButton onClick={() => void save('PUBLISHED')} size="sm" className="w-full" variant="gold" disabled={saving}>
                  انتشار همین حالا
                </MagicalButton>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gold/25 bg-[#fffaf1] p-4">
            <p className="text-[11px] text-ink/55">فصل‌های این رمان</p>
            <ol className="mt-2 space-y-1">
              {data.novel.chapters.map((item) => (
                <li key={item.id}>
                  <Link
                    to={`/admin/novels/${id}/chapters/${item.id}`}
                    className={clsx(
                      'flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] transition',
                      item.id === chapter.id ? 'bg-gold/20 text-plum' : 'text-ink/60 hover:bg-vanilla',
                    )}
                  >
                    <span className="w-5 text-center text-[9.5px] text-ink/40">{toFa(item.number)}</span>
                    <span className="min-w-0 flex-1 truncate">{item.title}</span>
                    {item.status === 'DRAFT' && <span className="text-[8px] text-ink/35">پیش‌نویس</span>}
                  </Link>
                </li>
              ))}
            </ol>
          </div>

          <button
            type="button"
            onClick={removeChapter}
            className="w-full rounded-full border border-berry/40 py-2 text-[11px] text-[#a3556c] transition hover:bg-berry/10"
          >
            حذف این فصل
          </button>

          {status === 'PUBLISHED' && (
            <Link
              to={`/read/${data.novel.slug}/${chapter.slug}`}
              className="block text-center text-[10.5px] text-plum underline underline-offset-4"
            >
              خواندن نسخهٔ عمومی
            </Link>
          )}
        </aside>
      </div>
    </>
  )
}
