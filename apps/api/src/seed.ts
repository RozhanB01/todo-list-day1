import bcrypt from 'bcryptjs'
import { prisma } from './db.js'
import { DEMO_GENRES, DEMO_NOVELS } from './content.js'
import { cleanChapterHtml, plainText } from './html.js'
import { countWords, normalizeFa, readingMinutesFor } from './persian.js'

const DAY = 24 * 60 * 60 * 1000

async function seedGenres() {
  for (const genre of DEMO_GENRES) {
    await prisma.genre.upsert({
      where: { slug: genre.slug },
      update: {
        name: genre.name,
        icon: genre.icon,
        description: genre.description,
        position: genre.position,
      },
      create: genre,
    })
  }
}

async function bootstrapAdmin() {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD || ''
  const name = (process.env.ADMIN_NAME || 'نویسندهٔ مون‌بری').trim()

  if (!email || password.length < 8) {
    console.log('[seed] ADMIN_EMAIL/ADMIN_PASSWORD not configured — author account not bootstrapped.')
    return
  }

  const passwordHash = await bcrypt.hash(password, 11)
  await prisma.user.upsert({
    where: { email },
    update: { role: 'ADMIN', passwordHash, displayName: name },
    create: { email, passwordHash, displayName: name, role: 'ADMIN' },
  })
  console.log('[seed] author account ready:', email)
}

async function seedDemoNovels() {
  const existing = await prisma.novel.count()
  if (existing > 0) {
    console.log(`[seed] ${existing} novel(s) already present — demo content not re-seeded.`)
    return
  }

  const genres = await prisma.genre.findMany()
  const genreBySlug = new Map(genres.map((genre) => [genre.slug, genre]))
  const now = Date.now()

  for (const demo of DEMO_NOVELS) {
    const publishedAt = new Date(now - demo.publishedDaysAgo * DAY)
    const chapterData = demo.chapters.map((chapter, index) => {
      const contentHtml = cleanChapterHtml(chapter.html)
      const words = countWords(plainText(contentHtml))
      const chapterDate = new Date(publishedAt.getTime() + index * 2 * DAY)
      const isPublished = !chapter.draft && demo.status !== 'DRAFT'
      return {
        slug: chapter.slug,
        title: chapter.title,
        summary: chapter.summary ?? null,
        contentHtml,
        contentText: plainText(contentHtml),
        wordCount: words,
        readingMinutes: readingMinutesFor(words),
        number: index + 1,
        status: isPublished ? ('PUBLISHED' as const) : ('DRAFT' as const),
        publishedAt: isPublished ? (chapterDate.getTime() < now ? chapterDate : new Date()) : null,
      }
    })

    const publishedWords = chapterData
      .filter((chapter) => chapter.status === 'PUBLISHED')
      .reduce((sum, chapter) => sum + chapter.wordCount, 0)

    const novel = await prisma.novel.create({
      data: {
        slug: demo.slug,
        title: demo.title,
        subtitle: demo.subtitle ?? null,
        description: demo.description,
        contentWarning: demo.contentWarning ?? null,
        status: demo.status,
        coverPalette: demo.palette,
        coverMotif: demo.motif,
        readingMinutes: readingMinutesFor(publishedWords),
        featured: Boolean(demo.featured),
        featuredNote: demo.featuredNote ?? null,
        moods: demo.moods,
        isDemo: true,
        publishedAt: demo.status === 'DRAFT' ? null : publishedAt,
        searchText: normalizeFa(
          [demo.title, demo.subtitle, demo.description, ...demo.genreSlugs].filter(Boolean).join(' '),
        ),
        genres: {
          create: demo.genreSlugs
            .map((slug) => genreBySlug.get(slug))
            .filter(Boolean)
            .map((genre) => ({ genreId: genre!.id })),
        },
        chapters: { create: chapterData },
      },
    })
    console.log(`[seed] novel ready: ${novel.title}`)
  }
}

async function main() {
  await seedGenres()
  await bootstrapAdmin()
  await seedDemoNovels()
  const [novels, chapters, users] = await Promise.all([
    prisma.novel.count(),
    prisma.chapter.count(),
    prisma.user.count(),
  ])
  console.log(`[seed] done — ${novels} novels, ${chapters} chapters, ${users} users`)
}

main()
  .catch((error) => {
    console.error('[seed] failed', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
