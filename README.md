# Andy Lewis Music

The official website of Andy Lewis — drummer, guitarist & composer.
A fast, static, CMS-driven site built with **Astro** and **Sveltia CMS**,
deployed to Hostinger shared hosting.

- **Live:** https://andylewismusic.com
- **Content editor:** https://andylewismusic.com/admin/

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | [Astro 5](https://astro.build) (static output) |
| Language | TypeScript (strict) |
| Content | Astro Content Collections + Zod (type-safe) |
| CMS | [Sveltia CMS](https://github.com/sveltia/sveltia-cms) (git-based, free) |
| Styling | Tailwind v4 tokens + a dark, cinematic design system |
| Search | [Pagefind](https://pagefind.app) (static, build-time index) |
| Forms | PHP handler on Hostinger (`public/form.php`) + optional Cloudflare Turnstile |
| Images | `astro:assets` (AVIF/WebP, responsive) |

Everything is pre-rendered to static HTML — no server or database to run.
Content lives as Markdown/JSON files in the repo.

---

## Prerequisites

- **Node 22** (pinned in `.nvmrc`). With nvm: `nvm use`.
  > Older Node (≤20.11) will fail to build — the toolchain needs 20.19+/22+.

## Local development

```bash
nvm use            # Node 22
npm install
npm run dev        # http://localhost:4321
```

Editing content locally (Chrome/Edge): open
`http://localhost:4321/admin/index.html` → **Work with Local Repository** →
pick this folder. See [`docs/CMS.md`](docs/CMS.md).

## Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Type-check, build to `dist/`, then build the Pagefind index |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run check` | `astro check` (types + content validation) |
| `npm run format` | Prettier |

## Project structure

```
public/            # static assets served as-is
  admin/           # Sveltia CMS (config.yml)
  form.php         # contact/booking handler (Hostinger)
  .htaccess        # caching, compression, security headers, HTTPS
  fonts/           # self-hosted variable fonts
src/
  components/      # UI, cards, embeds, layout, sections (block library)
  content/         # albums, videos, events, posts, gear, about, settings, pages
  content.config.ts# content schemas (Zod)
  layouts/         # BaseLayout
  lib/             # settings, pages, content, seo, images, blocks helpers
  pages/           # routes
  styles/global.css# design tokens + system
docs/              # content models, CMS, SEO, deployment, images, testing
```

## Content model & pages

Content types and the composable "section library" (any block on any page) are
documented in [`docs/CONTENT-MODELS.md`](docs/CONTENT-MODELS.md) and editable
from the CMS. Home, About, Music, Videos, Events, Gear and Contact are composed
from sections; the blog is a paginated listing.

## Documentation

- [`docs/CMS.md`](docs/CMS.md) — editing guide
- [`docs/CONTENT-MODELS.md`](docs/CONTENT-MODELS.md) — content types
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — how to publish
- [`docs/IMAGE-GUIDELINES.md`](docs/IMAGE-GUIDELINES.md) — image sizes & tips
- [`docs/SEO.md`](docs/SEO.md) — SEO reference
- [`docs/TESTING.md`](docs/TESTING.md) — Lighthouse/axe results & how to re-run

## Quality bar

Lighthouse **100** on Performance / Accessibility / Best Practices / SEO, and
**0 axe violations** (WCAG 2.2 AA) across all page types — see `docs/TESTING.md`.
