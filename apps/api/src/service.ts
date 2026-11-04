import { prisma } from './db.js'
import { normalizeFa, readingMinutesFor } from './persian.js'

export const MOOD_LABELS: Record<string, string> = {
  mysterious: 'رازآلود و مرموز',
  tender: 'لطیف و عاشقانه',
  fantasy: 'جادویی و فانتزی',
  dark: 'تاریک و هیجان‌انگیز',
  cozy: 'گرم و آرامش‌بخش',
  adventure: 'ماجراجویانه',
}

export const chapterListSelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  number: true,
  wordCount: true,
  readingMinutes: true,
  publishedAt: true,
  status: true,
} as const

export const novelListInclude = {
  genres: { include: { genre: { select: { slug: true, name: true, icon: true } } } },
  chapters: {
    where: { status: 'PUBLISHED' },
    select: chapterListSelect,
    orderBy: { number: 'asc' },
  },
  _count: { select: { favorites: true, views: true } },
} as const

export interface NovelFilters {
  q?: string
  genre?: string
  mood?: string
  status?: string
  length?: string
  sort?: string
}

export function shapeNovel(novel: any) {
  const chapters = (novel.chapters ?? [])
    .filter((chapter: any) => chapter.status === 'PUBLISHED' || chapter.status === undefined)
    .map((chapter: any) => ({
      id: chapter.id,
      slug: chapter.slug,
      title: chapter.title,
      summary: chapter.summary ?? null,
      number: chapter.number,
      wordCount: chapter.wordCount ?? 0,
      readingMinutes: chapter.readingMinutes ?? 1,
      publishedAt: chapter.publishedAt ?? null,
    }))
  const totalWords = chapters.reduce((sum: number, chapter: any) => sum + (chapter.wordCount ?? 0), 0)
  const lastChapter = chapters.length ? chapters[chapters.length - 1] : null

  return {
    id: novel.id,
    slug: novel.slug,
    title: novel.title,
    subtitle: novel.subtitle ?? null,
    description: novel.description,
    contentWarning: novel.contentWarning ?? null,
    status: novel.status,
    coverImageUrl: novel.coverImageUrl ?? null,
    coverPalette: novel.coverPalette ?? 'plum',
    coverMotif: novel.coverMotif ?? 'moon',
    readingMinutes: novel.readingMinutes ?? readingMinutesFor(totalWords),
    totalWords,
    featured: Boolean(novel.featured),
    featuredNote: novel.featuredNote ?? null,
    moods: novel.moods ?? [],
    isDemo: Boolean(novel.isDemo),
    seoTitle: novel.seoTitle ?? null,
    seoDescription: novel.seoDescription ?? null,
    publishedAt: novel.publishedAt ?? null,
    updatedAt: novel.updatedAt ?? null,
    genres: (novel.genres ?? []).map((entry: any) => ({
      slug: entry.genre.slug,
      name: entry.genre.name,
      icon: entry.genre.icon,
    })),
    chapters,
    chapterCount: chapters.length,
    latestChapter: lastChapter,
    favoriteCount: novel._count?.favorites ?? 0,
    viewCount: novel._count?.views ?? 0,
  }
}

export async function listPublishedNovels(filters: NovelFilters = {}) {
  const novels = await prisma.novel.findMany({
    where: {
      status: { not: 'DRAFT' },
      ...(filters.genre ? { genres: { some: { genre: { slug: filters.genre } } } } : {}),
    },
    include: novelListInclude as any,
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
  })

  let shaped = novels.map(shapeNovel).filter((novel: any) => novel.chapterCount > 0)

  if (filters.mood) shaped = shaped.filter((novel: any) => novel.moods.includes(filters.mood!))

  if (filters.q) {
    const needle = normalizeFa(filters.q)
    shaped = shaped.filter((novel: any) => {
      const haystack = normalizeFa(
        [novel.title, novel.subtitle, novel.description, ...novel.genres.map((g: any) => g.name)].join(' '),
      )
      return needle.split(' ').every((token) => haystack.includes(token))
    })
  }

  if (filters.status === 'ongoing') shaped = shaped.filter((novel: any) => novel.status === 'ONGOING')
  if (filters.status === 'completed') shaped = shaped.filter((novel: any) => novel.status === 'COMPLETED')

  if (filters.length === 'short') shaped = shaped.filter((novel: any) => novel.readingMinutes <= 15)
  if (filters.length === 'long') shaped = shaped.filter((novel: any) => novel.readingMinutes > 15)

  switch (filters.sort) {
    case 'popular':
      shaped.sort(
        (a: any, b: any) =>
          b.favoriteCount - a.favoriteCount ||
          b.viewCount - a.viewCount ||
          new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime(),
      )
      break
    case 'updated':
      shaped.sort((a: any, b: any) => {
        const aDate = a.latestChapter?.publishedAt ?? a.updatedAt ?? 0
        const bDate = b.latestChapter?.publishedAt ?? b.updatedAt ?? 0
        return new Date(bDate).getTime() - new Date(aDate).getTime()
      })
      break
    case 'chapters':
      shaped.sort((a: any, b: any) => b.chapterCount - a.chapterCount)
      break
    default:
      shaped.sort(
        (a: any, b: any) =>
          new Date(b.publishedAt ?? b.updatedAt ?? 0).getTime() -
          new Date(a.publishedAt ?? a.updatedAt ?? 0).getTime(),
      )
  }

  return shaped
}

export async function getPublishedNovel(slug: string) {
  const novel = await prisma.novel.findFirst({
    where: { slug, status: { not: 'DRAFT' } },
    include: novelListInclude as any,
  })
  if (!novel) return null
  const shaped = shapeNovel(novel)
  if (shaped.chapterCount === 0) return null
  return shaped
}

export async function relatedNovels(novel: any, limit = 4) {
  const genreSlugs: string[] = novel.genres.map((genre: any) => genre.slug)
  const novels = await prisma.novel.findMany({
    where: {
      status: { not: 'DRAFT' },
      id: { not: novel.id },
      ...(genreSlugs.length || novel.moods.length
        ? {
            OR: [
              ...(genreSlugs.length ? [{ genres: { some: { genre: { slug: { in: genreSlugs } } } } }] : []),
              ...(novel.moods.length ? [{ moods: { hasSome: novel.moods } }] : []),
            ],
          }
        : {}),
    },
    include: novelListInclude as any,
    take: 18,
  })

  return novels
    .map(shapeNovel)
    .filter((candidate: any) => candidate.chapterCount > 0)
    .map((candidate: any) => {
      const sharedGenres = candidate.genres.filter((genre: any) => genreSlugs.includes(genre.slug)).length
      const sharedMoods = candidate.moods.filter((mood: string) => novel.moods.includes(mood)).length
      return { candidate, score: sharedGenres * 2 + sharedMoods * 3 }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.candidate)
}

export async function latestChapters(limit = 6) {
  const chapters = await prisma.chapter.findMany({
    where: { status: 'PUBLISHED', novel: { status: { not: 'DRAFT' } } },
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    take: limit,
    include: {
      novel: { select: { slug: true, title: true, coverPalette: true, coverMotif: true, coverImageUrl: true } },
    },
  })
  return chapters.map((chapter) => ({
    id: chapter.id,
    slug: chapter.slug,
    title: chapter.title,
    number: chapter.number,
    publishedAt: chapter.publishedAt,
    readingMinutes: chapter.readingMinutes,
    novel: {
      slug: chapter.novel.slug,
      title: chapter.novel.title,
      coverPalette: chapter.novel.coverPalette,
      coverMotif: chapter.novel.coverMotif,
      coverImageUrl: chapter.novel.coverImageUrl,
    },
  }))
}

export function searchableText(parts: Array<string | null | undefined>) {
  return normalizeFa(parts.filter(Boolean).join(' '))
}
