/** Detailed Lighthouse audit for one URL — lists non-passing audits. */
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

const url = process.argv[2];
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const chrome = await chromeLauncher.launch({ chromePath: CHROME, chromeFlags: ['--headless=new', '--no-sandbox'] });
const r = await lighthouse(url, {
  port: chrome.port,
  onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  logLevel: 'error',
});
for (const [key, cat] of Object.entries(r.lhr.categories)) {
  console.log(`\n== ${cat.title}: ${Math.round(cat.score * 100)} ==`);
  for (const ref of cat.auditRefs) {
    const a = r.lhr.audits[ref.id];
    if (a.score !== null && a.score < 1) {
      console.log(`  ✗ ${a.id} (score ${a.score}) — ${a.title}`);
      if (a.displayValue) console.log(`      ${a.displayValue}`);
    }
  }
}
await chrome.kill();
