import { Link } from 'react-router-dom'
import { HeroScene } from '../art/HeroScene'
import { LanternDecoration, StarField } from '../art/Ornaments'
import { IconSparkle } from '../art/Icons'
import { MagicalButton } from '../ui/MagicalButton'
import { faNumber, toFa } from '../../lib/format'
import type { HomePayload } from '../../lib/types'

export function HomeHero({ home }: { home: HomePayload | null }) {
  const firstNovel = home?.novels[0]
  const startHref = firstNovel?.chapters[0]
    ? `/read/${firstNovel.slug}/${firstNovel.chapters[0].slug}`
    : '/novels'

  return (
    <section className="relative isolate overflow-hidden bg-night-sky">
      <StarField count={48} />
      <div className="pointer-events-none absolute inset-0 opacity-[0.14]" aria-hidden="true">
        <svg viewBox="0 0 1440 720" className="h-full w-full" preserveAspectRatio="xMidYMax slice">
          <path d="M120 720V300c0-140 268-260 600-260s600 120 600 260v420" fill="none" stroke="#D6AC69" strokeWidth="2" />
          <path d="M200 720V312c0-118 232-220 520-220s520 102 520 220v408" fill="none" stroke="#D6AC69" strokeWidth="1" />
          <path d="M720 40v680M40 500h1360" stroke="#D6AC69" strokeWidth="1" />
        </svg>
      </div>

      <LanternDecoration className="absolute left-[3%] top-0 hidden h-56 animate-floaty xl:block" />
      <LanternDecoration className="absolute right-[6%] top-0 hidden h-40 animate-floaty lg:block" delay={2.5} />

      <div className="container-page relative grid items-center gap-10 pb-20 pt-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-8 lg:pb-28 lg:pt-16">
        <div className="relative z-10 text-center lg:text-start">
          <p className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-white/5 px-3.5 py-1.5 text-[11px] tracking-wide text-gold/90">
            <IconSparkle className="h-3.5 w-3.5" />
            کتابخانهٔ جادویی داستان‌ها و رمان‌های دنباله‌دار
          </p>

          <h1 className="mt-6 font-display text-[2.1rem] font-extrabold leading-[1.32] text-parchment text-balance sm:text-[2.8rem] lg:text-[3.3rem]">
            امشب، کدام دنیا منتظر توست؟
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-[14px] leading-8 text-lavender/85 sm:text-[15.5px] lg:mx-0">
            به مون‌بری خوش اومدی؛ جایی که هر کتاب، دری به یک دنیای تازه‌ست.
          </p>

          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row lg:justify-start">
            <MagicalButton to={startHref} variant="gold" size="lg" icon={<IconSparkle className="h-4 w-4" />}>
              شروع ماجراجویی
            </MagicalButton>
            <MagicalButton to="/novels" variant="night" size="lg">
              کشف رمان‌ها
            </MagicalButton>
          </div>

          <dl className="mt-9 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-parchment/75 lg:justify-start">
            {[
              { label: 'رمان منتشرشده', value: home?.stats.novels ?? 0 },
              { label: 'فصل آمادهٔ خواندن', value: home?.stats.chapters ?? 0 },
              { label: 'واژه در انتظار تو', value: home?.stats.words ?? 0 },
            ].map((item) => (
              <div key={item.label} className="flex items-baseline gap-1.5">
                <dt className="sr-only">{item.label}</dt>
                <dd className="font-wordmark text-2xl font-semibold text-gold">{faNumber(item.value)}</dd>
                <span className="text-[11px] text-lavender/65">{item.label}</span>
              </div>
            ))}
          </dl>

          <p className="mt-5 text-[11px] text-lavender/50">
            خواندن قصه‌ها بدون حساب هم آزاد است؛ برای نشانک و کتابخانهٔ شخصی، یک حساب کوچک بساز.
          </p>
        </div>

        <div className="relative order-2 mx-auto w-full max-w-[560px] lg:order-none">
          <div className="absolute inset-x-6 top-8 -z-10 h-[80%] rounded-full bg-[radial-gradient(closest-side,rgba(214,172,105,0.22),transparent)] blur-2xl" />
          <HeroScene className="h-auto w-full drop-shadow-[0_35px_60px_rgba(10,6,22,0.55)]" />
          <div className="pointer-events-none absolute -bottom-3 right-2 rounded-full border border-gold/30 bg-[#1e1633]/85 px-4 py-1.5 text-[10px] tracking-wide text-gold/85 backdrop-blur">
            کمی جادو در هر قصه
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-parchment/95 via-parchment/20 to-transparent" />
    </section>
  )
}
