import crypto from 'node:crypto'
import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import type { Role } from '@prisma/client'
import { prisma } from './db.js'

/**
 * The signing secret is provided by the environment. If it is absent (local
 * experiments only) an ephemeral random secret is used so nothing secret is
 * ever committed to the repository — sessions simply end on restart.
 */
const SESSION_SECRET =
  process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 16
    ? process.env.SESSION_SECRET
    : crypto.randomBytes(48).toString('hex')

const COOKIE_NAME = 'mb_session'
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30

export interface SessionUser {
  id: string
  email: string
  displayName: string
  role: Role
}

export interface AuthedRequest extends Request {
  user?: SessionUser
}

function readCookie(req: Request, name: string): string | undefined {
  const raw = req.headers.cookie
  if (!raw) return undefined
  for (const part of raw.split(';')) {
    const [key, ...rest] = part.trim().split('=')
    if (key === name) return decodeURIComponent(rest.join('='))
  }
  return undefined
}

export function issueSession(res: Response, user: SessionUser): void {
  const token = jwt.sign(
    { sub: user.id, role: user.role, email: user.email, name: user.displayName },
    SESSION_SECRET,
    { expiresIn: '30d' },
  )
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: MAX_AGE_MS,
  })
}

export function clearSession(res: Response): void {
  res.clearCookie(COOKIE_NAME, { path: '/', httpOnly: true, sameSite: 'lax' })
}

export async function resolveSession(req: AuthedRequest, _res: Response, next: NextFunction) {
  const token = readCookie(req, COOKIE_NAME)
  if (!token) return next()
  try {
    const payload = jwt.verify(token, SESSION_SECRET) as { sub?: string }
    if (!payload.sub) return next()
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, displayName: true, role: true },
    })
    if (user) req.user = user
  } catch {
    /* expired or invalid cookie: treat as visitor */
  }
  next()
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'برای این کار باید وارد حساب خودت بشوی.' })
  }
  next()
}

export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'برای ورود به میز نویسنده باید وارد حساب خودت بشوی.' })
  }
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'این بخش فقط در دسترس نویسندهٔ مون‌بری است.' })
  }
  next()
}

export function cookieName() {
  return COOKIE_NAME
}
