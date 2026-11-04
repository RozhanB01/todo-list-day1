/** Persian/Arabic text helpers shared by search, slugs and chapter metrics. */

const ARABIC_TO_PERSIAN: Array<[RegExp, string]> = [
  [/[\u064A\u0649]/g, 'ی'],
  [/\u0643/g, 'ک'],
  [/[\u0629\u06C0\u06C1]/g, 'ه'],
  [/[\u0623\u0625\u0622]/g, 'ا'],
  [/[\u0624]/g, 'و'],
  [/[\u0626]/g, 'ی'],
  [/[\u064B-\u0652\u0670\u0640]/g, ''],
]

/** Normalizes Persian and Arabic variants so search matches what readers type. */
export function normalizeFa(input: string): string {
  let out = (input || '').toString()
  for (const [pattern, replacement] of ARABIC_TO_PERSIAN) out = out.replace(pattern, replacement)
  out = out
    .replace(/\u200c/g, ' ')
    .replace(/[\u200e\u200f\u202a-\u202e]/g, '')
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
  return out
}

export function slugify(input: string): string {
  const base = normalizeFa(input)
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
  return base || `story-${Math.random().toString(36).slice(2, 8)}`
}

export function stripHtml(html: string): string {
  return (html || '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|h2|h3|blockquote|li)>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

export function countWords(text: string): number {
  const clean = text.trim()
  if (!clean) return 0
  return clean.split(/\s+/).length
}

export function readingMinutesFor(words: number): number {
  return Math.max(1, Math.ceil(words / 180))
}

export const MOOD_KEYS = ['mysterious', 'tender', 'fantasy', 'dark', 'cozy', 'adventure'] as const
export type MoodKey = (typeof MOOD_KEYS)[number]

export function isMoodKey(value: string): value is MoodKey {
  return (MOOD_KEYS as readonly string[]).includes(value)
}
