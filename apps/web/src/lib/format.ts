const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
const MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
]

export function toFa(value: number | string): string {
  return String(value).replace(/\d/g, (digit) => FA_DIGITS[Number(digit)])
}

export function faNumber(value: number): string {
  return toFa(value.toLocaleString('en-US'))
}

export function compactNumber(value: number): string {
  if (value >= 1000) {
    const rounded = Math.round(value / 100) / 10
    return `${toFa(rounded)} هزار`
  }
  return toFa(value)
}

interface JalaliDate {
  jy: number
  jm: number
  jd: number
}

/** Gregorian → Jalali (a compact, dependency-free conversion). */
export function toJalali(gy: number, gm: number, gd: number): JalaliDate {
  const gDaysInMonth = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
  let year = gy <= 1600 ? 0 : 979
  let gYear = gy <= 1600 ? gy - 621 : gy - 1600
  const leapBase = gm > 2 ? gYear + 1 : gYear
  let days =
    365 * gYear +
    Math.floor((leapBase + 3) / 4) -
    Math.floor((leapBase + 99) / 100) +
    Math.floor((leapBase + 399) / 400) -
    80 +
    gd +
    gDaysInMonth[gm - 1]
  year += 33 * Math.floor(days / 12053)
  days %= 12053
  year += 4 * Math.floor(days / 1461)
  days %= 1461
  if (days > 365) {
    year += Math.floor((days - 1) / 365)
    days = (days - 1) % 365
  }
  const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30)
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30)
  return { jy: year, jm, jd }
}

export function formatFaDate(iso: string | null | undefined, withYear = true): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const { jy, jm, jd } = toJalali(date.getFullYear(), date.getMonth() + 1, date.getDate())
  return withYear ? `${toFa(jd)} ${MONTHS[jm - 1]} ${toFa(jy)}` : `${toFa(jd)} ${MONTHS[jm - 1]}`
}

export function relativeFa(iso: string | null | undefined): string {
  if (!iso) return ''
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const diff = Math.max(0, Date.now() - then)
  const minutes = Math.round(diff / 60000)
  if (minutes < 2) return 'همین حالا'
  if (minutes < 60) return `${toFa(minutes)} دقیقه پیش`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${toFa(hours)} ساعت پیش`
  const days = Math.round(hours / 24)
  if (days < 30) return `${toFa(days)} روز پیش`
  return formatFaDate(iso, false)
}

export function readingLength(minutes: number): string {
  if (!minutes) return ''
  if (minutes < 60) return `${toFa(minutes)} دقیقه مطالعه`
  const hours = Math.round((minutes / 60) * 10) / 10
  return `${toFa(hours)} ساعت مطالعه`
}

export const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'پیش‌نویس',
  ONGOING: 'در حال انتشار',
  COMPLETED: 'کامل‌شده',
}

export const MOOD_META: Record<string, { label: string; icon: string; hint: string }> = {
  mysterious: { label: 'رازآلود و مرموز', icon: 'moon', hint: 'برای شب‌هایی که دنبال یک معما هستی' },
  tender: { label: 'لطیف و عاشقانه', icon: 'strawberry', hint: 'برای وقتی دلت یک قصهٔ گرم می‌خواهد' },
  fantasy: { label: 'جادویی و فانتزی', icon: 'wand', hint: 'برای فرار از دنیای معمولی' },
  dark: { label: 'تاریک و هیجان‌انگیز', icon: 'candle', hint: 'برای خواننده‌های بی‌باک' },
  cozy: { label: 'گرم و آرامش‌بخش', icon: 'mushroom', hint: 'برای پتو و یک فنجان چای' },
  adventure: { label: 'ماجراجویانه', icon: 'sparkle', hint: 'برای وقتی می‌خواهی راه بیفتی' },
}

export const PALETTE_LABELS: Record<string, string> = {
  plum: 'آلوی نیمه‌شب',
  navy: 'سرمهٔ جادویی',
  rose: 'صورتی توت‌فرنگی',
  forest: 'سبز جنگل',
  gold: 'طلای کهنه',
  lavender: 'یاس بنفش',
}
