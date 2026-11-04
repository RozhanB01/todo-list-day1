import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { FloralDivider, StarField } from '../components/art/Ornaments'
import { WitchMascot } from '../components/art/WitchMascot'
import { MagicalButton } from '../components/ui/MagicalButton'
import { Notice, Spinner } from '../components/ui/Feedback'
import { api } from '../lib/api'
import { useSeo } from '../lib/hooks'

function PageBanner({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <section className="relative overflow-hidden bg-night-sky py-12 text-parchment sm:py-16">
      <StarField count={26} seed={61} />
      <div className="container-page relative">
        <p className="eyebrow text-gold">{eyebrow}</p>
        <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-[13px] leading-7 text-lavender/75">{description}</p>
        <div className="mt-5">
          <FloralDivider className="w-52" tone="light" />
        </div>
      </div>
    </section>
  )
}

export function AboutPage() {
  useSeo({
    title: 'دربارهٔ نویسنده و دنیای مون‌بری',
    description: 'مون‌بری دفتر کار یک نویسندهٔ مستقل است؛ جایی که رمان‌های فانتزی، رازآلود و عاشقانه با حوصله نوشته و فصل‌به‌فصل منتشر می‌شوند.',
    path: '/about',
  })

  return (
    <div className="bg-parchment">
      <PageBanner
        eyebrow="دربارهٔ مون‌بری"
        title="یک کتابخانهٔ کوچک، به اندازهٔ یک دنیا"
        description="مون‌بری نه فروشگاه است و نه صفحهٔ تبلیغاتی. یک دفتر کار شخصی است که درش به روی همه باز مانده."
      />

      <div className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-start">
          <article className="max-w-2xl space-y-5 text-[13.5px] leading-8 text-ink/75">
            <p className="font-display text-lg font-bold text-plum">سلام؛ خوش آمدی به گوشهٔ دنج من.</p>
            <p>
              اسم این‌جا را گذاشته‌ام مون‌بری، به یاد توت‌های وحشی‌ای که در بچگی فکر می‌کردم زیر نور ماه آبی می‌شوند.
              سال‌ها بعد فهمیدم بعضی خیال‌ها را نباید اصلاح کرد؛ باید نوشتشان. مون‌بری همان خیال است که حالا شکل
              کتابخانه گرفته.
            </p>
            <p>
              این‌جا رمان‌های دنباله‌دار می‌نویسم؛ قصه‌هایی از قلعه‌های مه‌گرفته، باغ‌هایی که شب‌ها روشن می‌شوند و
              آدم‌هایی که تصمیم‌های کوچکشان دنیا را جابه‌جا می‌کند. هر فصل را با حوصله می‌نویسم، چند بار بازخوانی
              می‌کنم و بعد منتشر می‌کنم. به همین دلیل گاهی فاصلهٔ فصل‌ها کمی طول می‌کشد — اما هیچ فصلی نیمه‌کاره بیرون
              نمی‌آید.
            </p>
            <p>
              دوست دارم خواننده‌ها بدانند که برای خواندن هیچ‌چیز لازم نیست: نه ثبت‌نام، نه پرداخت. می‌توانی مهمان
              بیایی، از هر فصلی شروع کنی و بروی. اگر دلت خواست بمانی، حساب بسازی و قفسهٔ خودت را داشته باشی، پیشرفت
              خواندنت روی همهٔ دستگاه‌ها می‌ماند.
            </p>
            <p>
              و اگر جایی از قصه دلت را برد، یا جایی دلت را جا گذاشت، بنویس. برای یک نویسنده، هیچ‌چیز جای حرف خواننده
              را نمی‌گیرد.
            </p>
            <p className="pt-2 font-display text-sm text-[#8a5f74]">— نویسندهٔ مون‌بری</p>
          </article>

          <div className="space-y-5">
            <div className="ornament-frame rounded-[26px] p-6 text-center">
              <WitchMascot pose="cat" className="mx-auto h-56 w-auto" />
              <p className="mt-2 font-display text-[13px] font-semibold text-plum">«کمی جادو در هر قصه»</p>
              <p className="mt-2 text-[11px] leading-6 text-ink/50">
                جادوگر کوچولوی مون‌بری، راهنمای این کتابخانه است؛ از جلد رمان‌ها تا ته صفحهٔ آخر.
              </p>
            </div>
            <div className="rounded-[22px] border border-gold/30 bg-[#fffaf1] p-5">
              <p className="eyebrow">چند چیز کوچک</p>
              <ul className="mt-3 space-y-2.5 text-[12px] leading-6 text-ink/65">
                <li>همهٔ قصه‌های مون‌بری اصلی و نوشتهٔ همین‌جا هستند.</li>
                <li>هیچ عدد و آمار ساختگی‌ای در این سایت نمایش داده نمی‌شود.</li>
                <li>رمان‌های نمونه با برچسب «نمونه» مشخص شده‌اند.</li>
                <li>خواندن بدون حساب آزاد است؛ اطلاعات خواندن خصوصی می‌ماند.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {[
            { title: 'قصه‌های اصلی', body: 'هر رمان از صفر نوشته می‌شود؛ نه ترجمه، نه بازنویسی. دنیاها و شخصیت‌ها از همین دفتر بیرون می‌آیند.' },
            { title: 'انتشار فصل‌به‌فصل', body: 'فصل‌ها یکی‌یکی منتشر می‌شوند و ترتیبشان دست نویسنده است. نسخهٔ پیش‌نویس هرگز بیرون نمی‌رود.' },
            { title: 'خواندن بی‌دردسر', body: 'سه حال‌وهوای خواندن، اندازهٔ متن و فاصلهٔ سطرها؛ تا قصه همان‌طور خوانده شود که برای تو راحت است.' },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-gold/25 bg-[#fffaf1] p-5">
              <p className="font-display text-[14px] font-bold text-plum">{item.title}</p>
              <p className="mt-2 text-[11.5px] leading-6 text-ink/60">{item.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <MagicalButton to="/novels" variant="primary" size="md">گشتن در کتابخانه</MagicalButton>
          <MagicalButton to="/contact" variant="outline" size="md">نوشتن برای نویسنده</MagicalButton>
        </div>
      </div>
    </div>
  )
}

export function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [body, setBody] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [error, setError] = useState<string | null>(null)

  useSeo({
    title: 'تماس با نویسندهٔ مون‌بری',
    description: 'نامه‌ات را برای نویسندهٔ مون‌بری بنویس؛ دربارهٔ قصه‌ها، پیشنهادها یا هر چیز دیگری که دلت می‌خواهد.',
    path: '/contact',
  })

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setState('sending')
    try {
      await api('/messages', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), email: email.trim(), body: body.trim() }),
      })
      setState('sent')
      setName('')
      setEmail('')
      setBody('')
    } catch (err) {
      setState('idle')
      setError(err instanceof Error ? err.message : 'نامه فرستاده نشد؛ دوباره تلاش کن.')
    }
  }

  const inputClass =
    'mt-2 w-full rounded-xl border border-plum/15 bg-white/85 px-4 py-2.5 text-[13px] text-plum outline-none transition placeholder:text-ink/35 focus:border-gold focus:ring-2 focus:ring-gold/20'

  return (
    <div className="bg-parchment">
      <PageBanner
        eyebrow="نامهٔ خواننده"
        title="برایم بنویس"
        description="از هر چیزی که دربارهٔ قصه‌ها به ذهنت رسیده بنویس؛ خواننده‌ها بخشی از این دفترند."
      />

      <div className="container-page py-12">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-[26px] border border-gold/30 bg-[#fffaf1] p-6 sm:p-8">
            {state === 'sent' ? (
              <div className="py-8 text-center">
                <WitchMascot pose="greeting" className="mx-auto h-40 w-auto" decorative />
                <h2 className="mt-4 font-display text-lg font-bold text-plum">نامه‌ات رسید</h2>
                <p className="mx-auto mt-2 max-w-sm text-[12.5px] leading-7 text-ink/60">
                  ممنون که نوشتی. نامه‌ها را با حوصله می‌خوانم و در فرصت ممکن جواب می‌دهم.
                </p>
                <MagicalButton variant="outline" size="sm" className="mt-5" onClick={() => setState('idle')}>
                  نوشتن نامهٔ تازه
                </MagicalButton>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4" noValidate>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-[11.5px] text-ink/60">
                    نام
                    <input required value={name} onChange={(event) => setName(event.target.value)} className={inputClass} placeholder="چه صدایت کنم؟" />
                  </label>
                  <label className="block text-[11.5px] text-ink/60">
                    ایمیل
                    <input
                      required
                      type="email"
                      dir="ltr"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className={inputClass}
                      placeholder="you@example.com"
                    />
                  </label>
                </div>
                <label className="block text-[11.5px] text-ink/60">
                  نامه‌ات
                  <textarea
                    required
                    rows={7}
                    value={body}
                    onChange={(event) => setBody(event.target.value)}
                    className={`${inputClass} resize-y leading-7`}
                    placeholder="دربارهٔ کدام قصه می‌نویسی؟ چه چیزی دلت را برد یا جا گذاشت؟"
                  />
                </label>
                {error && <Notice tone="error">{error}</Notice>}
                <div className="flex items-center gap-3">
                  <MagicalButton type="submit" variant="primary" size="md" disabled={state === 'sending'}>
                    {state === 'sending' ? <Spinner className="h-4 w-4" /> : 'فرستادن نامه'}
                  </MagicalButton>
                  <span className="text-[10.5px] text-ink/40">ایمیلت فقط برای پاسخ به همین نامه استفاده می‌شود.</span>
                </div>
              </form>
            )}
          </div>

          <aside className="space-y-5">
            <div className="ornament-frame rounded-[24px] p-5">
              <p className="eyebrow">چند نکته</p>
              <ul className="mt-3 space-y-3 text-[12px] leading-6 text-ink/65">
                <li>اگر خطایی در متن فصل‌ها دیدی، با نام فصل بنویس تا سریع اصلاح کنم.</li>
                <li>پیشنهاد قصه یا حال‌وهوای تازه هم خوش‌آمد است.</li>
                <li>برای حذف حساب یا اطلاعات خواندن، از همین فرم درخواست بده.</li>
              </ul>
            </div>
            <div className="rounded-[24px] border border-gold/30 bg-[#fffaf1] p-5">
              <p className="font-display text-[13px] font-bold text-plum">دنبال قصه‌ای برای شروع هستی؟</p>
              <p className="mt-2 text-[11.5px] leading-6 text-ink/55">کتابخانه همیشه باز است؛ بدون حساب هم می‌توانی بخوانی.</p>
              <MagicalButton to="/novels" size="sm" className="mt-3">
                رفتن به کتابخانه
              </MagicalButton>
            </div>
            <div className="relative overflow-hidden rounded-[24px] border border-gold/25 bg-[linear-gradient(135deg,#f8e9d4,#fff5e8)] p-5">
              <WitchMascot pose="reading" className="absolute -bottom-2 left-2 h-28 w-auto opacity-80" decorative />
              <p className="max-w-[11rem] text-[11.5px] leading-6 text-ink/55">«قصه‌ها با خواندن بزرگ می‌شوند.»</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export function PrivacyPage() {
  useSeo({
    title: 'قوانین و حریم خصوصی',
    description: 'چیزهایی که مون‌بری ذخیره می‌کند، چرا ذخیره می‌کند و چطور می‌توانی حذفشان کنی.',
    path: '/privacy',
  })

  const sections = [
    {
      title: 'چه اطلاعاتی ذخیره می‌شود',
      body: 'اگر حساب بسازی، نام نمایشی، ایمیل و گذرواژه‌ات را نگه می‌داریم. گذرواژه هرگز به‌صورت متن ساده ذخیره نمی‌شود و با روش هش نگه‌داری می‌شود. اگر فقط بخوانی، هیچ حسابی لازم نیست.',
    },
    {
      title: 'پیشرفت خواندن و کتابخانهٔ شخصی',
      body: 'آخرین فصل، درصد پیشرفت، علاقه‌مندی‌ها و نشانک‌ها فقط برای خودت ذخیره می‌شوند و در هیچ صفحهٔ عمومی نمایش داده نمی‌شوند. برای مهمان‌ها این اطلاعات فقط در حافظهٔ همان دستگاه می‌ماند.',
    },
    {
      title: 'کوکی و حافظهٔ دستگاه',
      body: 'یک کوکی امن و httpOnly برای نگه‌داشتن نشست ورود استفاده می‌شود. تنظیمات خواندن (حال‌وهوا، اندازهٔ متن، فاصلهٔ سطرها) و پیشرفت مهمان در حافظهٔ مرورگر خودت می‌مانند. هیچ کوکی تبلیغاتی یا ردیاب بیرونی وجود ندارد.',
    },
    {
      title: 'آمار خواندن',
      body: 'برای نمایش آمار واقعی، هر بازدید فصل با یک شناسهٔ تصادفی روی دستگاه تو ثبت می‌شود تا بازدیدهای تکراری شمرده نشوند. این شناسه به هویت واقعی تو وصل نیست و اطلاعات شخصی محسوب نمی‌شود.',
    },
    {
      title: 'نامه‌های خوانندگان',
      body: 'اگر از صفحهٔ تماس نامه بفرستی، نام، ایمیل و متن نامه برای پاسخ‌دادن ذخیره می‌شود و در جای دیگری منتشر نمی‌شود.',
    },
    {
      title: 'حذف اطلاعات',
      body: 'می‌توانی از صفحهٔ تماس درخواست حذف حساب و همهٔ اطلاعات خواندنت را بدهی. اطلاعات مرتبط با حساب در اولین فرصت حذف می‌شود.',
    },
    {
      title: 'حقوق قصه‌ها',
      body: 'متن همهٔ رمان‌ها و داستان‌های مون‌بری نوشتهٔ نویسندهٔ این کتابخانه است. خواندن و هم‌رسانی نشانی صفحه‌ها آزاد است، اما بازنشر کامل متن بدون اجازه مجاز نیست.',
    },
  ]

  return (
    <div className="bg-parchment">
      <PageBanner
        eyebrow="قوانین و حریم خصوصی"
        title="چیزی پنهانی نداریم"
        description="این صفحه به زبان ساده می‌گوید مون‌بری چه چیزی را نگه می‌دارد و چرا."
      />
      <div className="container-page py-12">
        <div className="mx-auto max-w-3xl space-y-4">
          {sections.map((section) => (
            <section key={section.title} className="rounded-2xl border border-gold/25 bg-[#fffaf1] p-5">
              <h2 className="font-display text-[14.5px] font-bold text-plum">{section.title}</h2>
              <p className="mt-2 text-[12.5px] leading-7 text-ink/65">{section.body}</p>
            </section>
          ))}
          <div className="rounded-2xl border border-gold/30 bg-[#f8e9d4] p-5 text-[12px] leading-7 text-ink/60">
            اگر جایی از این توضیح‌ها برایت روشن نبود،{' '}
            <Link to="/contact" className="font-medium text-plum underline underline-offset-4">از صفحهٔ تماس</Link>{' '}
            بپرس. آخرین به‌روزرسانی این صفحه: آبان ۱۴۰۵.
          </div>
        </div>
      </div>
    </div>
  )
}

export function NotFoundPage() {
  useSeo({ title: 'صفحه پیدا نشد', description: 'این صفحه در مون‌بری وجود ندارد.', noindex: true })
  return (
    <div className="relative overflow-hidden bg-night-sky py-24 text-parchment">
      <StarField count={30} />
      <div className="container-page relative mx-auto max-w-lg text-center">
        <WitchMascot pose="lantern" className="mx-auto h-52 w-auto" decorative />
        <p className="mt-4 font-wordmark text-5xl text-gold/80">404</p>
        <h1 className="mt-3 font-display text-2xl font-bold">این صفحه در کتابخانه نیست</h1>
        <p className="mt-3 text-[12.5px] leading-7 text-lavender/70">
          شاید نشانی اشتباه تایپ شده یا این قصه هنوز منتشر نشده است. بیا از قفسه‌ها شروع کنیم.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <MagicalButton to="/" variant="gold" size="md">خانه</MagicalButton>
          <MagicalButton to="/novels" variant="night" size="md">کتابخانه</MagicalButton>
        </div>
      </div>
    </div>
  )
}
