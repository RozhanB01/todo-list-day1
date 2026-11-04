import { Router } from 'express'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import multer from 'multer'
import { prisma } from '../db.js'
import { requireAdmin } from '../auth.js'
import { cleanChapterHtml, plainText } from '../html.js'
import { countWords, normalizeFa, readingMinutesFor, slugify } from '../persian.js'

export const adminRouter = Router()
adminRouter.use(requireAdmin)

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/data/uploads'
const COVER_DIR = path.join(UPLOAD_DIR, 'covers')
fs.mkdirSync(COVER_DIR, { recursive: true })

const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
}

const upload = multer({
  storage: multer.diskStorage({
    destination: COVER_DIR,
    filename: (_req, file, cb) => {
      const ext = ALLOWED_IMAGE_TYPES[file.mimetype] || '.jpg'
      cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`)
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_IMAGE_TYPES[file.mimetype]) {
      return cb(new Error('فقط تصویر JPG، PNG، WEBP یا GIF پذیرفته می‌شود.'))
    }
    cb(null, true)
  },
})

adminRouter.post('/upload', upload.single('cover'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'فایلی انتخاب نشده است.' })
  res.status(201).json({ url: `/uploads/covers/${req.file.filename}` })
})

const NOVEL_MOODS = ['mysterious', 'tender', 'fantasy', 'dark', 'cozy', 'adventure']
const PALETTES = ['plum', 'navy', 'rose', 'forest', 'gold', 'lavender']
const MOTIFS = ['moon', 'castle', 'rose', 'forest', 'lantern', 'cat', 'key', 'dragon']

async function uniqueNovelSlug(base: string, excludeId?: string): Promise<string> {
  const root = slugify(base) || `novel-${crypto.randomBytes(3).toString('hex')}`
  let slug = root
  let index = 1
  for (;;) {
    const existing = await prisma.novel.findUnique({ where: { slug }, select: { id: true } })
    if (!existing || existing.id === excludeId) return slug
    index += 1
    slug = `${root}-${index}`
  }
}

async function uniqueChapterSlug(novelId: string, base: string, excludeId?: string): Promise<string> {
  const root = slugify(base) || `chapter-${crypto.randomBytes(3).toString('hex')}`
  let slug = root
  let index = 1
  for (;;) {
    const existing = await prisma.chapter.findFirst({
      where: { novelId, slug },
      select: { id: true },
    })
    if (!existing || existing.id === excludeId) return slug
    index += 1
    slug = `${root}-${index}`
  }
}

async function setGenres(novelId: string, genreSlugs: string[]) {
  const cleaned = Array.from(new Set(genreSlugs.filter(Boolean)))
  const genres = cleaned.length
    ? await prisma.genre.findMany({ where: { slug: { in: cleaned } }, select: { id: true } })
    : []
  await prisma.novelGenre.deleteMany({ where: { novelId } })
  if (genres.length) {
    await prisma.novelGenre.createMany({
      data: genres.map((genre) => ({ novelId, genreId: genre.id })),
      skipDuplicates: true,
    })
  }
}

async function recomputeSearch(novelId: string) {
  const novel = await prisma.novel.findUnique({
    where: { id: novelId },
    include: { genres: { include: { genre: true } } },
  })
  if (!novel) return
  const text = normalizeFa(
    [
      novel.title,
      novel.subtitle,
      novel.description,
      ...novel.genres.map((entry) => entry.genre.name),
      ...novel.moods,
    ]
      .filter(Boolean)
      .join(' '),
  )
  await prisma.novel.update({ where: { id: novelId }, data: { searchText: text } })
}

adminRouter.get('/genres', async (_req, res, next) => {
  try {
    const genres = await prisma.genre.findMany({ orderBy: { position: 'asc' } })
    res.json({ genres, moods: NOVEL_MOODS, palettes: PALETTES, motifs: MOTIFS })
  } catch (error) {
    next(error)
  }
})

adminRouter.get('/overview', async (_req, res, next) => {
  try {
    const [novels, chapters, readers, favorites, views, recentViews] = await Promise.all([
      prisma.novel.findMany({
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          _count: { select: { views: true, favorites: true, chapters: true } },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.chapter.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.user.count({ where: { role: 'READER' } }),
      prisma.favorite.count(),
      prisma.novelView.count(),
      prisma.novelView.findMany({
        where: { createdAt: { gte: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000) } },
        select: { createdAt: true },
      }),
    ])

    const days: Array<{ date: string; count: number }> = []
    for (let i = 13; i >= 0; i -= 1) {
      const day = new Date()
      day.setHours(0, 0, 0, 0)
      day.setDate(day.getDate() - i)
      const next = new Date(day)
      next.setDate(next.getDate() + 1)
      days.push({
        date: day.toISOString().slice(0, 10),
        count: recentViews.filter((view) => view.createdAt >= day && view.createdAt < next).length,
      })
    }

    res.json({
      totals: {
        novels: novels.length,
        publishedNovels: novels.filter((novel) => novel.status !== 'DRAFT').length,
        chapters: chapters.reduce((sum, row) => sum + row._count._all, 0),
        publishedChapters: chapters.find((row) => row.status === 'PUBLISHED')?._count._all ?? 0,
        readers,
        favorites,
        views,
      },
      novels: novels.map((novel) => ({
        id: novel.id,
        title: novel.title,
        slug: novel.slug,
        status: novel.status,
        chapters: novel._count.chapters,
        views: novel._count.views,
        favorites: novel._count.favorites,
      })),
      viewsByDay: days,
    })
  } catch (error) {
    next(error)
  }
})

adminRouter.get('/novels', async (_req, res, next) => {
  try {
    const novels = await prisma.novel.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        genres: { include: { genre: { select: { slug: true, name: true } } } },
        chapters: { select: { id: true, status: true } },
        _count: { select: { views: true, favorites: true } },
      },
    })
    res.json({
      novels: novels.map((novel) => ({
        id: novel.id,
        slug: novel.slug,
        title: novel.title,
        subtitle: novel.subtitle,
        status: novel.status,
        coverImageUrl: novel.coverImageUrl,
        coverPalette: novel.coverPalette,
        coverMotif: novel.coverMotif,
        isDemo: novel.isDemo,
        featured: novel.featured,
        updatedAt: novel.updatedAt,
        publishedAt: novel.publishedAt,
        moods: novel.moods,
        genres: novel.genres.map((entry) => entry.genre),
        chapterCount: novel.chapters.length,
        draftCount: novel.chapters.filter((chapter) => chapter.status === 'DRAFT').length,
        views: novel._count.views,
        favorites: novel._count.favorites,
      })),
    })
  } catch (error) {
    next(error)
  }
})

adminRouter.post('/novels', async (req, res, next) => {
  try {
    const title = String(req.body?.title || '').trim()
    if (title.length < 2) return res.status(400).json({ error: 'عنوان رمان را بنویس.' })

    const slug = await uniqueNovelSlug(String(req.body?.slug || title))
    const status = ['DRAFT', 'ONGOING', 'COMPLETED'].includes(req.body?.status)
      ? req.body.status
      : 'DRAFT'
    const novel = await prisma.novel.create({
      data: {
        title,
        slug,
        subtitle: req.body?.subtitle ? String(req.body.subtitle) : null,
        description: String(req.body?.description || ''),
        contentWarning: req.body?.contentWarning ? String(req.body.contentWarning) : null,
        status,
        coverPalette: PALETTES.includes(req.body?.coverPalette) ? req.body.coverPalette : 'plum',
        coverMotif: MOTIFS.includes(req.body?.coverMotif) ? req.body.coverMotif : 'moon',
        coverImageUrl: req.body?.coverImageUrl ? String(req.body.coverImageUrl) : null,
        moods: Array.isArray(req.body?.moods)
          ? req.body.moods.filter((mood: string) => NOVEL_MOODS.includes(mood))
          : [],
        featured: Boolean(req.body?.featured),
        featuredNote: req.body?.featuredNote ? String(req.body.featuredNote) : null,
        seoTitle: req.body?.seoTitle ? String(req.body.seoTitle) : null,
        seoDescription: req.body?.seoDescription ? String(req.body.seoDescription) : null,
        publishedAt: status !== 'DRAFT' ? new Date() : null,
        isDemo: false,
      },
    })

    if (Array.isArray(req.body?.genreSlugs)) await setGenres(novel.id, req.body.genreSlugs)
    await recomputeSearch(novel.id)
    res.status(201).json({ novel })
  } catch (error) {
    next(error)
  }
})

adminRouter.get('/novels/:id', async (req, res, next) => {
  try {
    const novel = await prisma.novel.findUnique({
      where: { id: req.params.id },
      include: {
        genres: { include: { genre: { select: { slug: true } } } },
        chapters: { orderBy: { number: 'asc' } },
        _count: { select: { views: true, favorites: true } },
      },
    })
    if (!novel) return res.status(404).json({ error: 'رمان پیدا نشد.' })
    res.json({
      novel: {
        ...novel,
        genreSlugs: novel.genres.map((entry) => entry.genre.slug),
        views: novel._count.views,
        favorites: novel._count.favorites,
      },
    })
  } catch (error) {
    next(error)
  }
})

adminRouter.patch('/novels/:id', async (req, res, next) => {
  try {
    const existing = await prisma.novel.findUnique({ where: { id: req.params.id } })
    if (!existing) return res.status(404).json({ error: 'رمان پیدا نشد.' })

    const data: Record<string, unknown> = {}
    const body = req.body || {}

    if (typeof body.title === 'string' && body.title.trim().length >= 2) data.title = body.title.trim()
    if (typeof body.subtitle === 'string') data.subtitle = body.subtitle.trim() || null
    if (typeof body.description === 'string') data.description = body.description
    if (typeof body.contentWarning === 'string') data.contentWarning = body.contentWarning.trim() || null
    if (['DRAFT', 'ONGOING', 'COMPLETED'].includes(body.status)) data.status = body.status
    if (PALETTES.includes(body.coverPalette)) data.coverPalette = body.coverPalette
    if (MOTIFS.includes(body.coverMotif)) data.coverMotif = body.coverMotif
    if (typeof body.coverImageUrl === 'string') data.coverImageUrl = body.coverImageUrl || null
    if (typeof body.featured === 'boolean') data.featured = body.featured
    if (typeof body.featuredNote === 'string') data.featuredNote = body.featuredNote || null
    if (Array.isArray(body.moods)) {
      data.moods = body.moods.filter((mood: string) => NOVEL_MOODS.includes(mood))
    }
    if (typeof body.seoTitle === 'string') data.seoTitle = body.seoTitle || null
    if (typeof body.seoDescription === 'string') data.seoDescription = body.seoDescription || null
    if (typeof body.slug === 'string' && body.slug.trim()) {
      data.slug = await uniqueNovelSlug(body.slug, existing.id)
    }
    if (body.status && body.status !== 'DRAFT' && !existing.publishedAt) {
      data.publishedAt = new Date()
    }

    const novel = await prisma.novel.update({ where: { id: existing.id }, data })
    if (Array.isArray(body.genreSlugs)) await setGenres(novel.id, body.genreSlugs)
    await recomputeSearch(novel.id)
    res.json({ novel })
  } catch (error) {
    next(error)
  }
})

adminRouter.delete('/novels/:id', async (req, res, next) => {
  try {
    await prisma.novel.delete({ where: { id: req.params.id } })
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
})

adminRouter.post('/novels/:id/chapters', async (req, res, next) => {
  try {
    const novel = await prisma.novel.findUnique({ where: { id: req.params.id } })
    if (!novel) return res.status(404).json({ error: 'رمان پیدا نشد.' })

    const title = String(req.body?.title || '').trim() || 'فصل تازه'
    const last = await prisma.chapter.findFirst({
      where: { novelId: novel.id },
      orderBy: { number: 'desc' },
      select: { number: true },
    })
    const number = Number(req.body?.number) || (last?.number ?? 0) + 1
    const slug = await uniqueChapterSlug(novel.id, String(req.body?.slug || title))
    const contentHtml = cleanChapterHtml(String(req.body?.contentHtml || ''))
    const contentText = plainText(contentHtml)
    const words = countWords(contentText)
    const status = req.body?.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT'

    const chapter = await prisma.chapter.create({
      data: {
        novelId: novel.id,
        title,
        slug,
        number,
        summary: req.body?.summary ? String(req.body.summary) : null,
        contentHtml,
        contentText,
        wordCount: words,
        readingMinutes: readingMinutesFor(words),
        status,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
      },
    })
    await prisma.novel.update({ where: { id: novel.id }, data: { updatedAt: new Date() } })
    res.status(201).json({ chapter })
  } catch (error) {
    next(error)
  }
})

adminRouter.patch('/chapters/:id', async (req, res, next) => {
  try {
    const existing = await prisma.chapter.findUnique({ where: { id: req.params.id } })
    if (!existing) return res.status(404).json({ error: 'فصل پیدا نشد.' })

    const body = req.body || {}
    const data: Record<string, unknown> = {}

    if (typeof body.title === 'string' && body.title.trim()) data.title = body.title.trim()
    if (typeof body.summary === 'string') data.summary = body.summary.trim() || null
    if (typeof body.number === 'number' && Number.isFinite(body.number)) data.number = Math.max(1, Math.round(body.number))
    if (typeof body.contentHtml === 'string') {
      const contentHtml = cleanChapterHtml(body.contentHtml)
      const contentText = plainText(contentHtml)
      const words = countWords(contentText)
      data.contentHtml = contentHtml
      data.contentText = contentText
      data.wordCount = words
      data.readingMinutes = readingMinutesFor(words)
    }
    if (typeof body.slug === 'string' && body.slug.trim()) {
      data.slug = await uniqueChapterSlug(existing.novelId, body.slug, existing.id)
    }
    if (body.status === 'PUBLISHED' || body.status === 'DRAFT') {
      data.status = body.status
      if (body.status === 'PUBLISHED' && !existing.publishedAt) data.publishedAt = new Date()
    }
    if (typeof body.publishedAt === 'string' && body.publishedAt) {
      const parsed = new Date(body.publishedAt)
      if (!Number.isNaN(parsed.getTime())) data.publishedAt = parsed
    }
    if (body.publishedAt === null) data.publishedAt = null

    const chapter = await prisma.chapter.update({ where: { id: existing.id }, data })
    await prisma.novel.update({ where: { id: chapter.novelId }, data: { updatedAt: new Date() } })
    res.json({ chapter })
  } catch (error) {
    next(error)
  }
})

adminRouter.delete('/chapters/:id', async (req, res, next) => {
  try {
    const chapter = await prisma.chapter.delete({ where: { id: req.params.id } })
    await prisma.novel.update({ where: { id: chapter.novelId }, data: { updatedAt: new Date() } })
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
})

adminRouter.post('/novels/:id/chapters/reorder', async (req, res, next) => {
  try {
    const ids: string[] = Array.isArray(req.body?.ids) ? req.body.ids : []
    const chapters = await prisma.chapter.findMany({
      where: { novelId: req.params.id },
      select: { id: true },
    })
    const owned = new Set(chapters.map((chapter) => chapter.id))
    if (!ids.length || ids.length !== chapters.length || !ids.every((id) => owned.has(id))) {
      return res.status(400).json({ error: 'ترتیب فصل‌ها معتبر نیست.' })
    }
    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.chapter.update({ where: { id }, data: { number: index + 1 } }),
      ),
    )
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
})
