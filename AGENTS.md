# AGENTS.md

## What this app is

HB Lex is a **single-file static web app**: all markup, CSS and JavaScript live in
`index.html` (plus `sw.js`, `manifest.webmanifest`, `hb-lex-mark.svg`). There is no
build step, no bundler, no package manager and no backend. All user data (progress,
decks, settings, `readingHistory`, display name) is persisted in `localStorage` under
the `STORE` key; the schema is versioned and migrated by `normalizeState()`.

## Running it here

```bash
docker compose -f docker-compose.base44.yml up -d   # http://localhost:3000
```

The `web` service is `python -m http.server` with the repo bind-mounted at `/app`, so
files are read from disk on every request — edit and refresh, no rebuild or restart.
Healthcheck probes `/index.html`.

The sandbox host has no JavaScript/Python runtime. Run syntax checks in a container:

```bash
# extract the two inline <script> blocks, then syntax-check them
docker run --rm -v "$PWD/index.html:/src/index.html:ro" -v /tmp/chk:/out python:3.12-slim \
  python3 -c "import re;s=open('/src/index.html').read();[open('/out/chk%d.js'%i,'w').write(x) for i,x in enumerate(re.findall(r'<script(?![^>]*src=)[^>]*>(.*?)</script>',s,re.S))]"
docker run --rm -v /tmp/chk:/w -w /w node:22-alpine sh -c 'node --check chk0.js && node --check chk1.js'
```

## Verifying the app

The app is a view router: `window.App.go(view)` switches views (`home`, `decks`,
`stats`, `readings`, `profile`, `search`, `manualDeck`, `about`, `pdf`, plus
`deck`, `study`, `exam`, `reading` with params). A view that renders a non-empty
`#app` and produces no console errors is healthy.

## Gotchas

- `sw.js` is **cache-first** with a fixed cache name (`hb-lex-v1`). A browser that
  already registered the service worker keeps serving the cached `index.html`, so a
  new release (or a local edit) can look like it never arrived. Hard-reload or use a
  fresh profile when verifying changes.
- `index.html` is minified into very long lines; read it with `grep -n` on the
  `function`/`App` definitions rather than diffing whole lines.

## Deployment (currently failing — needs one repo setting)

Pages deployment runs from `.github/workflows/pages.yml` on every push to `main`
(`.github/workflows/roznex-ai-company-os-pages.yml` deploys the
`roznex-ai-company-os` branch and shares the same `pages` concurrency group).

**The site has never been published.** `GET /repos/RozhanB01/todo-list-day1/pages`
returns 404 (`has_pages: false`), and the `Setup Pages` step of every run fails with
`Create Pages site failed. Error: Resource not accessible by integration`
(runs 37005697265, 37006292716, 37660264048, 37660264069) — the workflow
`GITHUB_TOKEN` is not allowed to create a Pages site. Enabling it is a one-time
owner action no token here can do:

> Settings → Pages → Build and deployment → Source: **GitHub Actions**

After that the workflow builds the artifact first, checks the Pages configuration,
and deploys. Unrelated to the app code: the app itself loads and runs fine.
