/**
 * ─────────────────────────────────────────────────────────────────────────
 *  CONTENT MODELS — Andy Lewis Music
 * ─────────────────────────────────────────────────────────────────────────
 *  Single source of truth for every CMS-editable content type.
 *
 *  - Multi-entry types (albums, videos, events, posts, gear) are file-based
 *    collections loaded with the glob loader. Each entry is a Markdown/MDX
 *    file whose frontmatter is validated by the Zod schema below.
 *  - The `about` page is a single-entry collection so its long biography can
 *    be authored as rich Markdown while structured data lives in frontmatter.
 *  - Site-wide singletons (site settings, homepage, nav, footer, social) are
 *    JSON and are validated in `src/lib/settings.ts`.
 *
 *  IMAGE CONVENTION
 *  Images are uploaded by the CMS into `src/assets/images/uploads/` and the
 *  stored value is a project-root path string, e.g.
 *      "/src/assets/images/uploads/live-red.jpg"
 *  We keep image fields as strings (not the `image()` helper) so the CMS and
 *  Astro agree on a single path format. A build-time resolver (`src/lib/
 *  images.ts`, added in the UI phase) maps these strings to optimized,
 *  responsive `<Image>` output via `import.meta.glob`. This gives us full
 *  astro:assets optimization while keeping editing friction-free.
 *  See docs/CONTENT-MODELS.md and docs/IMAGE-GUIDELINES.md.
 * ─────────────────────────────────────────────────────────────────────────
 */
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/** A CMS-managed image path, e.g. "/src/assets/images/uploads/foo.jpg". */
const imagePath = z
  .string()
  .describe('Path to an image under /src/assets/images/uploads/');

/**
 * An optional URL that tolerates the empty strings the CMS writes for blank
 * fields — `""` is coerced to `undefined` rather than failing validation.
 */
const optionalUrl = z.preprocess(
  (v) => (v === '' ? undefined : v),
  z.string().url().optional()
);

/** SEO overrides available on any routable content entry. */
const seo = z
  .object({
    title: z.string().optional().describe('Overrides the default <title>'),
    description: z.string().max(200).optional(),
    image: imagePath.optional().describe('Custom Open Graph / Twitter image'),
    noindex: z.boolean().default(false),
  })
  .default({});

/** The disciplines Andy contributes on a given release/event. */
const disciplines = z.enum([
  'drums',
  'guitar',
  'composition',
  'production',
  'mixing',
  'programming',
]);

/** Section styling shared with page settings (see src/lib/pages.ts). */
const sectionTone = z.enum(['dark', 'grey', 'light', 'white', 'accent']);
// The CMS writes `null` for blank number/image/markdown fields; coerce to
// undefined so `.optional()` accepts them instead of throwing.
const nz = (v: unknown) => (v === null ? undefined : v);
const optNumber = z.preprocess(nz, z.number().optional());
const optString = z.preprocess(nz, z.string().optional());
// Blank date fields from the CMS arrive as '' — treat those as unset.
const optDate = z.preprocess(
  (v) => (v === null || v === '' ? undefined : v),
  z.coerce.date().optional()
);
const sectionStyleShape = {
  background: sectionTone.default('dark'),
  backgroundImage: optString,
  backgroundAlt: optString,
  parallax: z.boolean().default(false),
};

/** A composable section, matching the shared library (SECTION_TYPES). */
const pageSectionObject = z.object({
  id: z.string(),
  enabled: z.boolean().default(true),
  kicker: optString,
  heading: optString,
  subheading: optString,
  limit: optNumber,
  body: optString,
  ...sectionStyleShape,
});

/* ── DISCOGRAPHY — albums, EPs & singles ──────────────────────────────── */
const albums = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/albums' }),
  schema: z.object({
    title: z.string(),
    type: z.enum(['album', 'ep', 'single']).default('single'),
    releaseDate: z.coerce.date(),
    cover: imagePath,
    coverAlt: z.string().describe('Accessible description of the cover art'),
    description: z.string().max(280),
    artist: z.string().default('Andy Lewis'),
    label: z.string().optional(),
    roles: z.array(disciplines).default([]),
    tracklist: z
      .array(
        z.object({
          title: z.string(),
          duration: z
            .string()
            .regex(/^\d{1,2}:\d{2}$/, 'Use m:ss, e.g. 4:07')
            .optional(),
        })
      )
      .default([]),
    credits: z
      .array(z.object({ role: z.string(), name: z.string() }))
      .default([]),
    links: z
      .object({
        spotify: optionalUrl,
        appleMusic: optionalUrl,
        bandcamp: optionalUrl,
        youtube: optionalUrl,
        soundcloud: optionalUrl,
      })
      .default({}),
    featured: z.boolean().default(false),
    order: z.number().default(0),
    draft: z.boolean().default(false),
    seo,
  }),
});

/* ── VIDEOS ────────────────────────────────────────────────────────────── */
const videos = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/videos' }),
  schema: z.object({
    title: z.string(),
    // Store just the 11-char YouTube ID; we render a lazy facade (no iframe until click).
    youtubeId: z.string().regex(/^[\w-]{11}$/, 'Must be an 11-character YouTube video ID'),
    category: z
      .enum(['live', 'music-video', 'session', 'playthrough', 'interview', 'lesson'])
      .default('live'),
    date: z.coerce.date(),
    description: z.string().max(280).optional(),
    // Optional custom thumbnail; falls back to YouTube's maxres thumbnail.
    thumbnail: imagePath.optional(),
    thumbnailAlt: z.string().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    seo,
  }),
});

/* ── EVENTS — upcoming shows & past archive (split by date at build) ────── */
const events = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/events' }),
  schema: z.object({
    title: z.string(),
    venue: z.string(),
    city: z.string(),
    country: z.string(),
    // Full ISO datetime with timezone offset so Event schema + display are correct.
    date: z.coerce.date(),
    doorsTime: z.string().optional().describe('Human label, e.g. "Doors 7:30pm"'),
    role: z.string().optional().describe('e.g. "Drums — supporting The Vipers"'),
    lineup: z.array(z.string()).default([]),
    ticketUrl: optionalUrl,
    price: z.string().optional(),
    soldOut: z.boolean().default(false),
    cancelled: z.boolean().default(false),
    image: imagePath.optional(),
    imageAlt: z.string().optional(),
    description: z.string().max(400).optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    seo,
  }),
});

/* ── BLOG / NEWS ───────────────────────────────────────────────────────── */
const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(200),
    publishDate: z.coerce.date(),
    updatedDate: optDate,
    author: z.string().default('Andy Lewis'),
    category: z
      .enum(['news', 'releases', 'tour', 'studio', 'gear', 'reflections'])
      .default('news'),
    tags: z.array(z.string()).default([]),
    heroImage: imagePath.optional(),
    heroImageAlt: z.string().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    seo,
  }),
});

/* ── GEAR — drums, guitars, studio ─────────────────────────────────────── */
const gear = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/gear' }),
  schema: z.object({
    name: z.string(),
    category: z.enum(['drums', 'guitars', 'amps', 'studio', 'software', 'accessories']),
    brand: z.string().optional(),
    image: imagePath.optional(),
    imageAlt: z.string().optional(),
    description: z.string().describe('Short note on the item and how Andy uses it'),
    featured: z.boolean().default(false),
    order: z.number().default(0),
    link: optionalUrl.describe('Manufacturer / product page'),
    draft: z.boolean().default(false),
  }),
});

/* ── ABOUT — single-entry page with a rich Markdown biography ───────────── */
const about = defineCollection({
  loader: glob({ pattern: 'about.{md,mdx}', base: './src/content/about' }),
  schema: z.object({
    title: z.string().default('About'),
    headline: z.string(),
    portrait: imagePath,
    portraitAlt: z.string(),
    // Structured supporting content; the biography itself is the Markdown body.
    highlights: z
      .array(z.object({ label: z.string(), value: z.string() }))
      .default([])
      .describe('Career highlight stats, e.g. { label: "Albums", value: "12" }'),
    influences: z.array(z.string()).default([]),
    experience: z
      .array(
        z.object({
          year: z.string(),
          title: z.string(),
          detail: z.string().optional(),
        })
      )
      .default([])
      .describe('Timeline of professional experience'),
    equipment: z
      .array(z.object({ label: z.string(), items: z.array(z.string()) }))
      .default([])
      .describe('Equipment highlight groups shown on the About page'),
    // Hero + composable sections, mirroring the other pages' options.
    hero: z
      .object({ kicker: z.string().optional(), hidden: z.boolean().default(false), ...sectionStyleShape })
      .default({}),
    sections: z
      .array(
        z.object({
          id: z.string(),
          enabled: z.boolean().default(true),
          kicker: optString,
          heading: optString,
          subheading: optString,
          limit: optNumber,
          body: optString,
          ...sectionStyleShape,
        })
      )
      .default([])
      .describe('Composable sections for the About page'),
    seo,
  }),
});

/* ── PAGES — every page (except home) as a create/draft/delete-able entry ── */
const pages = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    draft: z.boolean().default(false),
    hero: z.object({
      hidden: z.boolean().default(false),
      kicker: optString,
      heading: z.string(),
      intro: optString,
      ...sectionStyleShape,
    }),
    sections: z.array(pageSectionObject).default([]),
    seo,
  }),
});

/* ── MENUS — build named menus and publish one to the header or footer ──
   A menu is a list of groups; each group has an optional heading (used as a
   footer column) and a list of links (each links to a page or a custom URL).
   `location` publishes the menu: 'main' → header, 'footer' → footer. */
const menuLink = z.object({
  label: optString,
  page: optString, // a page slug (from the pages collection)
  url: optString, // or a custom URL — used when no page is chosen
});
const menuGroup = z.object({
  heading: optString,
  links: z.array(menuLink).default([]),
});
const menus = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/menus' }),
  schema: z.object({
    title: z.string(),
    location: z.enum(['none', 'main', 'footer']).default('none'),
    groups: z.array(menuGroup).default([]),
  }),
});

export const collections = { albums, videos, events, posts, gear, about, pages, menus };
