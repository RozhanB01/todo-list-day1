# Moonberry — agent notes

Non-obvious things about this repo. Read `README.md` first for the product overview.

## Runtime topology

- Single public origin: **host port 3000 → `web` (Vite dev server, 5173)**.
  Vite proxies `/api`, `/uploads`, `/sitemap.xml`, `/robots.txt` to `api:4000`.
  Do not expose the API on a second public port; cookies are same-origin by design.
- `db` = postgres:16 with a named volume. `seed` is a one-shot service that runs after
  `api` is healthy. `api` runs `prisma generate` + `prisma db push` on every boot.
- The browser bundle is built from `apps/web`; the legacy root `index.html` / `sw.js` /
  `manifest.webmanifest` belong to an older static site and are not served by Vite.

## Gotchas

- **Prisma client staleness:** `tsx watch` does not watch `node_modules`. After editing
  `apps/api/prisma/schema.prisma`, run `docker compose -f docker-compose.base44.yml restart api`
  (it regenerates the client before starting). Otherwise `prisma.<newModel>` is `undefined`
  at runtime and routes 500 even though types are fine after `npx prisma generate`.
- **Seed idempotency:** demo content is created only when `novels` is empty. Deleting one
  novel does not re-create it; deleting all of them and restarting `seed` does.
- **Admin bootstrap:** `ADMIN_EMAIL` / `ADMIN_PASSWORD` arrive through `/run/base44/app.env`.
  `seed` upserts that account with role `ADMIN`. The login field is a text input because an
  admin identifier may not be an email address; registration still requires a valid email.
  Any registration whose email equals `ADMIN_EMAIL` also receives the ADMIN role.
- **Public visibility:** a published novel with zero published chapters is still hidden
  (`listPublishedNovels` filters `chapterCount > 0`). Draft novels and draft chapters 404.
- **Rich text is sanitized server-side** (`apps/api/src/html.ts`) with a small allowlist;
  no styles/scripts/embeds. Do not bypass it when adding fields.
- **Uploads** go to the `moonberry-uploads` volume (`/data/uploads`) and are served from
  `/uploads/...` by the API. JPEG/PNG/WEBP/GIF only, 5 MB cap, random file names.
- **Search** uses a precomputed `novels.searchText` normalized by `normalizeFa()`
  (Arabic ي/ك/ة, ZWNJ, Persian digits). Recompute it on save via `recomputeSearch`.
- **Vite host allowlist:** `apps/web/vite.config.ts` adds a wildcard for
  `BASE44_SANDBOX_HOST_DOMAIN`; the sandbox id rotates, so never hardcode the host.
- **Sitemap/robots** proxy with `changeOrigin: false` so the API sees the public `Host`
  and emits absolute URLs for the preview domain.
- **Guest progress** lives in `localStorage` (`moonberry.guest.progress`) and merges into the
  database on login/registration (`POST /api/me/progress/merge`).
- No Base44 SDK or entities exist here. Auth is our own JWT-in-httpOnly-cookie.

## Checks

```bash
docker compose -f docker-compose.base44.yml exec -T api npx tsc --noEmit
docker compose -f docker-compose.base44.yml exec -T web npx tsc --noEmit
docker compose -f docker-compose.base44.yml exec -T web npm run build
curl -s http://localhost:3000/api/health
curl -s http://localhost:3000/api/novels
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/api/novels/<draft-slug>   # 404
```

Admin flows can be exercised with the configured `ADMIN_EMAIL`/`ADMIN_PASSWORD`
(never print secrets; check presence only with `printenv KEY >/dev/null`).
