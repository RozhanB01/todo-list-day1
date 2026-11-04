import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { AdminPageHeader } from './AdminLayout'
import { BookCover } from '../../components/art/BookCover'
import { MagicalButton } from '../../components/ui/MagicalButton'
import { EmptyState, ErrorNotice } from '../../components/ui/Feedback'
import { useApi, useSeo } from '../../lib/hooks'
import { formatFaDate, STATUS_LABELS, toFa } from '../../lib/format'
import type { AdminNovelRow } from './types'

export function AdminNovelsPage() {
  const { data, loading, error, reload } = useApi<{ novels: AdminNovelRow[] }>('/admin/novels')

  useSeo({ title: 'مدیریت رمان‌ها', description: 'میز نویسندهٔ مون‌بری', path: '/admin/novels', noindex: true })

  return (
    <>
      <AdminPageHeader
        eyebrow="محتوای کتابخانه"
        title="رمان‌ها"
        description="همهٔ رمان‌ها، پیش‌نویس‌ها و فصل‌هایشان. وضعیت انتشار را از این‌جا مدیریت کن."
        actions={<MagicalButton to="/admin/novels/new" variant="primary" size="sm">رمان تازه</MagicalButton>}
      />

      <div className="mt-6">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="skeleton h-24 rounded-2xl" />
            ))}
          </div>
        ) : error ? (
          <ErrorNotice message={error} onRetry={reload} />
        ) : !data?.novels.length ? (
          <EmptyState
            title="هنوز رمانی نساخته‌ای"
            description="اولین رمان را با عنوان، توضیح و جلد بساز؛ بعد فصل‌ها را اضافه کن."
            action={<MagicalButton to="/admin/novels/new" size="sm">ساختن رمان</MagicalButton>}
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gold/25 bg-[#fffaf1]">
            <table className="w-full text-start">
              <thead className="bg-vanilla/60 text-[10.5px] text-ink/50">
                <tr>
                  <th className="px-4 py-3 text-start font-medium">رمان</th>
                  <th className="hidden px-4 py-3 text-start font-medium sm:table-cell">وضعیت</th>
                  <th className="hidden px-4 py-3 text-start font-medium md:table-cell">فصل‌ها</th>
                  <th className="hidden px-4 py-3 text-start font-medium lg:table-cell">بازدید</th>
                  <th className="hidden px-4 py-3 text-start font-medium lg:table-cell">علاقه‌مندی</th>
                  <th className="hidden px-4 py-3 text-start font-medium md:table-cell">آخرین ویرایش</th>
                  <th className="px-4 py-3 text-end font-medium">کاری</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-plum/8">
                {data.novels.map((novel) => (
                  <tr key={novel.id} className="align-middle">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <BookCover
                          title={novel.title}
                          palette={novel.coverPalette}
                          motif={novel.coverMotif}
                          coverImageUrl={novel.coverImageUrl}
                          size="sm"
                          className="h-16 w-11 shrink-0"
                        />
                        <div className="min-w-0">
                          <Link to={`/admin/novels/${novel.id}`} className="block truncate font-display text-[13px] font-semibold text-plum hover:underline">
                            {novel.title}
                          </Link>
                          <p className="mt-0.5 truncate text-[10px] text-ink/40" dir="ltr">/{novel.slug}</p>
                          {novel.isDemo && <span className="mt-1 inline-block rounded-full bg-lavender/40 px-1.5 py-0.5 text-[8.5px] text-[#4a3a63]">نمونه</span>}
                          {novel.featured && <span className="mt-1 inline-block rounded-full bg-gold/25 px-1.5 py-0.5 text-[8.5px] text-[#6b4c22]">پیشنهاد ویژه</span>}
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <span
                        className={clsx(
                          'rounded-full px-2 py-0.5 text-[10px]',
                          novel.status === 'DRAFT'
                            ? 'bg-plum/10 text-ink/55'
                            : novel.status === 'COMPLETED'
                              ? 'bg-forest/15 text-[#3d5142]'
                              : 'bg-gold/20 text-[#6b4c22]',
                        )}
                      >
                        {STATUS_LABELS[novel.status]}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-[11.5px] text-ink/60 md:table-cell">
                      {toFa(novel.chapterCount)}
                      {novel.draftCount > 0 && <span className="text-ink/35"> ({toFa(novel.draftCount)} پیش‌نویس)</span>}
                    </td>
                    <td className="hidden px-4 py-3 text-[11.5px] text-ink/60 lg:table-cell">{toFa(novel.views)}</td>
                    <td className="hidden px-4 py-3 text-[11.5px] text-ink/60 lg:table-cell">{toFa(novel.favorites)}</td>
                    <td className="hidden px-4 py-3 text-[10.5px] text-ink/45 md:table-cell">{formatFaDate(novel.updatedAt)}</td>
                    <td className="px-4 py-3 text-end">
                      <div className="inline-flex gap-1.5">
                        <Link
                          to={`/admin/novels/${novel.id}`}
                          className="rounded-full border border-plum/15 px-3 py-1.5 text-[10.5px] text-plum transition hover:border-gold/60"
                        >
                          ویرایش
                        </Link>
                        {novel.status !== 'DRAFT' && (
                          <Link
                            to={`/novels/${novel.slug}`}
                            className="rounded-full border border-plum/15 px-3 py-1.5 text-[10.5px] text-ink/60 transition hover:border-gold/60"
                          >
                            سایت
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
