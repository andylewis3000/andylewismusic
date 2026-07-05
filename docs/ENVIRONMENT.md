# Environment variables

Short version: **the site needs no environment variables to build or run.** It's
a static site and all configuration lives in the content/CMS files. The only
place env vars matter is the PHP contact-form handler on the host.

## Building the site — none required

`npm run build` works with zero env vars. Optional overrides (see `.env.example`)
exist but aren't needed:

| Var | Effect | Default |
|-----|--------|---------|
| `PUBLIC_SITE_URL` | Overrides the canonical origin in CI | `site` in `astro.config.mjs` (`https://andylewismusic.com`) |

That's it for the app.

## Where configuration actually lives (not env vars)

Most "settings" are edited in the **CMS**, committed as content, and baked in at
build — no env vars:

| Setting | Where to edit |
|---------|---------------|
| Contact / booking emails shown on the site | Site Settings → Global |
| Cloudflare **Turnstile site key** (public) | Site Settings → Forms |
| Cloudflare Web Analytics token | Site Settings → Global → Analytics |
| Instagram **Behold feed URL** | Pages → Home → Instagram |
| Social links, navigation, footer | Site Settings |

## Server-side — `public/form.php` on Hostinger

The contact form is the one piece that reads real environment variables (or the
CONFIG block at the top of `form.php`). Set these **on the host** (Hostinger
hPanel), never commit them:

| Var | Purpose |
|-----|---------|
| `CONTACT_TO_EMAIL` | where general enquiries are delivered |
| `BOOKING_TO_EMAIL` | where booking / session / scoring enquiries are delivered |
| `FROM_EMAIL` | envelope sender (use an address on your domain) |
| `TURNSTILE_SECRET` | Cloudflare Turnstile **secret** key (blank = captcha disabled) |

Notes:
- The Turnstile **site key** is public and set in the CMS; the **secret** is
  private and set here.
- SMTP: if Hostinger's `mail()` deliverability is poor, configure SMTP in hPanel
  (or extend `form.php` to use SMTP credentials).

See `docs/DEPLOYMENT.md` for the full contact-form setup.
