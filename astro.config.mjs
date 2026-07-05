// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync, readdirSync } from 'node:fs';

// The canonical production origin. Everything SEO-related derives from this.
const SITE = 'https://andylewismusic.com';

// Paths of pages marked hidden (or drafted) — excluded from the sitemap. Read
// straight from the content files since the config runs before the content API.
function hiddenPaths() {
  const paths = new Set();
  const generic = {
    music: '/music/',
    videos: '/videos/',
    events: '/events/',
    blog: '/blog/',
    gear: '/gear/',
    contact: '/contact/',
  };
  for (const [key, href] of Object.entries(generic)) {
    try {
      const j = JSON.parse(readFileSync(`./src/content/pages/${key}.json`, 'utf8'));
      if (j.hero?.hidden) paths.add(href);
    } catch {}
  }
  try {
    const fm = readFileSync('./src/content/about/about.md', 'utf8').split('---')[1] ?? '';
    if (/hidden:\s*true/.test(fm)) paths.add('/about/');
  } catch {}
  try {
    for (const f of readdirSync('./src/content/site-pages')) {
      if (!f.endsWith('.json')) continue;
      const j = JSON.parse(readFileSync(`./src/content/site-pages/${f}`, 'utf8'));
      if (j.draft) paths.add(`/${f.replace(/\.json$/, '')}/`);
    }
  } catch {}
  return [...paths];
}
const HIDDEN = hiddenPaths();

// https://astro.build/config
export default defineConfig({
  site: SITE,
  // Pure static output — every page is pre-rendered HTML for Hostinger shared hosting.
  output: 'static',
  // Clean URLs: /about/ instead of /about.html. Hostinger/Apache serves index.html from the folder.
  trailingSlash: 'ignore',
  build: {
    // Emit /about/index.html so links work on Apache without rewrites.
    format: 'directory',
  },
  image: {
    // Allow remote optimization only from domains we explicitly trust.
    domains: ['i.ytimg.com'],
  },
  integrations: [
    mdx(),
    sitemap({
      // News/blog changes most often; tune priorities for crawlers.
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      // Keep dev-only and hidden pages out of the index.
      filter: (page) =>
        !page.includes('/styleguide') && !HIDDEN.some((p) => page.endsWith(p)),
    }),
  ],
  vite: {
    // Cast: Tailwind's Vite plugin is typed against its own copy of Vite, which
    // trips a harmless structural mismatch with Astro's bundled Vite types.
    plugins: [/** @type {any} */ (tailwindcss())],
  },
  // View Transitions are enabled per-layout via <ClientRouter /> (see Phase 4).
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
});
