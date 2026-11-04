import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { AdminPageHeader } from './AdminLayout'
import { MagicalButton } from '../../components/ui/MagicalButton'
import { EmptyState, ErrorNotice, Notice } from '../../components/ui/Feedback'
import { useApi, useSeo } from '../../lib/hooks'
import { formatFaDate, STATUS_LABELS, toFa } from '../../lib/format'
import { api } from '../../lib/api'
import { useState } from 'react'

interface Overview {
  totals: {
    novels: number
    publishedNovels: number
    chapters: number
    publishedChapters: number
    readers: number
    favorites: number
    views: number
  }
  novels: Array<{ id: string; title: string; slug: string; status: string; chapters: number; views: number; favorites: number }>
  viewsByDay: Array<{ date: string; count: number }>
}

interface MessageRow {
  id: string
  name: string
  email: string
  body: string
  read: boolean
  createdAt: string
}

export function AdminDashboard() {
  const { data, loading, error, reload } = useApi<Overview>('/admin/overview')
  const { data: messageData } = useApi<{ messages: MessageRow[] }>('/admin/messages')
  const [note, setNote] = useState<string | null>(null)

  useSeo({ title: 'داشبورد نویسنده', description: 'میز نویسندهٔ مون‌بری', path: '/admin', noindex: true })

  const maxViews = Math.max(1, ...(data?.viewsByDay.map((day) => day.count) ?? [1]))

  return (
    <>
      <AdminPageHeader
        eyebrow="میز نویسنده"
        title="داشبورد"
        description="خلاصهٔ واقعی کتابخانه: فقط عددهایی که خوانندگان ساخته‌اند، بدون هیچ آمار ساختگی."
        actions={
          <>
            <MagicalButton to="/admin/novels/new" variant="primary" size="sm">رمان تازه</MagicalButton>
            <MagicalButton to="/admin/novels" variant="outline" size="sm">مدیریت رمان‌ها</MagicalButton>
          </>
        }
      />

      {note && <div className="mt-4 max-w-2xl"><Notice tone="success">{note}</Notice></div>}

      {loading ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <div className="mt-6"><ErrorNotice message={error} onRetry={reload} /></div>
      ) : (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'رمان منتشرشده', value: data?.totals.publishedNovels ?? 0, hint: `${toFa(data?.totals.novels ?? 0)} رمان در کل` },
              { label: 'فصل منتشرشده', value: data?.totals.publishedChapters ?? 0, hint: `${toFa(data?.totals.chapters ?? 0)} فصل در کل` },
              { label: 'خوانندهٔ ثبت‌نام‌شده', value: data?.totals.readers ?? 0, hint: 'حساب‌های خواننده' },
              { label: 'بازدید واقعی', value: data?.totals.views ?? 0, hint: `${toFa(data?.totals.favorites ?? 0)} علاقه‌مندی` },
            ].map((card) => (
              <div key={card.label} className="rounded-2xl border border-gold/25 bg-[#fffaf1] p-5">
                <p className="text-[11px] text-ink/50">{card.label}</p>
                <p className="mt-2 font-wordmark text-3xl font-semibold text-plum">{toFa(card.value)}</p>
                <p className="mt-1 text-[10px] text-ink/40">{card.hint}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-2xl border border-gold/25 bg-[#fffaf1] p-5">
              <div className="flex items-center justify-between">
                <p className="font-display text-sm font-bold text-plum">بازدید ۱۴ روز گذشته</p>
                <span className="text-[10px] text-ink/40">فقط دادهٔ واقعی</span>
              </div>
              <div className="mt-4 flex h-36 items-end gap-1.5">
                {data?.viewsByDay.map((day) => (
                  <div key={day.date} className="group relative flex flex-1 flex-col items-center justify-end gap-1">
                    <span className="pointer-events-none absolute -top-6 hidden rounded-md bg-plum px-1.5 py-0.5 text-[9px] text-parchment group-hover:block">
                      {toFa(day.count)}
                    </span>
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-[#7d6cae] to-[#d6ac69]"
                      style={{ height: `${Math.max(3, (day.count / maxViews) * 100)}%` }}
                      aria-hidden="true"
                    />
                    <span className="text-[8px] text-ink/35">{day.date.slice(8)}</span>
                  </div>
                ))}
              </div>
              {(data?.totals.views ?? 0) === 0 && (
                <p className="mt-3 text-[10.5px] text-ink/40">هنوز بازدیدی ثبت نشده؛ بعد از انتشار و خواندن، این نمودار پر می‌شود.</p>
              )}
            </div>

            <div className="rounded-2xl border border-gold/25 bg-[#fffaf1] p-5">
              <p className="font-display text-sm font-bold text-plum">رمان‌ها در یک نگاه</p>
              <ul className="mt-3 space-y-2">
                {data?.novels.slice(0, 6).map((novel) => (
                  <li key={novel.id} className="flex items-center justify-between gap-2 rounded-xl bg-vanilla/50 px-3 py-2">
                    <Link to={`/admin/novels/${novel.id}`} className="min-w-0 truncate text-[12px] text-plum hover:underline">
                      {novel.title}
                    </Link>
                    <span
                      className={clsx(
                        'shrink-0 rounded-full px-2 py-0.5 text-[9px]',
                        novel.status === 'DRAFT' ? 'bg-plum/10 text-ink/55' : 'bg-forest/15 text-[#3d5142]',
                      )}
                    >
                      {STATUS_LABELS[novel.status]}
                    </span>
                  </li>
                ))}
                {!data?.novels.length && <p className="text-[11.5px] text-ink/45">هنوز رمانی ساخته نشده.</p>}
              </ul>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-gold/25 bg-[#fffaf1] p-5">
            <p className="font-display text-sm font-bold text-plum">نامه‌های خوانندگان</p>
            <p className="mt-1 text-[10.5px] text-ink/40">نامه‌هایی که از صفحهٔ تماس فرستاده شده‌اند.</p>
            <div className="mt-3 space-y-2">
              {(messageData?.messages ?? []).slice(0, 5).map((message) => (
                <div key={message.id} className="rounded-xl border border-gold/20 bg-white/60 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[11.5px] font-semibold text-plum">
                      {message.name} <span className="font-normal text-ink/45" dir="ltr">{message.email}</span>
                    </p>
                    <span className="text-[9.5px] text-ink/40">{formatFaDate(message.createdAt)}</span>
                  </div>
                  <p className="mt-1.5 text-[11.5px] leading-6 text-ink/65">{message.body}</p>
                  <button
                    type="button"
                    onClick={async () => {
                      await api(`/admin/messages/${message.id}`, { method: 'PATCH' }).catch(() => undefined)
                      setNote('نامه به عنوان خوانده‌شده علامت خورد.')
                    }}
                    className="mt-2 text-[10px] text-ink/40 underline-offset-4 hover:text-plum hover:underline"
                  >
                    علامت‌زدن به‌عنوان خوانده‌شده
                  </button>
                </div>
              ))}
              {!messageData?.messages.length && <p className="text-[11.5px] text-ink/45">هنوز نامه‌ای نرسیده.</p>}
            </div>
          </div>
        </>
      )}

      {!loading && !error && !data?.novels.length && (
        <div className="mt-8">
          <EmptyState
            title="قفسه‌های میز نویسنده خالی است"
            description="اولین رمان را بساز، فصل اول را بنویس و منتشر کن."
            pose="greeting"
            action={<MagicalButton to="/admin/novels/new" size="sm">ساختن رمان اول</MagicalButton>}
          />
        </div>
      )}
    </>
  )
}
