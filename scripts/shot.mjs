/** Screenshot pages for visual verification. node scripts/shot.mjs */
import puppeteer from 'puppeteer-core';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const base = 'http://localhost:4321';
const shots = [
  ['/', 'home'],
  ['/music/', 'music'],
  ['/contact/', 'contact'],
];
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
for (const [route, name] of shots) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
  // Reduced motion so scroll-reveal elements render immediately in a full-page shot.
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto(base + route, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: `/tmp/shot-${name}.png`, fullPage: true });
  console.log('shot', name);
  await page.close();
}
await browser.close();
