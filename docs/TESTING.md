# Testing & audits

## Results (production build, served locally)

Audited with **Lighthouse** (mobile) and **axe-core** (WCAG 2.0/2.1/2.2 A + AA)
against the real production build via the system Chrome.

### Lighthouse — all 100

| Page | Perf | A11y | Best Practices | SEO |
|------|:----:|:----:|:--------------:|:---:|
| Home | 100 | 100 | 100 | 100 |
| About | 100 | 100 | 100 | 100 |
| Music detail | 100 | 100 | 100 | 100 |
| Videos | 100 | 100 | 100 | 100 |
| Events | 100 | 100 | 100 | 100 |
| Blog list | 100 | 100 | 100 | 100 |
| Blog article | 100 | 100 | 100 | 100 |
| Contact | 100 | 100 | 100 | 100 |

### axe-core — 0 violations

All ten audited routes pass with zero violations across WCAG 2.0/2.1/2.2 A and AA
plus best-practice rules.

### Issues found and fixed during this pass

1. **Pagefind search input had no accessible name** (only a placeholder) →
   added `aria-label` after init.
2. **Streaming embeds set third-party cookies** on load, dropping the music
   page's Best Practices to 77 → converted Spotify + Apple Music to
   click-to-load facades (no third-party iframe/cookies until the user opts in).
3. **Pagefind CSS was render-blocking** on the blog (−1 Perf) → loaded async
   with a `<noscript>` fallback; deferred its script.

> Note: Lighthouse's "efficient cache lifetimes" audit flags the local preview
> server because `astro preview` doesn't send `Cache-Control` headers. Those are
> set by `public/.htaccess` (1-year immutable for fingerprinted assets) in
> production, so this passes on the live site.

## Reproducing the audits

The audit scripts live in `scripts/` and use the system Chrome (macOS path).
They rely on dev-only tools not shipped in `package.json`:

```bash
# 1. Build and serve the production output
npm run build              # includes Pagefind index
npx astro preview --port 4321

# 2. In another terminal, install the audit tools and run
npm i -D --no-save lighthouse puppeteer-core axe-core
node scripts/audit-a11y.mjs        # axe-core across key routes
node scripts/audit-lh.mjs          # Lighthouse category scores
node scripts/audit-lh-detail.mjs http://localhost:4321/<route>/   # per-audit detail
```

## Also verified

- `astro check` — 0 errors / 0 warnings across the app.
- Build — 23 pages, static output.
- Heading hierarchy, alt text, iframe titles, `lang`, landmarks — audited across
  all pages via `dist`-scanning scripts (see Phase 9).
