import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { MoonLogo } from '../art/Ornaments'
import { BookCover } from '../art/BookCover'
import { IconClose, IconHeart, IconMenu, IconSearch, IconUser } from '../art/Icons'
import { MagicalButton } from '../ui/MagicalButton'
import { useAuth } from '../../lib/auth'
import { api } from '../../lib/api'
import type { Novel } from '../../lib/types'
import { toFa } from '../../lib/format'

const NAV = [
  { to: '/', label: 'خانه' },
  { to: '/novels', label: 'رمان‌ها' },
  { to: '/genres', label: 'دسته‌بندی‌ها' },
  { to: '/latest', label: 'تازه‌ترین فصل‌ها' },
  { to: '/library', label: 'کتابخانهٔ من' },
  { to: '/about', label: 'دربارهٔ نویسنده' },
]

function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Novel[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    setQuery('')
    setResults([])
    const timer = window.setTimeout(() => inputRef.current?.focus(), 60)
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(timer)
      window.clearTimeout(timer)
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const trimmed = query.trim()
    if (!trimmed) {
      setResults([])
      return
    }
    setLoading(true)
    const timer = window.setTimeout(async () => {
      try {
        const data = await api<{ novels: Novel[] }>(`/novels?limit=6&q=${encodeURIComponent(trimmed)}`)
        setResults(data.novels)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 260)
    return () => window.clearTimeout(timer)
  }, [query, open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[12vh] sm:pt-[16vh]" role="dialog" aria-modal="true" aria-label="جست‌وجو در مون‌بری">
      <button type="button" className="absolute inset-0 bg-plum/75 backdrop-blur-md" onClick={onClose} aria-label="بستن جست‌وجو" />
      <div className="relative w-full max-w-2xl animate-riseIn">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            const trimmed = query.trim()
            onClose()
            navigate(trimmed ? `/novels?q=${encodeURIComponent(trimmed)}` : '/novels')
          }}
          className="flex items-center gap-3 rounded-[22px] border border-gold/40 bg-[#fffaf1] px-5 py-4 shadow-[0_40px_80px_-30px_rgba(15,10,30,0.9)]"
        >
          <IconSearch className="h-5 w-5 shrink-0 text-[#8a6fa0]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="دنبال چه دنیایی می‌گردی؟ نام رمان یا حال‌وهوا…"
            className="w-full bg-transparent text-[15px] text-plum outline-none placeholder:text-ink/40"
            aria-label="متن جست‌وجو"
          />
          <button type="button" onClick={onClose} aria-label="بستن" className="rounded-full p-1 text-plum/60 transition hover:bg-plum/10 hover:text-plum">
            <IconClose className="h-5 w-5" />
          </button>
        </form>

        <div className="mt-3 overflow-hidden rounded-[22px] border border-gold/25 bg-[#fffaf1]/97 shadow-2xl">
          {loading && <p className="px-5 py-6 text-center text-xs text-ink/50">دارم کتابخانه را می‌گردم…</p>}
          {!loading && !query.trim() && (
            <p className="px-5 py-6 text-center text-xs leading-6 text-ink/50">
              جادو با یک کلمه شروع می‌شود؛ اسم رمان را بنویس یا «مه»، «باغ» یا «ققنوس» را امتحان کن.
            </p>
          )}
          {!loading && query.trim() && results.length === 0 && (
            <p className="px-5 py-6 text-center text-xs text-ink/50">برای «{query.trim()}» قصه‌ای در کتابخانه پیدا نشد.</p>
          )}
          {results.length > 0 && (
            <ul className="max-h-[52vh] divide-y divide-plum/8 overflow-auto">
              {results.map((novel) => (
                <li key={novel.id}>
                  <Link
                    to={`/novels/${novel.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-4 px-4 py-3 transition hover:bg-vanilla/80"
                  >
                    <BookCover
                      title={novel.title}
                      palette={novel.coverPalette}
                      motif={novel.coverMotif}
                      coverImageUrl={novel.coverImageUrl}
                      size="sm"
                      className="h-16 w-11 shrink-0"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-sm font-bold text-plum">{novel.title}</span>
                      <span className="mt-1 block truncate text-[11px] text-ink/55">{novel.genres.map((genre) => genre.name).join(' · ')}</span>
                    </span>
                    <span className="shrink-0 text-[10px] text-ink/40">{toFa(novel.chapterCount)} فصل</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="mt-4 text-center text-[11px] text-lavender/80">
          جست‌وجو با «ی/ي» و «ک/ك» فارسی و عربی هم کار می‌کند · Esc برای بستن
        </p>
      </div>
    </div>
  )
}

export function MoonberryHeader() {
  const { user, isAdmin, logout } = useAuth()
  const location = useLocation()
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setProfileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const isActive = (to: string) => (to === '/' ? location.pathname === '/' : location.pathname.startsWith(to))

  return (
    <>
      <header
        className={clsx(
          'sticky top-0 z-50 border-b transition-all duration-500',
          scrolled
            ? 'border-gold/25 bg-[#1d1631]/95 shadow-[0_18px_40px_-24px_rgba(10,6,20,0.9)] backdrop-blur-xl'
            : 'border-transparent bg-gradient-to-b from-[#201835]/95 to-[#201835]/70 backdrop-blur-md',
        )}
      >
        <div className="container-page flex h-[70px] items-center justify-between gap-4 sm:h-[78px]">
          <Link to="/" className="group flex items-center gap-2.5" aria-label="مون‌بری، خانه">
            <MoonLogo className="h-10 w-10 transition-transform duration-500 group-hover:-rotate-6 sm:h-11 sm:w-11" />
            <span className="leading-none">
              <span className="block font-wordmark text-[22px] font-semibold tracking-[0.06em] text-parchment sm:text-[26px]">
                Moonberry
              </span>
              <span className="mt-1 block font-body text-[10px] tracking-[0.32em] text-gold/80">مون‌بری</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="ناوبری اصلی">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={clsx(
                  'relative rounded-full px-3 py-2 text-[13px] transition-colors',
                  isActive(item.to) ? 'text-gold' : 'text-parchment/75 hover:text-parchment',
                )}
                aria-current={isActive(item.to) ? 'page' : undefined}
              >
                {item.label}
                <span
                  className={clsx(
                    'absolute inset-x-3 -bottom-0.5 h-px origin-center bg-gradient-to-l from-transparent via-gold to-transparent transition-transform duration-300',
                    isActive(item.to) ? 'scale-x-100' : 'scale-x-0',
                  )}
                />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-full border border-parchment/15 bg-white/5 text-parchment/80 transition hover:border-gold/50 hover:text-gold"
              aria-label="جست‌وجوی رمان"
            >
              <IconSearch className="h-[18px] w-[18px]" />
            </button>

            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen((value) => !value)}
                  className="flex items-center gap-2 rounded-full border border-parchment/15 bg-white/5 py-1 pe-3 ps-1 text-parchment/85 transition hover:border-gold/50"
                  aria-expanded={profileOpen}
                  aria-haspopup="menu"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-b from-[#e8c58c] to-[#c79b58] font-display text-sm font-bold text-[#2c2140]">
                    {user.displayName.trim().charAt(0) || 'م'}
                  </span>
                  <span className="hidden max-w-[7rem] truncate text-xs sm:block">{user.displayName}</span>
                </button>
                {profileOpen && (
                  <>
                    <button type="button" className="fixed inset-0 z-10 cursor-default" aria-hidden="true" onClick={() => setProfileOpen(false)} />
                    <div className="absolute end-0 z-20 mt-2 w-52 overflow-hidden rounded-2xl border border-gold/30 bg-[#211a37] py-1.5 shadow-2xl">
                      <Link to="/library" className="flex items-center gap-2 px-4 py-2.5 text-[13px] text-parchment/85 hover:bg-white/8">
                        <IconHeart className="h-4 w-4" /> کتابخانهٔ من
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" className="flex items-center gap-2 px-4 py-2.5 text-[13px] text-parchment/85 hover:bg-white/8">
                          <IconUser className="h-4 w-4" /> میز نویسنده
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false)
                          void logout()
                        }}
                        className="w-full px-4 py-2.5 text-start text-[13px] text-berry/90 hover:bg-white/8"
                      >
                        خروج از حساب
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <MagicalButton to="/login" variant="gold" size="sm" className="hidden sm:inline-flex">
                ورود / ثبت‌نام
              </MagicalButton>
            )}

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-full border border-parchment/15 bg-white/5 text-parchment/80 transition hover:border-gold/50 hover:text-gold lg:hidden"
              aria-label="منوی مون‌بری"
              aria-expanded={menuOpen}
            >
              <IconMenu className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      {menuOpen && (
        <div className="fixed inset-0 z-[65] lg:hidden" role="dialog" aria-modal="true" aria-label="منوی اصلی">
          <button type="button" className="absolute inset-0 bg-plum/70 backdrop-blur-sm" onClick={() => setMenuOpen(false)} aria-label="بستن منو" />
          <div className="absolute inset-y-0 right-0 flex w-[86%] max-w-sm animate-riseIn flex-col bg-[#1f1834] px-6 pb-8 pt-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MoonLogo className="h-9 w-9" />
                <span className="font-wordmark text-xl text-parchment">Moonberry</span>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-full border border-parchment/15 text-parchment/75"
                aria-label="بستن منو"
              >
                <IconClose className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-6 text-[11px] tracking-[0.34em] text-gold/70">کتابخانه</p>
            <nav className="mt-3 flex flex-col" aria-label="ناوبری موبایل">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={clsx(
                    'border-b border-white/6 py-3.5 font-display text-[15px] transition-colors',
                    isActive(item.to) ? 'text-gold' : 'text-parchment/85 hover:text-parchment',
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto space-y-3 pt-8">
              {user ? (
                <>
                  <p className="text-xs text-lavender/70">خوش برگشتی، {user.displayName}.</p>
                  {isAdmin && (
                    <MagicalButton to="/admin" variant="night" size="md" className="w-full">
                      میز نویسنده
                    </MagicalButton>
                  )}
                  <MagicalButton
                    variant="outline"
                    size="md"
                    className="w-full border-parchment/20 bg-transparent text-parchment"
                    onClick={() => void logout()}
                  >
                    خروج از حساب
                  </MagicalButton>
                </>
              ) : (
                <>
                  <MagicalButton to="/login" variant="gold" size="md" className="w-full">
                    ورود به حساب
                  </MagicalButton>
                  <MagicalButton to="/register" variant="night" size="md" className="w-full">
                    ساخت حساب تازه
                  </MagicalButton>
                </>
              )}
              <p className="text-center text-[10px] leading-5 text-lavender/45">کمی جادو در هر قصه</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
