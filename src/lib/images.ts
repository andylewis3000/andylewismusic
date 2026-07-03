/**
 * ─────────────────────────────────────────────────────────────────────────
 *  IMAGE RESOLVER
 * ─────────────────────────────────────────────────────────────────────────
 *  CMS content stores images as project-root path strings, e.g.
 *      "/src/assets/images/uploads/hero-live.jpg"
 *  Astro's image optimizer, however, works from imported `ImageMetadata`.
 *  This module bridges the two: it eagerly globs every image under
 *  `src/assets/images/` at build time and lets components look one up by its
 *  stored path. The `<Image>` component (src/components/media/Image.astro)
 *  then emits responsive, format-optimized output (AVIF/WebP + srcset).
 *
 *  A missing path returns `undefined` so components can fall back to a
 *  designed placeholder — the site builds and looks intentional even before
 *  real photography is uploaded.
 * ─────────────────────────────────────────────────────────────────────────
 */
import type { ImageMetadata } from 'astro';

// Raster formats only; SVGs (e.g. the logo) are handled as components elsewhere.
const images = import.meta.glob<ImageMetadata>(
  '/src/assets/images/**/*.{jpeg,jpg,png,webp,avif}',
  { eager: true, import: 'default' }
);

/** Resolve a stored CMS image path to optimizable metadata, or `undefined`. */
export function resolveImage(path?: string | null): ImageMetadata | undefined {
  if (!path) return undefined;
  return images[path];
}

/** True when a real optimizable asset exists for this stored path. */
export function hasImage(path?: string | null): boolean {
  return resolveImage(path) !== undefined;
}
