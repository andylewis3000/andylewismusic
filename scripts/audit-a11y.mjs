/**
 * Accessibility audit — runs axe-core against a served build using the system
 * Chrome via puppeteer-core. Not part of the app; a dev-time verification tool.
 *
 * Usage: node scripts/audit-a11y.mjs [baseUrl]
 */
import puppeteer from 'puppeteer-core';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const axePath = require.resolve('axe-core/axe.min.js');
const axeSource = readFileSync(axePath, 'utf8');

const base = process.argv[2] || 'http://localhost:4321';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// Derive one real album + post detail URL from the build (content-agnostic).
const firstDir = (dir) =>
  existsSync(dir) ? readdirSync(dir, { withFileTypes: true }).find((e) => e.isDirectory())?.name : undefined;
const album = firstDir('dist/music');
const post = readdirSync('dist/blog', { withFileTypes: true }).find(
  (e) => e.isDirectory() && !['category', 'tag'].includes(e.name)
)?.name;

const routes = [
  '/', '/about/', '/music/', album && `/music/${album}/`, '/videos/', '/events/',
  '/blog/', post && `/blog/${post}/`, '/gear/', '/contact/',
].filter(Boolean);

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
let totalViolations = 0;

for (const route of routes) {
  const page = await browser.newPage();
  await page.goto(base + route, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.evaluate(axeSource);
  const results = await page.evaluate(async () => {
    return await window.axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] },
    });
  });
  const v = results.violations;
  totalViolations += v.length;
  const mark = v.length === 0 ? '✓' : '✗';
  console.log(`${mark} ${route.padEnd(30)} ${v.length} violation(s)`);
  for (const violation of v) {
    console.log(`    [${violation.impact}] ${violation.id}: ${violation.help}`);
    for (const node of violation.nodes.slice(0, 3)) {
      console.log(`      → ${node.target.join(' ')}`);
    }
  }
  await page.close();
}

await browser.close();
console.log(`\n${totalViolations === 0 ? '✅ PASS' : '⚠️  ' + totalViolations + ' total'} — axe WCAG 2.0/2.1/2.2 A+AA`);
process.exit(totalViolations === 0 ? 0 : 1);
