// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// The canonical production origin. Everything SEO-related derives from this.
const SITE = 'https://andylewismusic.com';

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
      // Keep dev-only pages out of the index.
      filter: (page) => !page.includes('/styleguide'),
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
