import type { ReactNode } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import clsx from 'clsx'
import { MoonLogo } from '../../components/art/Ornaments'
import { WitchMascot } from '../../components/art/WitchMascot'
import { MagicalButton } from '../../components/ui/MagicalButton'
import { Spinner } from '../../components/ui/Feedback'
import { useAuth } from '../../lib/auth'

const LINKS = [
  { to: '/admin', label: 'داشبورد', end: true },
  { to: '/admin/novels', label: 'رمان‌ها', end: false },
]

export function AdminLayout() {
  const { user, isAdmin, loading, logout } = useAuth()

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-plum text-parchment">
        <div className="flex items-center gap-3 text-sm">
          <Spinner className="h-5 w-5" /> در حال باز کردن میز نویسنده…
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="grid min-h-screen place-items-center bg-night-sky px-4 text-parchment">
        <div className="w-full max-w-md rounded-[24px] border border-gold/35 bg-[#1f1834] p-7 text-center">
          <MoonLogo className="mx-auto h-14 w-14" />
          <h1 className="mt-4 font-display text-xl font-bold">میز نویسنده</h1>
          <p className="mt-2 text-[12.5px] leading-7 text-lavender/70">
            این بخش فقط برای نویسندهٔ مون‌بری است. با حساب نویسنده وارد شو.
          </p>
          <div className="mt-5 space-y-2">
            <MagicalButton to="/login?next=/admin" variant="gold" size="md" className="w-full">
              ورود به حساب
            </MagicalButton>
            <MagicalButton to="/" variant="night" size="md" className="w-full">
              بازگشت به کتابخانه
            </MagicalButton>
          </div>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-night-sky px-4 text-parchment">
        <div className="w-full max-w-md rounded-[24px] border border-berry/40 bg-[#1f1834] p-7 text-center">
          <WitchMascot pose="lantern" className="mx-auto h-40 w-auto" decorative />
          <h1 className="mt-4 font-display text-xl font-bold">این در برای تو باز نمی‌شود</h1>
          <p className="mt-2 text-[12.5px] leading-7 text-lavender/70">
            حساب تو یک حساب خواننده است. میز نویسنده فقط در دسترس نویسندهٔ مون‌بری قرار می‌گیرد.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <MagicalButton to="/library" variant="gold" size="sm">کتابخانهٔ من</MagicalButton>
            <MagicalButton to="/" variant="night" size="sm">خانه</MagicalButton>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6ebda]">
      <header className="border-b border-gold/25 bg-[#211a37] text-parchment">
        <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <MoonLogo className="h-9 w-9" />
            <div>
              <p className="font-wordmark text-lg leading-none">Moonberry</p>
              <p className="mt-1 text-[9px] tracking-[0.3em] text-gold/80">میز نویسنده</p>
            </div>
          </div>
          <nav className="flex items-center gap-1" aria-label="ناوبری میز نویسنده">
            {LINKS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  clsx(
                    'rounded-full px-3.5 py-1.5 text-[12px] transition',
                    isActive ? 'bg-gold/20 text-gold' : 'text-parchment/70 hover:text-parchment',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Link to="/" className="rounded-full px-3.5 py-1.5 text-[12px] text-parchment/70 transition hover:text-parchment">
              دیدن سایت
            </Link>
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-full border border-berry/40 px-3 py-1.5 text-[11px] text-berry/90 transition hover:bg-berry/15"
            >
              خروج
            </button>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6">
        <p className="text-[11px] text-ink/45">
          خوش آمدی {user.displayName} · همهٔ پیش‌نویس‌ها فقط برای تو دیده می‌شوند و هرگز در سایت عمومی نمایش داده نمی‌شوند.
        </p>
        <Outlet />
      </div>
    </div>
  )
}

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="mt-6 flex flex-col gap-4 border-b border-gold/25 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-plum sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-[12px] leading-6 text-ink/55">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}
