/**
 * ─────────────────────────────────────────────────────────────────────────
 *  PAGE SETTINGS — Andy Lewis Music
 * ─────────────────────────────────────────────────────────────────────────
 *  Per-page CMS content: each page (home, about, and every index page) has a
 *  hero and a set of sections, and each section carries styling options
 *  (background tone, background image, parallax) that mirror the homepage.
 *
 *  Home is richer (hero CTAs, intro, Instagram, closing CTA). Other pages use
 *  the generic shape. About's editorial content lives in `about.md`; its hero +
 *  section styling live in that file's frontmatter (see content.config.ts).
 * ─────────────────────────────────────────────────────────────────────────
 */
import { z, getCollection } from 'astro:content';

import homeJson from '../content/settings/home.json';
import musicJson from '../content/pages/music.json';
import videosJson from '../content/pages/videos.json';
import eventsJson from '../content/pages/events.json';
import blogJson from '../content/pages/blog.json';
import gearJson from '../content/pages/gear.json';
import contactJson from '../content/pages/contact.json';

export const TONES = ['dark', 'grey', 'light', 'white', 'accent'] as const;
const toneSchema = z.enum(TONES);

// The CMS writes `null` for blank number/image/markdown fields — coerce to
// undefined so `.optional()` accepts them (otherwise the whole page 500s).
const nz = (v: unknown) => (v === null ? undefined : v);
const optNumber = z.preprocess(nz, z.number().optional());
const optString = z.preprocess(nz, z.string().optional());

const ctaSchema = z.object({
  label: z.string(),
  href: z.string(),
  style: z.enum(['primary', 'secondary', 'ghost']).default('primary'),
});

/** Styling fields shared by heroes and sections. */
const styleShape = {
  background: toneSchema.default('dark'),
  backgroundImage: optString,
  backgroundAlt: optString,
  parallax: z.boolean().default(false),
};

/**
 * The shared section library. Any of these blocks can be added to any page
 * from the CMS dropdown. Keep in sync with the select options in
 * public/admin/config.yml and the map in SectionRenderer.astro.
 */
export const SECTION_TYPES = [
  'featured-music',
  'discography',
  'latest-video',
  'featured-videos',
  'video-archive',
  'upcoming-events',
  'past-events',
  'news',
  'instagram',
  'gear',
  'contact-form',
  'about-bio',
  'about-highlights',
  'about-experience',
  'about-influences',
  'about-equipment',
  'rich-text',
  'cta',
] as const;

const pageSectionSchema = z.object({
  // The section type, chosen from the shared library (SECTION_TYPES).
  id: z.string(),
  enabled: z.boolean().default(true),
  heading: optString,
  subheading: optString,
  /** Max items for list blocks (featured-music, news, events…). 0 = all. */
  limit: optNumber,
  /** Body content for the rich-text block (Markdown). */
  body: optString,
  ...styleShape,
});

export const pageHeroSchema = z.object({
  kicker: z.string().optional(),
  heading: z.string(),
  intro: z.string().optional(),
  /** Hidden pages are removed from all nav menus. */
  hidden: z.boolean().default(false),
  ...styleShape,
});

const genericPageSchema = z.object({
  hero: pageHeroSchema,
  sections: z.array(pageSectionSchema).default([]),
});

const homeSchema = z.object({
  hero: z.object({
    kicker: z.string().optional(),
    heading: z.string(),
    subheading: z.string(),
    primaryCta: ctaSchema,
    secondaryCta: ctaSchema.optional(),
    ...styleShape,
    backgroundImage: z.string(),
    backgroundAlt: z.string(),
  }),
  intro: z.object({ heading: z.string(), body: z.string() }),
  sections: z.array(pageSectionSchema).default([]),
  instagram: z.object({
    handle: z.string().default(''),
    heading: z.string().default('On the road'),
    feedUrl: optString.describe('Behold.so JSON feed URL (reels). Blank = placeholder.'),
  }),
  cta: z.object({
    heading: z.string(),
    body: z.string(),
    primaryCta: ctaSchema,
    secondaryCta: ctaSchema.optional(),
  }),
});

function parse<T extends z.ZodTypeAny>(schema: T, data: unknown, name: string): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(`Invalid page settings "${name}":\n${result.error.toString()}`);
  }
  return result.data;
}

export const home = parse(homeSchema, homeJson, 'home');

export const pages = {
  music: parse(genericPageSchema, musicJson, 'music'),
  videos: parse(genericPageSchema, videosJson, 'videos'),
  events: parse(genericPageSchema, eventsJson, 'events'),
  blog: parse(genericPageSchema, blogJson, 'blog'),
  gear: parse(genericPageSchema, gearJson, 'gear'),
  contact: parse(genericPageSchema, contactJson, 'contact'),
};

export type Tone = z.infer<typeof toneSchema>;
export type PageSection = z.infer<typeof pageSectionSchema>;
export type PageHero = z.infer<typeof pageHeroSchema>;
export type Home = z.infer<typeof homeSchema>;

/* ── Hidden pages → nav filtering ───────────────────────────────────────── */
const norm = (h: string) => (h.startsWith('/') && !h.endsWith('/') ? `${h}/` : h);

const GENERIC_HREF: Record<string, string> = {
  music: '/music/',
  videos: '/videos/',
  events: '/events/',
  blog: '/blog/',
  gear: '/gear/',
  contact: '/contact/',
};

/** Hrefs of every page marked hidden (incl. drafted custom pages). */
export async function getHiddenHrefs(): Promise<Set<string>> {
  const hidden = new Set<string>();
  for (const [key, page] of Object.entries(pages)) {
    if (page.hero.hidden && GENERIC_HREF[key]) hidden.add(GENERIC_HREF[key]);
  }
  const about = await getCollection('about');
  if (about[0]?.data.hero.hidden) hidden.add('/about/');
  const custom = await getCollection('sitePages');
  for (const p of custom) if (p.data.draft) hidden.add(norm(`/${p.id}/`));
  return hidden;
}

/** True if a link points at a hidden page. */
export function linkHidden(href: string, hidden: Set<string>): boolean {
  return hidden.has(norm(href));
}

/** Drop links that point at hidden pages. */
export function filterLinks<T extends { href: string }>(links: T[], hidden: Set<string>): T[] {
  return links.filter((l) => !linkHidden(l.href, hidden));
}

/** Look up a section's config by id, with sensible defaults if absent. */
export function findSection(list: PageSection[], id: string): PageSection {
  return (
    list.find((s) => s.id === id) ?? {
      id,
      enabled: true,
      background: 'dark',
      parallax: false,
    }
  );
}
