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

## Pages & sections (the page builder)

Every page under **Pages** (Home, About, Music, Videos, Events, News, Gear,
Contact) is built from a list of **sections**. Open a page, expand **Sections**,
and use **Add** to insert any block from the shared library:

- **featured-music / discography** — release cards
- **latest-video / featured-videos / video-archive** — video blocks
- **upcoming-events / past-events** — show listings
- **news** — recent posts
- **gear** — equipment
- **instagram** — reels feed / placeholder
- **contact-form** — the booking form
- **about-bio / about-highlights / about-experience / about-influences /
  about-equipment** — the About page pieces
- **rich-text** — free Markdown content
- **cta** — a call-to-action band

Any block can go on any page, in any order. Per section you can set:

- **Heading / Subheading** — leave blank to use the block's default (or hide it).
- **Item limit (0 = all)** — e.g. show 3 releases on the homepage, all on Music.
- **Background** — tone (dark / grey / light / white / accent), an optional
  **background image**, and **parallax**.
- **Rich text body** — only used by the `rich-text` block.

Each page also has a **Hero** (kicker, heading, intro, background).

## Adding a new page

**Pages** collections are fixed, but you can create your own under **Custom
Pages → New Page**. Give it a title (that becomes the URL, e.g. "Studio" →
`/studio/`), set the hero, and add sections just like any other page. Then:

1. Turn **Draft** off to make it live.
2. Add a link to it in **Site Settings → Navigation** so people can find it.
3. Avoid the reserved slugs: about, music, videos, events, blog, gear, contact.

## Hiding a page

Every page (except Home) has a **"Hide this page"** toggle in its **Hero**
section. Turning it on:

- removes the page from **all menus** (header, mobile, footer),
- **`noindex`**es it (kept out of search results), and
- drops it from the **sitemap**.

The page's direct URL still works if someone has the exact link.

## Instagram Reels

The Instagram section shows your reels via a free **Behold.so** JSON feed:

1. Create a feed at behold.so, connect your Instagram (a **Business/Creator**
   account), and set it to include Reels.
2. Paste the feed URL into **Pages → Home → Instagram → Reels feed URL**.

Reels are fetched at build time and shown in the site's own grid — no watermark.
If the field is blank or the feed is empty, a placeholder links to your profile.

## The safety net

Content is validated on every build. If a required field is missing or a value
is the wrong type, the build fails with a clear message instead of publishing
something broken — so the live site stays consistent.
