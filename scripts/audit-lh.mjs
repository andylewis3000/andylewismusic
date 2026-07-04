/**
 * Lighthouse audit — runs the four category audits against a served build
 * using the system Chrome. Dev-time verification tool.
 *
 * Usage: node scripts/audit-lh.mjs [baseUrl]
 */
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { readdirSync, existsSync } from 'node:fs';

const base = process.argv[2] || 'http://localhost:4321';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const album = existsSync('dist/music')
  ? readdirSync('dist/music', { withFileTypes: true }).find((e) => e.isDirectory())?.name
  : undefined;
const post = existsSync('dist/blog')
  ? readdirSync('dist/blog', { withFileTypes: true }).find(
      (e) => e.isDirectory() && !['category', 'tag'].includes(e.name)
    )?.name
  : undefined;

const routes = [
  '/', '/about/', album && `/music/${album}/`, '/videos/', '/events/',
  '/blog/', post && `/blog/${post}/`, '/gear/', '/contact/',
].filter(Boolean);

const chrome = await chromeLauncher.launch({
  chromePath: CHROME,
  chromeFlags: ['--headless=new', '--no-sandbox'],
});

const opts = {
  port: chrome.port,
  onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  logLevel: 'error',
};

const pct = (c) => Math.round((c?.score ?? 0) * 100);
const rows = [];
for (const route of routes) {
  const runnerResult = await lighthouse(base + route, opts);
  const c = runnerResult.lhr.categories;
  const row = {
    route,
    perf: pct(c.performance),
    a11y: pct(c.accessibility),
    bp: pct(c['best-practices']),
    seo: pct(c.seo),
  };
  rows.push(row);
  console.log(
    `${route.padEnd(28)} Perf ${row.perf}  A11y ${row.a11y}  BP ${row.bp}  SEO ${row.seo}`
  );
}
await chrome.kill();

// Flag anything below 100 with the specific failing audits.
const belowHundred = rows.filter((r) => r.perf < 100 || r.a11y < 100 || r.bp < 100 || r.seo < 100);
console.log(
  `\n${belowHundred.length === 0 ? '✅ All categories 100 on all pages' : '⚠️  ' + belowHundred.length + ' page(s) below 100 — see details run'}`
);
