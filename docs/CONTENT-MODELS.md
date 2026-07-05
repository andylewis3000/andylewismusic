# Content Models — Andy Lewis Music

This document is the human-readable reference for every content type on the
site. It is the contract between the **CMS** (`public/admin/config.yml`) and the
**app** (`src/content.config.ts` + `src/lib/settings.ts`). If you change a field
in one, change it in both.

## Two kinds of content

| Kind | Stored as | Where | Validated by |
|------|-----------|-------|--------------|
| **Collections** (many entries) | Markdown files | `src/content/<type>/` | `src/content.config.ts` (Zod) |
| **Singletons** (one instance) | JSON / one Markdown | `src/content/settings/`, `src/content/about/` | `src/lib/settings.ts` (Zod) |

Every value the visitor sees is editable in the CMS at `/admin/`. Bad data
(wrong type, missing required field, malformed URL) **fails the build** before it
can reach production — that's the safety net.

---

## Collections

### `albums` — Discography (albums, EPs & singles)
One file per release in `src/content/albums/`.

| Field | Type | Notes |
|-------|------|-------|
| `title` | string | required |
| `type` | `album \| ep \| single` | default `single` |
| `releaseDate` | date | required |
| `cover` | image path | required — cover art |
| `coverAlt` | string | required — accessibility |
| `description` | string ≤280 | required |
| `artist` | string | default `Andy Lewis` |
| `label` | string | optional |
| `roles` | list of disciplines | drums, guitar, composition, production, mixing, programming |
| `tracklist` | list of `{ title, duration }` | duration as `m:ss` |
| `credits` | list of `{ role, name }` | |
| `links` | object | spotify, appleMusic, bandcamp, youtube, soundcloud (all optional URLs) |
| `featured` | boolean | show on homepage |
| `order` | number | manual sort |
| `draft` | boolean | hides from build |
| `seo` | object | per-entry SEO overrides |
| _body_ | Markdown | liner notes |

Streaming links drive the **Spotify / Apple Music embeds** on the Music page.

### `videos`
| Field | Type | Notes |
|-------|------|-------|
| `title` | string | required |
| `youtubeId` | string (11 chars) | just the ID, not the URL — we render a lazy click-to-load facade |
| `category` | enum | live, music-video, session, playthrough, interview, lesson |
| `date` | date | required |
| `description` | string ≤280 | optional |
| `thumbnail` | image | optional — falls back to YouTube's thumbnail |
| `featured` | boolean | homepage "latest video" |
| `draft` | boolean | |

### `events`
| Field | Type | Notes |
|-------|------|-------|
| `title`, `venue`, `city`, `country` | string | required |
| `date` | datetime (with TZ) | drives upcoming/past split **and** Event schema |
| `doorsTime`, `role`, `price` | string | optional |
| `lineup` | list of string | optional |
| `ticketUrl` | URL | optional |
| `soldOut`, `cancelled` | boolean | |
| `image` / `imageAlt` | image | optional |
| `featured`, `draft` | boolean | |
| _body_ | Markdown | optional extra detail |

Upcoming vs. past is derived from `date` at build time — no manual archiving.

### `posts` — News / Blog
| Field | Type | Notes |
|-------|------|-------|
| `title` | string | required |
| `description` | string ≤200 | SEO + cards |
| `publishDate` | date | required |
| `updatedDate` | date | optional |
| `author` | string | default `Andy Lewis` |
| `category` | enum | news, releases, tour, studio, gear, reflections |
| `tags` | list of string | powers tag pages |
| `heroImage` / `heroImageAlt` | image | optional |
| `featured`, `draft` | boolean | |
| _body_ | Markdown / MDX | article content |

### `gear`
| Field | Type | Notes |
|-------|------|-------|
| `name` | string | required |
| `category` | enum | drums, guitars, amps, studio, software, accessories |
| `brand` | string | optional |
| `image` / `imageAlt` | image | optional |
| `description` | string | required |
| `featured` | boolean | |
| `order` | number | manual sort |
| `link` | URL | optional product page |
| `draft` | boolean | |

---

## Singletons

- **`about`** (`src/content/about/about.md`) — headline, portrait, career
  highlights, influences, experience timeline, equipment groups, plus the
  Markdown biography as the body.
- **`site`** (`settings/site.json`) — global identity, contact/booking emails,
  default OG image, theme colour, founder info (feeds Musician schema),
  analytics token, form config.
- **`home`** (`settings/home.json`) — hero, intro, an ordered/toggleable list of
  homepage sections, Instagram handle, and the closing CTA.
- **`navigation`** (`settings/navigation.json`) — primary menu + header button.
- **`footer`** (`settings/footer.json`) — blurb, link columns, legal links,
  copyright.
- **`social`** (`settings/social.json`) — ordered social/streaming links used in
  the header, footer, and `sameAs` structured data.

---

## Pages & the composable section library

Pages are composed from a shared library of **section blocks**, so any block can
appear on any page. This is driven by three things:

- **Page settings** (`src/lib/pages.ts` + `src/content/pages/*.json`, `home.json`,
  `about.md`) — each page has a `hero` and a `sections[]` list.
- **`SECTION_TYPES`** (`src/lib/pages.ts`) — the canonical list of block ids.
  Keep it in sync with the CMS dropdown (`public/admin/config.yml`) and the map
  in `src/components/sections/SectionRenderer.astro`.
- **`SectionRenderer`** — maps a section's `id` to its block component.

Each section carries: `id` (block type), `enabled`, optional `heading` /
`subheading`, `limit` (0 = all), `body` (for `rich-text`), plus styling —
`background` tone (`dark | grey | light | white | accent`), `backgroundImage`,
`backgroundAlt`, `parallax`.

**Adding a new block type:** create the component in `components/sections/`, add
its id to `SECTION_TYPES`, register it in `SectionRenderer`, and add it to the
`options:` list of `&section_fields` in the CMS config.

### Page settings files

| Page | Source | Notes |
|------|--------|-------|
| Home | `settings/home.json` | hero (+CTAs), intro, ordered sections, Instagram (handle/heading/**Behold feedUrl**), closing CTA |
| About | `about/about.md` | structured data (bio/highlights/…) + hero + sections |
| Music/Videos/Events/News/Gear/Contact | `pages/<name>.json` | hero + sections |

Every page except Home has a **`hero.hidden`** flag. When true, the page is
removed from all nav menus, `noindex`ed, and excluded from the sitemap.

### Custom pages

Editor-created pages live in `src/content/site-pages/*.json` (collection
`sitePages`) and are rendered by `src/pages/[...slug].astro` at `/<slug>/`. Each
has `title`, `draft`, a `hero`, `sections[]`, and `seo`. Draft pages are excluded
from the production build (and their nav links removed).

---

## Image convention

CMS images upload to `src/assets/images/uploads/` and are stored in content as a
path like `/src/assets/images/uploads/live-red.jpg`. At build time a resolver
(`src/lib/images.ts`, added in the UI phase) maps that string to Astro's
optimized `<Image>` (AVIF/WebP, responsive `srcset`, lazy loading, blur-up).

We deliberately store image **paths as strings** (rather than Astro's `image()`
schema helper) so the CMS and the app agree on exactly one path format —
eliminating the usual Decap/Sveltia ↔ astro:assets path friction. See
`docs/IMAGE-GUIDELINES.md`.
