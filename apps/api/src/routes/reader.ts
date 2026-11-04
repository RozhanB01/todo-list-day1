import { Router } from 'express'
import { prisma } from '../db.js'
import { requireAuth, type AuthedRequest } from '../auth.js'
import { novelListInclude, shapeNovel } from '../service.js'

export const readerRouter = Router()

readerRouter.use(requireAuth)

async function chapterLookup(ids: string[]) {
  if (!ids.length) return new Map<string, any>()
  const chapters = await prisma.chapter.findMany({
    where: { id: { in: ids } },
    select: { id: true, slug: true, title: true, number: true },
  })
  return new Map(chapters.map((chapter) => [chapter.id, chapter]))
}

readerRouter.get('/library', async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user!.id
    const [progressRows, favoriteRows, bookmarkRows] = await Promise.all([
      prisma.readingProgress.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        include: { novel: { include: novelListInclude as any } },
      }),
      prisma.favorite.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: { novel: { include: novelListInclude as any } },
      }),
      prisma.bookmark.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: { chapter: { select: { slug: true, title: true, number: true } } },
      }),
    ])

    const chapterIds = progressRows.map((row) => row.chapterId)
    const bookmarkNovelIds = bookmarkRows.map((row) => row.novelId)
    const [chapterMap, bookmarkNovels] = await Promise.all([
      chapterLookup(chapterIds),
      bookmarkNovelIds.length
        ? prisma.novel.findMany({
            where: { id: { in: bookmarkNovelIds } },
            select: { id: true, slug: true, title: true, coverPalette: true, coverMotif: true, coverImageUrl: true },
          })
        : Promise.resolve([]),
    ])
    const bookmarkNovelMap = new Map(bookmarkNovels.map((novel) => [novel.id, novel]))

    const progressItems = progressRows
      .map((row) => {
        const novel = shapeNovel(row.novel)
        if (!novel.chapterCount) return null
        const chapter = chapterMap.get(row.chapterId) ?? null
        return {
          novel,
          chapter,
          percent: row.percent,
          finished: row.finished,
          updatedAt: row.updatedAt,
        }
      })
      .filter(Boolean)

    const reading = progressItems.filter((item: any) => !item.finished)
    const finished = progressItems.filter((item: any) => item.finished)
    const lastRead = progressItems[0] ?? null

    res.json({
      reading,
      finished,
      favorites: favoriteRows
        .map((row) => ({
          novel: shapeNovel(row.novel),
          createdAt: row.createdAt,
        }))
        .filter((row) => row.novel.chapterCount > 0),
      bookmarks: bookmarkRows.map((row) => ({
        id: row.id,
        note: row.note,
        createdAt: row.createdAt,
        chapter: row.chapter,
        novel: bookmarkNovelMap.get(row.novelId) ?? null,
      })),
      lastRead: lastRead
        ? {
            novelSlug: lastRead.novel.slug,
            novelTitle: lastRead.novel.title,
            chapterSlug: lastRead.chapter?.slug ?? null,
            chapterTitle: lastRead.chapter?.title ?? null,
            percent: lastRead.percent,
          }
        : null,
    })
  } catch (error) {
    next(error)
  }
})

readerRouter.post('/favorites/:novelId', async (req: AuthedRequest, res, next) => {
  try {
    const novelId = req.params.novelId
    const novel = await prisma.novel.findFirst({
      where: { id: novelId, status: { not: 'DRAFT' } },
      select: { id: true },
    })
    if (!novel) return res.status(404).json({ error: 'این رمان در دسترس نیست.' })
    await prisma.favorite.upsert({
      where: { userId_novelId: { userId: req.user!.id, novelId } },
      create: { userId: req.user!.id, novelId },
      update: {},
    })
    res.json({ ok: true, favorited: true })
  } catch (error) {
    next(error)
  }
})

readerRouter.delete('/favorites/:novelId', async (req: AuthedRequest, res, next) => {
  try {
    await prisma.favorite.deleteMany({ where: { userId: req.user!.id, novelId: req.params.novelId } })
    res.json({ ok: true, favorited: false })
  } catch (error) {
    next(error)
  }
})

readerRouter.post('/bookmarks', async (req: AuthedRequest, res, next) => {
  try {
    const chapterId = String(req.body?.chapterId || '')
    const note = typeof req.body?.note === 'string' ? req.body.note.slice(0, 500) : null
    const chapter = await prisma.chapter.findFirst({
      where: { id: chapterId, status: 'PUBLISHED', novel: { status: { not: 'DRAFT' } } },
      select: { id: true, novelId: true },
    })
    if (!chapter) return res.status(404).json({ error: 'این فصل در دسترس نیست.' })

    const bookmark = await prisma.bookmark.upsert({
      where: { userId_chapterId: { userId: req.user!.id, chapterId } },
      create: { userId: req.user!.id, novelId: chapter.novelId, chapterId, note },
      update: { note },
    })
    res.status(201).json({ ok: true, bookmark })
  } catch (error) {
    next(error)
  }
})

readerRouter.delete('/bookmarks/:chapterId', async (req: AuthedRequest, res, next) => {
  try {
    await prisma.bookmark.deleteMany({
      where: { userId: req.user!.id, chapterId: req.params.chapterId },
    })
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
})

interface ProgressInput {
  novelId?: string
  chapterId?: string
  percent?: number
  finished?: boolean
}

async function saveProgress(userId: string, input: ProgressInput) {
  const novelId = String(input.novelId || '')
  const chapterId = String(input.chapterId || '')
  if (!novelId || !chapterId) return null

  const chapter = await prisma.chapter.findFirst({
    where: { id: chapterId, novelId, status: 'PUBLISHED', novel: { status: { not: 'DRAFT' } } },
    select: { id: true },
  })
  if (!chapter) return null

  const percent = Math.min(100, Math.max(0, Number(input.percent) || 0))
  return prisma.readingProgress.upsert({
    where: { userId_novelId: { userId, novelId } },
    create: {
      userId,
      novelId,
      chapterId,
      percent,
      finished: Boolean(input.finished),
    },
    update: {
      chapterId,
      percent,
      finished: Boolean(input.finished),
    },
  })
}

readerRouter.put('/progress', async (req: AuthedRequest, res, next) => {
  try {
    const saved = await saveProgress(req.user!.id, req.body || {})
    if (!saved) return res.status(400).json({ error: 'پیشرفت خواندن معتبر نیست.' })
    res.json({ ok: true, progress: saved })
  } catch (error) {
    next(error)
  }
})

/** Merges guest progress kept on the device after the reader signs in. */
readerRouter.post('/progress/merge', async (req: AuthedRequest, res, next) => {
  try {
    const items: ProgressInput[] = Array.isArray(req.body?.items) ? req.body.items.slice(0, 100) : []
    let merged = 0
    for (const item of items) {
      const saved = await saveProgress(req.user!.id, item).catch(() => null)
      if (saved) merged += 1
    }
    res.json({ ok: true, merged })
  } catch (error) {
    next(error)
  }
})
