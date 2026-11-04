import { Link } from 'react-router-dom'
import { MoonLogo, StarField } from '../art/Ornaments'
import { WitchMascot } from '../art/WitchMascot'
import { toFa, toJalali } from '../../lib/format'

export function SiteFooter() {
  const year = toJalali(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()).jy

  return (
    <footer className="relative overflow-hidden bg-[#1b142c] text-parchment">
      <StarField count={30} className="opacity-70" seed={23} />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-parchment/8 to-transparent" />

      <div className="container-page relative py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr] md:gap-8">
          <div>
            <div className="flex items-center gap-3">
              <MoonLogo className="h-11 w-11" />
              <div>
                <p className="font-wordmark text-2xl tracking-wide text-parchment">Moonberry</p>
                <p className="mt-0.5 text-[10px] tracking-[0.32em] text-gold/80">مون‌بری</p>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-[13px] leading-7 text-lavender/75">
              مون‌بری یک کتابخانهٔ کوچک و شخصی است؛ جایی که قصه‌ها شبیه فانوس‌هایی روی طاقچه روشن می‌مانند. هر رمان این‌جا
              دست‌نویس یک نویسنده است و خوانندگان، مهمان‌های همیشگیِ آن.
            </p>
            <p className="mt-4 font-display text-sm text-berry/85">«کمی جادو در هر قصه»</p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[12px] text-lavender/60">
              <Link to="/about" className="hover:text-gold">دربارهٔ مون‌بری</Link>
              <Link to="/contact" className="hover:text-gold">تماس با نویسنده</Link>
              <Link to="/privacy" className="hover:text-gold">قوانین و حریم خصوصی</Link>
            </div>
          </div>

          <div>
            <p className="eyebrow text-gold/80">کتابخانه</p>
            <ul className="mt-4 space-y-2.5 text-[13px] text-lavender/75">
              <li><Link to="/novels" className="transition hover:text-parchment">همهٔ رمان‌ها</Link></li>
              <li><Link to="/genres" className="transition hover:text-parchment">دسته‌بندی‌ها</Link></li>
              <li><Link to="/latest" className="transition hover:text-parchment">تازه‌ترین فصل‌ها</Link></li>
              <li><Link to="/library" className="transition hover:text-parchment">کتابخانهٔ من</Link></li>
            </ul>
          </div>

          <div className="relative">
            <p className="eyebrow text-gold/80">کنار پنجره</p>
            <p className="mt-4 max-w-[15rem] text-[13px] leading-7 text-lavender/70">
              اگر کتابی دلت را گرفت، برای نویسنده‌اش بنویس. قصه‌ها با خواندن بزرگ می‌شوند.
            </p>
            <WitchMascot pose="cat" className="pointer-events-none absolute -bottom-4 left-0 hidden h-28 w-auto opacity-90 md:block" decorative />
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/8 pt-6 text-[11px] text-lavender/45 sm:flex-row">
          <p>© {toFa(year)} مون‌بری — همهٔ قصه‌ها از آنِ خودشان‌اند.</p>
          <p className="flex items-center gap-2">
            <span className="inline-block h-1 w-1 rounded-full bg-gold/70" />
            ساخته‌شده با نور فانوس و کمی جادو
          </p>
        </div>
      </div>
    </footer>
  )
}
