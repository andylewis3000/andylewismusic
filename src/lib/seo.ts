/**
 * ─────────────────────────────────────────────────────────────────────────
 *  SEO helpers — absolute URLs, image resolution, and schema.org JSON-LD.
 * ─────────────────────────────────────────────────────────────────────────
 *  Builders return plain schema.org "nodes" (no @context). BaseLayout collects
 *  them into a single `@graph` document per page, which is the cleanest way to
 *  express cross-references (e.g. an Article authored by the site Person).
 * ─────────────────────────────────────────────────────────────────────────
 */
import { getImage } from 'astro:assets';
import { resolveImage } from './images';
import { site, social } from './settings';
import type { Album, Event, Post } from './content';

type Node = Record<string, unknown>;

/** Absolute URL for a site-relative path. */
export function abs(path: string): string {
  return new URL(path, site.url).href;
}

/** Resolve a CMS image path (or public path) to an absolute, optimized URL. */
export async function resolveImageUrl(path?: string): Promise<string | undefined> {
  const candidate = path ?? site.defaultOgImage;
  const meta = resolveImage(candidate);
  if (meta) {
    const optimized = await getImage({ src: meta, width: 1200, format: 'jpg' });
    return new URL(optimized.src, site.url).href;
  }
  if (candidate.startsWith('/') && !candidate.startsWith('/src')) {
    return new URL(candidate, site.url).href;
  }
  return undefined;
}

// Social profile URLs for `sameAs` (exclude mailto).
const sameAs = [
  ...new Set([
    ...site.founder.sameAs,
    ...social.links.filter((l) => /^https?:\/\//.test(l.url)).map((l) => l.url),
  ]),
];

const PERSON_ID = abs('/#person');
const WEBSITE_ID = abs('/#website');

/** Andy Lewis as a Person / musician — the site's central entity. */
export function personSchema(image?: string): Node {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: site.founder.name,
    url: site.url,
    jobTitle: site.founder.jobTitles,
    sameAs,
    knowsAbout: ['Drums', 'Guitar', 'Composition', 'Music production'],
    address: { '@type': 'PostalAddress', addressCountry: site.location },
    ...(image ? { image } : {}),
  };
}

export function websiteSchema(): Node {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: site.url,
    name: site.name,
    description: site.description,
    inLanguage: site.locale.replace('_', '-'),
    publisher: { '@id': PERSON_ID },
  };
}

export function musicAlbumSchema(album: Album, imageUrl?: string): Node {
  const d = album.data;
  const typeMap = { album: 'AlbumRelease', ep: 'EPRelease', single: 'SingleRelease' } as const;
  return {
    '@type': 'MusicAlbum',
    name: d.title,
    albumReleaseType: typeMap[d.type],
    datePublished: d.releaseDate.toISOString().slice(0, 10),
    url: abs(`/music/${album.id}/`),
    numTracks: d.tracklist.length || undefined,
    byArtist: { '@type': 'Person', '@id': PERSON_ID, name: d.artist },
    ...(d.label ? { recordLabel: d.label } : {}),
    ...(imageUrl ? { image: imageUrl } : {}),
    ...(d.tracklist.length
      ? {
          track: d.tracklist.map((t, i) => ({
            '@type': 'MusicRecording',
            position: i + 1,
            name: t.title,
          })),
        }
      : {}),
  };
}

export function eventSchema(event: Event, imageUrl?: string): Node {
  const d = event.data;
  const status = d.cancelled
    ? 'https://schema.org/EventCancelled'
    : 'https://schema.org/EventScheduled';
  return {
    '@type': 'MusicEvent',
    name: d.title,
    startDate: d.date.toISOString(),
    eventStatus: status,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    url: abs('/events/'),
    location: {
      '@type': 'Place',
      name: d.venue,
      address: {
        '@type': 'PostalAddress',
        addressLocality: d.city,
        addressCountry: d.country,
      },
    },
    performer: { '@type': 'Person', '@id': PERSON_ID, name: site.founder.name },
    ...(imageUrl ? { image: imageUrl } : {}),
    ...(d.ticketUrl
      ? {
          offers: {
            '@type': 'Offer',
            url: d.ticketUrl,
            availability: d.soldOut
              ? 'https://schema.org/SoldOut'
              : 'https://schema.org/InStock',
          },
        }
      : {}),
  };
}

export function articleSchema(post: Post, imageUrl?: string): Node {
  const d = post.data;
  return {
    '@type': 'BlogPosting',
    headline: d.title,
    description: d.description,
    datePublished: d.publishDate.toISOString(),
    dateModified: (d.updatedDate ?? d.publishDate).toISOString(),
    url: abs(`/blog/${post.id}/`),
    mainEntityOfPage: abs(`/blog/${post.id}/`),
    articleSection: d.category,
    keywords: d.tags.join(', ') || undefined,
    author: { '@type': 'Person', '@id': PERSON_ID, name: d.author },
    publisher: { '@id': PERSON_ID },
    ...(imageUrl ? { image: imageUrl } : {}),
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]): Node {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: abs(item.url),
    })),
  };
}
