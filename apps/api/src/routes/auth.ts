import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../db.js'
import { clearSession, issueSession, type AuthedRequest } from '../auth.js'

export const authRouter = Router()

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function adminEmail(): string {
  return (process.env.ADMIN_EMAIL || '').trim().toLowerCase()
}

authRouter.post('/register', async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase()
    const password = String(req.body?.password || '')
    const displayName = String(req.body?.displayName || '').trim()

    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'ایمیل وارد‌شده معتبر نیست.' })
    if (password.length < 8) return res.status(400).json({ error: 'گذرواژه باید دست‌کم ۸ نویسه باشد.' })
    if (displayName.length < 2) return res.status(400).json({ error: 'یک نام برای خودت بنویس.' })

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return res.status(409).json({ error: 'با این ایمیل قبلاً حساب ساخته شده است.' })

    const passwordHash = await bcrypt.hash(password, 11)
    const role = adminEmail() && email === adminEmail() ? 'ADMIN' : 'READER'
    const user = await prisma.user.create({
      data: { email, passwordHash, displayName, role },
      select: { id: true, email: true, displayName: true, role: true },
    })
    issueSession(res, user)
    res.status(201).json({ user })
  } catch (error) {
    next(error)
  }
})

authRouter.post('/login', async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase()
    const password = String(req.body?.password || '')
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(401).json({ error: 'ایمیل یا گذرواژه درست نیست.' })

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return res.status(401).json({ error: 'ایمیل یا گذرواژه درست نیست.' })

    const sessionUser = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    }
    issueSession(res, sessionUser)
    res.json({ user: sessionUser })
  } catch (error) {
    next(error)
  }
})

authRouter.post('/logout', (_req, res) => {
  clearSession(res)
  res.json({ ok: true })
})

authRouter.get('/me', async (req: AuthedRequest, res) => {
  res.json({ user: req.user ?? null })
})
