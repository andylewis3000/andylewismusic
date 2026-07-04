# Editing the site (CMS guide)

Everything visible on andylewismusic.com is editable — no code required. This
guide is for the person updating content (that's you, Andy).

## Where to edit

Open **https://andylewismusic.com/admin/** and sign in with GitHub. You'll see
a friendly dashboard with everything grouped:

- **Music** — albums, EPs, singles (cover art, tracklist, streaming links)
- **Videos** — paste a YouTube ID, pick a category
- **Events** — shows, with automatic upcoming/past sorting
- **News & Blog** — posts with categories, tags, hero images
- **Gear** — equipment by category
- **Site Settings** — the About page, global settings, homepage, navigation,
  footer, and social links

Saving publishes a change to the site's content and triggers a rebuild.

## How publishing works (the short version)

The site is a **static** site — pre-built HTML files, which is why it's so fast
and secure. When you save in the CMS:

1. Your change is committed to the GitHub repository.
2. The site is rebuilt from that content.
3. The new files are uploaded to Hostinger.

> **Current setup:** deployment is **manual** for now (build locally, upload
> `dist/`). Step 3 becomes automatic once the GitHub → Hostinger pipeline in
> `docs/DEPLOYMENT.md` is switched on. Until then, edits land in GitHub and a
> maintainer runs a quick build + upload.

## Editing locally (no GitHub needed)

To edit on your own machine before the site is live:

```bash
nvm use            # Node 22
npm run dev        # start the site at http://localhost:4321
```

Then, **in Chrome or Edge**, open http://localhost:4321/admin/index.html and
click **"Work with Local Repository"**. Pick this project folder when prompted
and grant access. (In dev, use the full `/admin/index.html` path; the live site
serves it at just `/admin/`.) Sveltia now reads and writes the project files directly (via the
browser's File System Access API) — no proxy server, no login. Your edits appear
in `src/content/` and the running dev site updates live.

> Use Chrome or Edge for local editing — the File System Access API isn't
> available in Safari/Firefox. (The live `/admin/` on the deployed site uses
> GitHub instead and works in any browser.)

## Images

- Upload images right inside any image field. They're stored in
  `src/assets/images/uploads/` and **automatically optimized** at build time
  (resized, converted to modern formats, lazy-loaded) — you don't do anything.
- **Always fill in the "alt text"** field next to an image. It's a one-line
  description for screen readers and SEO (e.g. "Andy playing drums, lit in
  green stage light"). See `docs/IMAGE-GUIDELINES.md` for sizes and tips.

## Tips

- **Drafts:** toggle "Draft" on to hide something from the live site while you
  work on it.
- **Featured:** the "Feature on homepage" toggles control what appears in the
  homepage sections.
- **Dates** drive behaviour: an event automatically moves from "Upcoming" to
  the "Past shows" archive after its date passes.
- **Order:** the "Sort order" number controls manual ordering (lower = first)
  for music and gear.

## The safety net

Content is validated on every build. If a required field is missing or a value
is the wrong type, the build fails with a clear message instead of publishing
something broken — so the live site stays consistent.
