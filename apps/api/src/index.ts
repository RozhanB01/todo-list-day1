import express from 'express'
import cookieParser from 'cookie-parser'
import fs from 'node:fs'
import path from 'node:path'
import { prisma } from './db.js'
import { resolveSession } from './auth.js'
import { publicRouter } from './routes/public.js'
import { authRouter } from './routes/auth.js'
import { readerRouter } from './routes/reader.js'
import { adminRouter } from './routes/admin.js'

const app = express()
const PORT = Number(process.env.PORT) || 4000
const UPLOAD_DIR = process.env.UPLOAD_DIR || '/data/uploads'
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

app.set('trust proxy', 1)
app.disable('x-powered-by')
app.use(express.json({ limit: '3mb' }))
app.use(cookieParser())
app.use(resolveSession)

app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ ok: true })
  } catch {
    res.status(503).json({ ok: false })
  }
})

app.use(
  '/uploads',
  express.static(UPLOAD_DIR, {
    maxAge: '30d',
    immutable: true,
    index: false,
    setHeaders: (res) => {
      res.setHeader('X-Content-Type-Options', 'nosniff')
    },
  }),
)

app.use('/api/auth', authRouter)
app.use('/api/me', readerRouter)
app.use('/api/admin', adminRouter)
app.use('/api', publicRouter)

function siteBase(req: express.Request): string {
  const configured = process.env.PUBLIC_SITE_URL
  if (configured) return configured.replace(/\/$/, '')
  const proto = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0]
  return `${proto}://${req.headers.host}`
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

app.get('/robots.txt', (_req, res) => {
  const base = siteBase(_req)
  res.type('text/plain').send(
    ['User-agent: *', 'Allow: /', 'Disallow: /admin', 'Disallow: /library', 'Disallow: /api/', `Sitemap: ${base}/sitemap.xml`, ''].join(
      '\n',
    ),
  )
})

app.get('/sitemap.xml', async (req, res, next) => {
  try {
    const base = siteBase(req)
    const novels = await prisma.novel.findMany({
      where: { status: { not: 'DRAFT' } },
      select: {
        slug: true,
        updatedAt: true,
        chapters: {
          where: { status: 'PUBLISHED' },
          select: { slug: true, updatedAt: true, novelId: true },
        },
      },
    })

    const entries: Array<{ loc: string; lastmod: string; priority: string }> = [
      { loc: '/', lastmod: new Date().toISOString(), priority: '1.0' },
      { loc: '/novels', lastmod: new Date().toISOString(), priority: '0.9' },
      { loc: '/about', lastmod: new Date().toISOString(), priority: '0.6' },
      { loc: '/contact', lastmod: new Date().toISOString(), priority: '0.4' },
      { loc: '/privacy', lastmod: new Date().toISOString(), priority: '0.3' },
    ]

    for (const novel of novels) {
      if (!novel.chapters.length) continue
      entries.push({
        loc: `/novels/${encodeURIComponent(novel.slug)}`,
        lastmod: novel.updatedAt.toISOString(),
        priority: '0.8',
      })
      for (const chapter of novel.chapters) {
        entries.push({
          loc: `/read/${encodeURIComponent(novel.slug)}/${encodeURIComponent(chapter.slug)}`,
          lastmod: chapter.updatedAt.toISOString(),
          priority: '0.7',
        })
      }
    }

    const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) =>
      `  <url><loc>${xmlEscape(base + entry.loc)}</loc><lastmod>${entry.lastmod}</lastmod><priority>${entry.priority}</priority></url>`,
  )
  .join('\n')}
</urlset>`
    res.type('application/xml').send(body)
  } catch (error) {
    next(error)
  }
})

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'این نشانی وجود ندارد.' })
})

app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[moonberry-api]', error?.message || error)
  if (res.headersSent) return
  const message =
    error?.message === 'فقط تصویر JPG، PNG، WEBP یا GIF پذیرفته می‌شود.'
      ? error.message
      : 'چیزی در سرور مون‌بری اشتباه شد. کمی بعد دوباره تلاش کن.'
  res.status(error?.statusCode || 500).json({ error: message })
})

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[moonberry-api] listening on :${PORT}`)
})

async function shutdown() {
  server.close()
  await prisma.$disconnect()
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
