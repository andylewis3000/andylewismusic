/**
 * Content access layer — typed helpers over Astro's content collections.
 * Centralizes draft handling, sorting, and common queries so pages stay lean.
 *
 * Drafts are visible in `dev` for previewing but excluded from production builds.
 */
import { getCollection, type CollectionEntry } from 'astro:content';

export type Album = CollectionEntry<'albums'>;
export type Video = CollectionEntry<'videos'>;
export type Event = CollectionEntry<'events'>;
export type Post = CollectionEntry<'posts'>;
export type Gear = CollectionEntry<'gear'>;
export type About = CollectionEntry<'about'>;

/** Keep an entry only if it's publishable in the current environment. */
const publishable = (entry: { data: { draft?: boolean } }) =>
  import.meta.env.PROD ? entry.data.draft !== true : true;

/* ── Discography ───────────────────────────────────────────────────────── */
export async function getAlbums(): Promise<Album[]> {
  const albums = await getCollection('albums', publishable);
  return albums.sort(
    (a, b) =>
      a.data.order - b.data.order || +b.data.releaseDate - +a.data.releaseDate
  );
}
export async function getFeaturedAlbums(limit = 3): Promise<Album[]> {
  return (await getAlbums()).filter((a) => a.data.featured).slice(0, limit);
}

/* ── Videos ────────────────────────────────────────────────────────────── */
export async function getVideos(): Promise<Video[]> {
  const videos = await getCollection('videos', publishable);
  return videos.sort((a, b) => +b.data.date - +a.data.date);
}
export async function getFeaturedVideo(): Promise<Video | undefined> {
  const videos = await getVideos();
  return videos.find((v) => v.data.featured) ?? videos[0];
}

/* ── Events (split by date) ────────────────────────────────────────────── */
export async function getEvents() {
  const all = await getCollection('events', publishable);
  const now = Date.now();
  const upcoming = all
    .filter((e) => +e.data.date >= now)
    .sort((a, b) => +a.data.date - +b.data.date);
  const past = all
    .filter((e) => +e.data.date < now)
    .sort((a, b) => +b.data.date - +a.data.date);
  return { upcoming, past, all };
}

/* ── Blog / News ───────────────────────────────────────────────────────── */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', publishable);
  return posts.sort((a, b) => +b.data.publishDate - +a.data.publishDate);
}
export async function getFeaturedPosts(limit = 3): Promise<Post[]> {
  const posts = await getPosts();
  const featured = posts.filter((p) => p.data.featured);
  return (featured.length ? featured : posts).slice(0, limit);
}
export async function getRelatedPosts(post: Post, limit = 3): Promise<Post[]> {
  const posts = (await getPosts()).filter((p) => p.id !== post.id);
  const scored = posts
    .map((p) => {
      let score = p.data.category === post.data.category ? 2 : 0;
      score += p.data.tags.filter((t) => post.data.tags.includes(t)).length;
      return { p, score };
    })
    .sort((a, b) => b.score - a.score || +b.p.data.publishDate - +a.p.data.publishDate);
  return scored.slice(0, limit).map((s) => s.p);
}

/** Unique category + tag lists for taxonomy pages. */
export async function getPostTaxonomies() {
  const posts = await getPosts();
  const categories = new Set<string>();
  const tags = new Set<string>();
  for (const p of posts) {
    categories.add(p.data.category);
    p.data.tags.forEach((t) => tags.add(t));
  }
  return { categories: [...categories], tags: [...tags] };
}

/* ── Gear ──────────────────────────────────────────────────────────────── */
export const GEAR_CATEGORIES = [
  { id: 'drums', label: 'Drums' },
  { id: 'guitars', label: 'Guitars' },
  { id: 'amps', label: 'Amps' },
  { id: 'studio', label: 'Studio' },
  { id: 'software', label: 'Software' },
  { id: 'accessories', label: 'Accessories' },
] as const;

export async function getGear(): Promise<Gear[]> {
  const gear = await getCollection('gear', publishable);
  return gear.sort((a, b) => a.data.order - b.data.order || a.data.name.localeCompare(b.data.name));
}
export async function getGearByCategory() {
  const gear = await getGear();
  return GEAR_CATEGORIES.map((cat) => ({
    ...cat,
    items: gear.filter((g) => g.data.category === cat.id),
  })).filter((group) => group.items.length > 0);
}

/* ── About ─────────────────────────────────────────────────────────────── */
export async function getAbout(): Promise<About | undefined> {
  const about = await getCollection('about');
  return about[0];
}
