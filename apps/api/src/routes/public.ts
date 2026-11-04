import { Router } from 'express'
import { prisma } from '../db.js'
import { MOOD_LABELS, getPublishedNovel, latestChapters, listPublishedNovels, relatedNovels } from '../service.js'
import { cleanChapterHtml } from '../html.js'
import type { AuthedRequest } from '../auth.js'

export const publicRouter = Router()

publicRouter.get('/genres', async (_req, res, next) => {
  try {
    const genres = await prisma.genre.findMany({ orderBy: { position: 'asc' } })
    const counts = await prisma.novelGenre.groupBy({
      by: ['genreId'],
      _count: { _all: true },
      where: { novel: { status: { not: 'DRAFT' } } },
    })
    const countMap = new Map(counts.map((row) => [row.genreId, row._count._all]))
    res.json({
      genres: genres.map((genre) => ({
        slug: genre.slug,
        name: genre.name,
        description: genre.description,
        icon: genre.icon,
        novelCount: countMap.get(genre.id) ?? 0,
      })),
      moods: Object.entries(MOOD_LABELS).map(([key, label]) => ({ key, label })),
    })
  } catch (error) {
    next(error)
  }
})

publicRouter.get('/novels', async (req, res, next) => {
  try {
    const novels = await listPublishedNovels({
      q: typeof req.query.q === 'string' ? req.query.q : undefined,
      genre: typeof req.query.genre === 'string' ? req.query.genre : undefined,
      mood: typeof req.query.mood === 'string' ? req.query.mood : undefined,
      status: typeof req.query.status === 'string' ? req.query.status : undefined,
      length: typeof req.query.length === 'string' ? req.query.length : undefined,
      sort: typeof req.query.sort === 'string' ? req.query.sort : undefined,
    })
    const limit = Number(req.query.limit) || novels.length
    res.json({ novels: novels.slice(0, limit), total: novels.length })
  } catch (error) {
    next(error)
  }
})

publicRouter.get('/novels/:slug', async (req, res, next) => {
  try {
    const novel = await getPublishedNovel(req.params.slug)
    if (!novel) return res.status(404).json({ error: 'این رمان پیدا نشد یا هنوز منتشر نشده است.' })
    const related = await relatedNovels(novel)
    res.json({ novel, related })
  } catch (error) {
    next(error)
  }
})

publicRouter.get('/novels/:slug/chapters/:chapterSlug', async (req, res, next) => {
  try {
    const novel = await getPublishedNovel(req.params.slug)
    if (!novel) return res.status(404).json({ error: 'این رمان پیدا نشد یا هنوز منتشر نشده است.' })

    const chapter = await prisma.chapter.findFirst({
      where: {
        slug: req.params.chapterSlug,
        novelId: novel.id,
        status: 'PUBLISHED',
      },
    })
    if (!chapter) return res.status(404).json({ error: 'این فصل هنوز منتشر نشده یا وجود ندارد.' })

    const index = novel.chapters.findIndex((item: any) => item.id === chapter.id)
    const previous = index > 0 ? novel.chapters[index - 1] : null
    const next = index >= 0 && index < novel.chapters.length - 1 ? novel.chapters[index + 1] : null

    res.json({
      novel: {
        id: novel.id,
        slug: novel.slug,
        title: novel.title,
        subtitle: novel.subtitle,
        coverPalette: novel.coverPalette,
        coverMotif: novel.coverMotif,
        coverImageUrl: novel.coverImageUrl,
        chapterCount: novel.chapterCount,
        contentWarning: novel.contentWarning,
      },
      chapter: {
        id: chapter.id,
        slug: chapter.slug,
        title: chapter.title,
        number: chapter.number,
        contentHtml: cleanChapterHtml(chapter.contentHtml),
        wordCount: chapter.wordCount,
        readingMinutes: chapter.readingMinutes,
        publishedAt: chapter.publishedAt,
      },
      chapters: novel.chapters.map((item: any) => ({
        id: item.id,
        slug: item.slug,
        title: item.title,
        number: item.number,
      })),
      previous: previous ? { slug: previous.slug, title: previous.title, number: previous.number } : null,
      next: next ? { slug: next.slug, title: next.title, number: next.number } : null,
    })
  } catch (error) {
    next(error)
  }
})

publicRouter.get('/latest-chapters', async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 6, 20)
    res.json({ chapters: await latestChapters(limit) })
  } catch (error) {
    next(error)
  }
})

publicRouter.get('/home', async (_req, res, next) => {
  try {
    const novels = await listPublishedNovels({ sort: 'newest' })
    const latest = await latestChapters(5)
    const featured = novels.find((novel: any) => novel.featured) ?? null
    const genres = await prisma.genre.findMany({ orderBy: { position: 'asc' } })
    const genreCounts = await prisma.novelGenre.groupBy({
      by: ['genreId'],
      _count: { _all: true },
      where: { novel: { status: { not: 'DRAFT' } } },
    })
    const countMap = new Map(genreCounts.map((row) => [row.genreId, row._count._all]))
    const totalWords = novels.reduce((sum: number, novel: any) => sum + novel.totalWords, 0)

    res.json({
      novels: novels.slice(0, 6),
      allPublishedCount: novels.length,
      latestChapters: latest,
      featured,
      genres: genres
        .map((genre) => ({
          slug: genre.slug,
          name: genre.name,
          icon: genre.icon,
          novelCount: countMap.get(genre.id) ?? 0,
        }))
        .filter((genre) => genre.novelCount > 0),
      moods: Object.entries(MOOD_LABELS).map(([key, label]) => ({
        key,
        label,
        count: novels.filter((novel: any) => novel.moods.includes(key)).length,
      })),
      stats: {
        novels: novels.length,
        chapters: novels.reduce((sum: number, novel: any) => sum + novel.chapterCount, 0),
        words: totalWords,
      },
    })
  } catch (error) {
    next(error)
  }
})

publicRouter.get('/recommend', async (req, res, next) => {
  try {
    const mood = typeof req.query.mood === 'string' ? req.query.mood : ''
    const genre = typeof req.query.genre === 'string' ? req.query.genre : ''
    const novels = await listPublishedNovels({ sort: 'newest' })

    const scored = novels
      .map((novel: any) => {
        let score = 0
        if (mood && novel.moods.includes(mood)) score += 3
        if (genre && novel.genres.some((item: any) => item.slug === genre)) score += 2
        return { novel, score }
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || b.novel.chapterCount - a.novel.chapterCount)

    if (scored.length === 0) {
      return res.json({
        novel: null,
        reason: 'با این حال‌وهوا هنوز قصه‌ای در کتابخانه نیست؛ اما می‌توانی از تازه‌ترین رمان‌های مون‌بری شروع کنی.',
        alternatives: novels.slice(0, 3),
      })
    }

    const best = scored[0]
    const moodLabel = mood ? MOOD_LABELS[mood] : ''
    const matchedGenre = genre
      ? best.novel.genres.find((item: any) => item.slug === genre)
      : null
    const reasons: string[] = []
    if (mood && best.novel.moods.includes(mood)) reasons.push(`حال‌وهوای «${moodLabel}»`)
    if (matchedGenre) reasons.push(`ژانر ${matchedGenre.name}`)
    const reason = reasons.length
      ? `چون دنبال ${reasons.join(' و ')} بودی، این قصه با امشبت جور در می‌آید.`
      : 'این قصه نزدیک‌ترین حال‌وهوا به انتخاب امشب توست.'

    res.json({
      novel: best.novel,
      reason,
      alternatives: scored.slice(1, 4).map((entry) => entry.novel),
    })
  } catch (error) {
    next(error)
  }
})

/** Real view counter, de-duplicated per visitor and chapter for six hours. */
publicRouter.post('/novels/:id/views', async (req: AuthedRequest, res, next) => {
  try {
    const novelId = req.params.id
    const chapterId = typeof req.body?.chapterId === 'string' ? req.body.chapterId : null
    const visitorKey =
      typeof req.body?.visitorKey === 'string' && req.body.visitorKey.length < 80
        ? req.body.visitorKey
        : 'anon'
    const novel = await prisma.novel.findFirst({
      where: { id: novelId, status: { not: 'DRAFT' } },
      select: { id: true },
    })
    if (!novel) return res.status(404).json({ error: 'not found' })

    const since = new Date(Date.now() - 6 * 60 * 60 * 1000)
    const recent = await prisma.novelView.findFirst({
      where: {
        novelId,
        visitorKey,
        chapterId: chapterId ?? null,
        createdAt: { gte: since },
      },
      select: { id: true },
    })
    if (!recent) {
      await prisma.novelView.create({
        data: { novelId, chapterId, visitorKey, userId: req.user?.id ?? null },
      })
    }
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
})
