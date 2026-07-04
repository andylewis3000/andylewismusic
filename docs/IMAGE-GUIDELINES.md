# Image guidelines

Images uploaded in the CMS are stored in `src/assets/images/uploads/` and
**automatically optimized at build time** — resized, converted to modern formats
(AVIF/WebP), given a responsive `srcset`, and lazy-loaded. You don't need to
optimize anything manually; just upload good source files and write alt text.

## How it works

- The CMS writes the path as e.g. `/src/assets/images/uploads/live-red.jpg`.
- A build-time resolver (`src/lib/images.ts`) maps that to Astro's image
  pipeline; the `<Image>` component emits AVIF/WebP + `srcset`.
- Where a fixed aspect ratio is used, images are cropped with `object-fit: cover`
  (no distortion).
- If an image is missing, an on-brand placeholder renders so the layout never
  breaks.

## Upload these sizes (source files)

Upload **high quality** — the build downsizes; it never upscales. JPEG or PNG
(or WebP) all fine.

| Where | Rendered shape | Suggested source | Notes |
|-------|----------------|------------------|-------|
| Homepage / page hero background | full-bleed, wide | **2400–3000 px wide** | It's the LCP image — sharp, not huge in MB |
| Album / EP / single cover | square (1:1) | **1500 × 1500 px** | Also used blurred behind the album hero |
| Blog hero | 16:9 | **1600 × 900 px** | |
| Video custom thumbnail | 16:9 | **1280 × 720 px** | Optional — defaults to the YouTube thumbnail |
| Event image | flexible | **1600 px wide** | |
| Gear photo | 4:3 | **1200 × 900 px** | |
| About portrait | 4:5 (portrait) | **1200 × 1500 px** | |
| Default social (OG) image | 1.91:1 | **1200 × 630 px** | Site Settings → Default social image |

Anything much larger than needed just makes the repo heavier — ~2500 px on the
long edge is plenty for full-bleed; smaller for thumbnails.

## Alt text (required)

**Always fill the "alt text" field** next to an image. Write a short, literal
description of what's in the photo (not "image of…"). Examples:

- ✅ "Andy playing drums live, lit in green stage light"
- ✅ "Nightshift album cover — a lone streetlight in blue-black fog"
- ❌ "photo", "album", "IMG_2931"

Decorative-only images can have empty alt, but content photos should always be
described — it's used by screen readers and for image SEO.

## Tips

- **Hero images**: favour a strong focal point that survives cropping at
  different screen widths; the subject should sit away from the extreme edges.
- **Covers**: upload the exact square artwork; it's shown sharp *and* blurred as
  the release page's backdrop.
- **File names** don't matter functionally, but lowercase-with-hyphens keeps the
  uploads folder tidy (e.g. `kings-hall-2026.jpg`).
- Prefer **photographs over graphics with fine text** for backgrounds — the
  scrim/overlay can reduce legibility of embedded text.
