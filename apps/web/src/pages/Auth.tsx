import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import type { FormEvent } from 'react'
import { StarField, FloralDivider, MoonLogo } from '../components/art/Ornaments'
import { WitchMascot } from '../components/art/WitchMascot'
import { MagicalButton } from '../components/ui/MagicalButton'
import { Notice, Spinner } from '../components/ui/Feedback'
import { useAuth } from '../lib/auth'
import { useSeo } from '../lib/hooks'

const inputClass =
  'mt-2 w-full rounded-xl border border-plum/15 bg-white/85 px-4 py-2.5 text-[13px] text-plum outline-none transition placeholder:text-ink/35 focus:border-gold focus:ring-2 focus:ring-gold/20'

function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
  footer: React.ReactNode
}) {
  return (
    <div className="relative overflow-hidden bg-night-sky py-12 sm:py-16">
      <StarField count={36} />
      <div className="container-page relative grid items-center gap-10 lg:grid-cols-[1fr_1.05fr]">
        <div className="hidden text-parchment lg:block">
          <div className="flex items-center gap-3">
            <MoonLogo className="h-12 w-12" />
            <div>
              <p className="font-wordmark text-3xl tracking-wide">Moonberry</p>
              <p className="mt-1 text-[10px] tracking-[0.34em] text-gold/80">مون‌بری</p>
            </div>
          </div>
          <h2 className="mt-8 max-w-md font-display text-2xl font-bold leading-relaxed">
            قفسه‌ای که همیشه منتظر توست
          </h2>
          <p className="mt-3 max-w-md text-[13px] leading-8 text-lavender/70">
            با حساب مون‌بری، جای صفحه‌ای که رهایش کرده‌ای گم نمی‌شود. علاقه‌مندی‌ها و نشانک‌ها روی همهٔ دستگاه‌هایت
            همراهت می‌آیند.
          </p>
          <div className="relative mt-8 w-56">
            <div className="absolute inset-x-6 bottom-2 -z-10 h-32 rounded-full bg-gold/15 blur-2xl" />
            <WitchMascot pose="greeting" className="h-60 w-auto" decorative />
          </div>
          <div className="mt-6 w-52">
            <FloralDivider tone="light" />
          </div>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="rounded-[26px] border border-gold/35 bg-[#fffaf1] p-6 shadow-[0_40px_80px_-40px_rgba(10,6,22,0.9)] sm:p-8">
            <p className="eyebrow">مون‌بری</p>
            <h1 className="mt-2 font-display text-2xl font-bold text-plum">{title}</h1>
            <p className="mt-2 text-[12px] leading-6 text-ink/55">{subtitle}</p>
            <div className="mt-6">{children}</div>
            <div className="mt-6 border-t border-gold/25 pt-4 text-center text-[11.5px] text-ink/55">{footer}</div>
          </div>
          <p className="mt-4 text-center text-[10.5px] leading-6 text-lavender/50">
            خواندن همهٔ قصه‌ها بدون حساب هم آزاد است. اطلاعات خواندن تو خصوصی می‌ماند.
          </p>
        </div>
      </div>
    </div>
  )
}

export function LoginPage() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next') || '/library'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useSeo({ title: 'ورود به مون‌بری', description: 'ورود به حساب خوانندگی مون‌بری.', path: '/login', noindex: true })

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const signedIn = await login(email.trim(), password)
      navigate(signedIn.role === 'ADMIN' && next === '/library' ? '/admin' : next, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ورود انجام نشد.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="خوش برگشتی"
      subtitle="با ایمیل و گذرواژه‌ات وارد شو تا قصه‌ات را همان‌جا که گذاشتی باز کنی."
      footer={
        <>
          حساب نداری؟{' '}
          <Link to={`/register${next !== '/library' ? `?next=${encodeURIComponent(next)}` : ''}`} className="font-medium text-plum underline underline-offset-4">
            ساخت حساب تازه
          </Link>
        </>
      }
    >
      {user && (
        <div className="mb-4">
          <Notice tone="success">
            الان با {user.displayName} وارد شده‌ای. <Link to="/library" className="underline">کتابخانهٔ من</Link>
          </Notice>
        </div>
      )}
      <form onSubmit={submit} className="space-y-4" noValidate>
        <label className="block text-[11.5px] text-ink/60">
          ایمیل یا نام کاربری
          <input
            type="text"
            required
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className={inputClass}
            dir="ltr"
          />
        </label>
        <label className="block text-[11.5px] text-ink/60">
          گذرواژه
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            className={inputClass}
            dir="ltr"
          />
        </label>
        {error && <Notice tone="error">{error}</Notice>}
        <MagicalButton type="submit" variant="primary" size="md" className="w-full" disabled={loading}>
          {loading ? <Spinner className="h-4 w-4" /> : 'ورود به کتابخانه'}
        </MagicalButton>
      </form>
    </AuthShell>
  )
}

export function RegisterPage() {
  const { register, user } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next') || '/library'
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useSeo({ title: 'ساخت حساب در مون‌بری', description: 'ساخت حساب خوانندگی در مون‌بری.', path: '/register', noindex: true })

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    if (password.length < 8) {
      setError('گذرواژه باید دست‌کم ۸ نویسه باشد.')
      return
    }
    if (password !== confirm) {
      setError('دو گذرواژه با هم یکسان نیستند.')
      return
    }
    setLoading(true)
    try {
      await register(email.trim(), password, displayName.trim())
      navigate(next, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ساخت حساب انجام نشد.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="یک قفسه برای خودت بساز"
      subtitle="فقط چند لحظه وقت می‌گیرد؛ بعد از آن، کتابخانه‌ات هر جا همراهت است."
      footer={
        <>
          قبلاً حساب ساخته‌ای؟{' '}
          <Link to="/login" className="font-medium text-plum underline underline-offset-4">
            ورود به حساب
          </Link>
        </>
      }
    >
      {user && (
        <div className="mb-4">
          <Notice tone="info">
            با {user.displayName} وارد شده‌ای. برای ساخت حساب دیگر اول خارج شو.
          </Notice>
        </div>
      )}
      <form onSubmit={submit} className="space-y-4" noValidate>
        <label className="block text-[11.5px] text-ink/60">
          نامی که صدایت کنیم
          <input
            required
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="مثلاً نارنج"
            className={inputClass}
            minLength={2}
          />
        </label>
        <label className="block text-[11.5px] text-ink/60">
          ایمیل
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className={inputClass}
            dir="ltr"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-[11.5px] text-ink/60">
            گذرواژه
            <input
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="حداقل ۸ نویسه"
              className={inputClass}
              dir="ltr"
              minLength={8}
            />
          </label>
          <label className="block text-[11.5px] text-ink/60">
            تکرار گذرواژه
            <input
              type="password"
              required
              autoComplete="new-password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              placeholder="••••••••"
              className={inputClass}
              dir="ltr"
            />
          </label>
        </div>
        {error && <Notice tone="error">{error}</Notice>}
        <MagicalButton type="submit" variant="gold" size="md" className="w-full" disabled={loading}>
          {loading ? <Spinner className="h-4 w-4" /> : 'ساخت حساب و شروع'}
        </MagicalButton>
      </form>
    </AuthShell>
  )
}
