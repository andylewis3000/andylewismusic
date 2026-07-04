# Deployment

The site is **static**: `npm run build` produces a `dist/` folder of plain
HTML/CSS/JS that you upload to Hostinger's `public_html`. No Node runtime or
database is needed on the host — only PHP (for the contact form), which
Hostinger shared hosting provides.

## Build

```bash
nvm use            # Node 22
npm ci             # clean install (or: npm install)
npm run build      # → dist/  (includes the Pagefind search index)
```

`dist/` will contain the whole site, plus `form.php`, `.htaccess`, `admin/`,
`fonts/`, `pagefind/`, `robots.txt` and `sitemap-index.xml` (all copied from
`public/`).

> Set the production origin once in `astro.config.mjs` (`site:`) — it's already
> `https://andylewismusic.com`. Everything SEO-related derives from it.

## Deploy — manual upload (current setup)

1. Build locally (above).
2. Open Hostinger **hPanel → Files → File Manager** (or connect via SFTP/FTP —
   credentials are in hPanel → Files → FTP Accounts).
3. Upload **the contents of `dist/`** into **`public_html/`** (not the `dist`
   folder itself — its *contents*). Overwrite existing files.
4. Confirm `public_html/.htaccess`, `public_html/form.php` and
   `public_html/admin/` are present.

Visit https://andylewismusic.com — done.

> Tip: with an FTP client (FileZilla) or `rsync` over SSH you can sync only
> changed files instead of re-uploading everything.

## Contact form setup (one-time, on the host)

`public/form.php` emails enquiries. Configure it on the server (hPanel), either
by editing the CONFIG block at the top of `form.php` or via environment vars:

| Var | Purpose |
|-----|---------|
| `CONTACT_TO_EMAIL` | where general enquiries go |
| `BOOKING_TO_EMAIL` | where booking/session/scoring enquiries go |
| `FROM_EMAIL` | sender (use an address on your domain) |
| `TURNSTILE_SECRET` | Cloudflare Turnstile secret (leave blank to disable) |

Spam protection: a honeypot is always on. To enable **Cloudflare Turnstile**,
create a widget at Cloudflare, put the **site key** in the CMS
(Site Settings → Forms → Turnstile site key) and the **secret** in `form.php`.

Test the form after deploy; if mail doesn't arrive, check hPanel → Emails and
consider Hostinger SMTP for `mail()` deliverability.

## CMS in production

1. Create a **GitHub repository** and push this project to it.
2. In `public/admin/config.yml`, set `backend.repo` to `your-user/your-repo`
   and `branch` to your default branch (already scaffolded as a placeholder).
3. Deploy (upload `dist/`). Visit `https://andylewismusic.com/admin/` and sign
   in with GitHub. Saves commit content to the repo.

Until the automation below is enabled, publishing an edit means: commit lands in
GitHub → a maintainer runs `npm run build` and uploads `dist/`.

## Optional: automate GitHub → Hostinger

Two routes to make edits deploy themselves:

- **GitHub Actions → SFTP** (portable): a workflow builds on push and uploads
  `dist/` to `public_html` via SFTP (store host/user/key as repo secrets).
  Sketch:
  ```yaml
  # .github/workflows/deploy.yml
  on: { push: { branches: [main] } }
  jobs:
    deploy:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
          with: { node-version: 22 }
        - run: npm ci && npm run build
        - uses: SamKirkland/FTP-Deploy-Action@v4.3.5
          with:
            server: ${{ secrets.FTP_HOST }}
            username: ${{ secrets.FTP_USER }}
            password: ${{ secrets.FTP_PASS }}
            local-dir: ./dist/
            server-dir: /public_html/
  ```
- **Hostinger's built-in GitHub deploy** (plan-dependent): connect the repo in
  hPanel; Hostinger redeploys on push. Simpler, less control; note it deploys
  the repo as-is, so you'd point it at a branch containing the built site (or a
  plan that runs the build).

## Rollback

`dist/` is disposable and reproducible. To roll back, check out an earlier git
commit, `npm run build`, and re-upload — or keep a copy of the previous
`public_html` before overwriting.

## Pre-launch checklist

- [ ] `astro.config.mjs` `site` = production URL
- [ ] Real images uploaded (replaces the on-brand placeholders)
- [ ] `form.php` emails + Turnstile configured and test-submitted
- [ ] `backend.repo` in `admin/config.yml` points at the real repo
- [ ] HTTPS working (Hostinger SSL + `.htaccess` redirect)
- [ ] Submit sitemap in Google Search Console; run the Rich Results Test
