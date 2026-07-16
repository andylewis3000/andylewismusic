/**
 * ─────────────────────────────────────────────────────────────────────────
 *  SITE SINGLETONS — Andy Lewis Music
 * ─────────────────────────────────────────────────────────────────────────
 *  Site-wide, single-instance content that isn't a "collection": global
 *  settings, the homepage composition, navigation, footer and social links.
 *
 *  These live as JSON under `src/content/settings/` so the CMS can edit them
 *  as friendly forms (see public/admin/config.yml → "Site settings"). Here we
 *  parse each JSON against a Zod schema so the rest of the app consumes fully
 *  typed, validated data. A malformed edit fails the build loudly — exactly
 *  what we want before anything reaches production.
 * ─────────────────────────────────────────────────────────────────────────
 */
import { z } from 'astro:content';

import siteJson from '../content/settings/site.json';
import navigationJson from '../content/settings/navigation.json';
import footerJson from '../content/settings/footer.json';
import socialJson from '../content/settings/social.json';

const imagePath = z.string();

/* ── Global site settings ──────────────────────────────────────────────── */
const siteSchema = z.object({
  name: z.string(),
  shortName: z.string(),
  tagline: z.string(),
  description: z.string().max(200),
  url: z.string().url(),
  locale: z.string().default('en_GB'),
  location: z.string(),
  email: z.string().email(),
  bookingEmail: z.string().email(),
  phone: z.string().optional(),
  defaultOgImage: imagePath,
  logo: imagePath.optional(),
  headerLogo: imagePath.optional(),
  headerLogoWidth: z.number().default(160),
  footerLogo: imagePath.optional(),
  footerLogoWidth: z.number().default(160),
  themeColor: z.string().default('#0a0a0b'),
  founder: z.object({
    name: z.string(),
    jobTitles: z.array(z.string()),
    sameAs: z.array(z.string().url()).default([]),
  }),
  analytics: z
    .object({ cloudflareToken: z.string().default('') })
    .default({ cloudflareToken: '' }),
  forms: z
    .object({
      endpoint: z.string().default('/form.php'),
      turnstileSiteKey: z.string().default(''),
    })
    .default({ endpoint: '/form.php', turnstileSiteKey: '' }),
});

/* ── Homepage composition ──────────────────────────────────────────────── */
const ctaSchema = z.object({
  label: z.string(),
  href: z.string(),
  style: z.enum(['primary', 'secondary', 'ghost']).default('primary'),
});

/* Homepage content lives in src/lib/pages.ts (with the other page settings). */

/* ── Navigation ────────────────────────────────────────────────────────── */
const navItemSchema = z.object({
  label: z.string(),
  href: z.string(),
});

const navigationSchema = z.object({
  primary: z.array(navItemSchema),
  cta: ctaSchema.optional(),
});

/* ── Footer ────────────────────────────────────────────────────────────── */
const footerSchema = z.object({
  blurb: z.string(),
  columns: z
    .array(
      z.object({
        heading: z.string(),
        links: z.array(navItemSchema),
      })
    )
    .default([]),
  legal: z.array(navItemSchema).default([]),
  copyright: z.string(),
});

/* ── Social links ──────────────────────────────────────────────────────── */
const socialSchema = z.object({
  links: z.array(
    z.object({
      platform: z.enum([
        'instagram',
        'youtube',
        'spotify',
        'appleMusic',
        'bandcamp',
        'soundcloud',
        'tiktok',
        'facebook',
        'x',
        'email',
      ]),
      label: z.string(),
      url: z.string(),
    })
  ),
});

/* ── Parse once at module load; a bad edit throws a clear build error ────── */
function parse<T extends z.ZodTypeAny>(schema: T, data: unknown, name: string): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(
      `Invalid content in settings "${name}":\n${result.error.toString()}`
    );
  }
  return result.data;
}

export const site = parse(siteSchema, siteJson, 'site');
export const navigation = parse(navigationSchema, navigationJson, 'navigation');
export const footer = parse(footerSchema, footerJson, 'footer');
export const social = parse(socialSchema, socialJson, 'social');

export type Site = z.infer<typeof siteSchema>;
export type Navigation = z.infer<typeof navigationSchema>;
export type Footer = z.infer<typeof footerSchema>;
export type Social = z.infer<typeof socialSchema>;
export type Cta = z.infer<typeof ctaSchema>;
