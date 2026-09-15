# Routing — draft

Goal: `momentkaph.sk/gallery/weddings` instead of `momentkaph.sk/gallery.html?type=weddings`,
with zero dependencies and zero build step, on Websupport shared hosting (Apache, `.htaccess`
is the only config you can touch). Branch `feat/routing`. Language handling is out of scope
here — see the last section for how it plugs in later.

## TL;DR

**Clean URLs are a server concern, not a JavaScript concern.** The site stays a handful of
plain HTML files. Apache maps `/about-me` → `about-me.html` and `/gallery/weddings` →
`gallery.html`. No router runs in the browser. The only JS involved is `gallery.js` reading
the type from `location.pathname` instead of `?type=`.

That is the opposite of what Angular did (one `index.html`, router in JS, `.htaccess` falling
back to `index.html` for every path). Angular needed that because it renders pages in JS.
This site doesn't, so it gets the nicer URLs for free.

What this branch contains:

| file | role |
|---|---|
| `src/.htaccess` | Your current file with the Angular routing block replaced. Security, headers, MIME and brotli sections are kept; caching is adjusted (see below). |
| `src/js/routes.js` | The URL map (mirrors the Angular `routes` array), a matcher, URL builders. Pure — runs in the browser and in Node. |
| `dev.js`, `package.json` | Zero-dependency dev server applying the same map locally: `npm start` → http://localhost:4200 |
| `src/*.html` | Links are clean (`/about-me`), asset paths are root-absolute (`/assets/…`) |
| `src/js/gallery.js` | Reads the type from the path; builds the babies sub-nav links with `galleryUrl()` |
| `src/js/lang.js` | Unchanged from `main` except the dictionary path is root-absolute. Still commented out in every page. |

## The URL map

| URL | serves | Angular equivalent |
|---|---|---|
| `/` | `index.html` (tiles + reviews) | `''` → redirect `gallery` |
| `/about-me` | `about-me.html` | `about-me` |
| `/contact-me` | `contact-me.html` | `contact-me` |
| `/gallery` | 301 → `/` | `gallery` (was a page; here the tiles *are* the home page) |
| `/gallery/babies` | 301 → `/gallery/babies/baptism` | same redirect |
| `/gallery/:type` | `gallery.html`, type ∈ weddings, love-story, pregnancy, studio, family, portrait | `gallery/:type` |
| `/gallery/babies/:variant` | `gallery.html`, variant ∈ baptism, newborn | `gallery/:type/:variant` |
| `/404`, anything else | **404 status** + `404.html` | `404`, `**` → redirect `404` |
| `/about-me.html`, `/about-me/` | 301 → `/about-me` | — |
| `/sk/…`, `/en/…`, `/ua/…` | 301 → `/…` (old addresses; see below) | the localized builds |
| `/sk`, `/sk/index.html` (and en, ua) | `index.html`, served in place | the old home page |

Differences from Angular, on purpose:

- `/gallery` redirects to `/` instead of being a page — there is no separate gallery page
  in the vanilla version, the tiles live on the home page. One line to flip: change the
  `redirect` entry in `routes.js` to `file: 'gallery.html'` and add a rule in `.htaccess`.
- Unknown paths get a real 404 status at the original URL, not a redirect to `/404`.
  Search engines and link checkers need the status; a redirect to `/404` returns 200.
- `:variant` only exists under `babies`. Angular's generic `:type/:variant` was never used
  for anything else and the API endpoints are `baptism` / `newborn` directly.

### The old `/sk/…` addresses

Google has indexed `/sk/gallery/weddings`, `/en/about-me`, `/ua/contact-me` and so on, and
people have them bookmarked. They all 301 to the same path without the prefix.

One exception: the old home page. Your live `.htaccess` 301-redirects `/` to
`/sk/index.html`, and **browsers cache 301s**. A returning visitor still holds that redirect.
If `/sk/index.html` now 301'd back to `/`, that visitor would bounce between the two forever.
So `/sk`, `/sk/` and `/sk/index.html` (and the en/ua variants) serve `index.html` in place —
same page, old address, no loop. Everything under them redirects normally.

## Options considered

| | **A. server rewrites** (this branch) | B. folders | C. SPA router (Angular way) | D. hash router |
|---|---|---|---|---|
| address | `/about-me` | `/about-me/` | `/about-me` | `/#/about-me` |
| server config | ~20 lines of `.htaccess` | none | fallback to `index.html` | none |
| JS for routing | none | none | router + templating | router |
| SEO / sharing | best | good | needs care | poor |
| gallery pages | one `gallery.html` | 8 copies, or a copy script | one template | one template |

**B** is what you'd do on a host with no rewrites (GitHub Pages). Websupport has
`mod_rewrite`, so no reason to pay the trailing slashes and duplicated files.

**C** is what Angular did. Costs: HTML becomes templates fetched and inserted by JS, nothing
renders before JS runs, `<title>`, meta and i18n all move into JS, and you re-implement what
the browser already does (back button, scroll restoration, focus). No upside for four pages.

**D** needs no server support but the URLs are ugly and crawlers ignore the fragment.

## Best practices baked in

1. **One canonical address per page.** No `.html`, no trailing slash, no `www`. Every other
   spelling 301s to the canonical one. Search engines, shared links and analytics then agree
   on one URL per page.
2. **Root-absolute paths** for assets, styles, scripts and fetches (`/assets/x.avif`,
   `fetch('/lang/en.json')`). Relative paths break the moment an address contains a slash:
   `/gallery/weddings` + `assets/x` = `/gallery/assets/x`. Your old `^(sk|en|ua)/assets/`
   rewrite existed to patch exactly this for Angular's relative paths; the legacy 301 covers
   it now. The Angular-era `<base href="/">` on `index.html` is gone.
3. **A real 404.** Unknown paths and unknown gallery types return status 404 with `404.html`
   at the requested URL (`ErrorDocument`). `.htaccess` enumerates the valid types;
   `gallery.js` keeps a client-side redirect to `/404` only as a fallback.
4. **Let the browser navigate.** Page changes are plain `<a href>`. The History API is used
   only where the page genuinely stays and content swaps in place — the Krsty / Novorodenci
   sub-nav — and that already existed.
5. **Redirects for old addresses.** `/gallery/babies` → baptism, `.html` → clean, the old
   `/sk/…` shapes → clean.
6. **The route table lives in one file** (`routes.js`) and `.htaccess` mirrors it. The dev
   server runs the real table, so local behaviour equals production. Both were run against
   the same URL matrix; `.htaccess` was tested on a local Apache 2.4 with `AllowOverride All`.
7. **`<title>` per page** stays in each HTML file; `gallery.js` sets it per type. That is the
   whole of Angular's `title:` config.

## Deploying to Websupport

1. In `/web/`, **delete** `sk/`, `en/`, `ua/` — a real directory beats the rewrite rules
   and would serve the old Angular `index.html`.
2. Upload the **contents** of `src/` into `/web/`: the five HTML files, `.htaccess`,
   `assets/`, `styles/`, `js/`, `lang/`, `fonts/`.
3. Open `momentkaph.sk/`, `/gallery/weddings`, `/nope` (must show the 404 page),
   `/about-me.html` (must land on `/about-me`) and `/sk/gallery/weddings` (must land on
   `/gallery/weddings`).

What changed in `.htaccess` besides routing:

- **Cache-Control for js/css is no longer "1 year, immutable".** Angular content-hashed those
  files; the vanilla ones are not hashed, so a 1-year cache would freeze old code after every
  deploy. They now get `no-cache, must-revalidate` like HTML, which costs one cheap 304 round
  trip. Images, icons and fonts keep the 1-year cache — rename the file when one changes.
- MIME types added for `.json`, `.webmanifest`, `.woff2`; `.json` added to brotli.
- Two trailing `# comments` on directive lines were moved to their own lines. Apache does not
  support inline comments; those words were being parsed as arguments.
- The `Accept-Language` redirects at the root are gone with the per-language folders they
  pointed at. Language is a later step (below).
- The CSP is unchanged. When the photos move to Scaleway, its host goes into `img-src`.

## Local

```
npm start            # http://localhost:4200 — clean URLs, real 404s, 302s instead of 301s
npm run check        # node --check on every JS file (same as CI)
```

## Later: language

Nothing in this branch decides how language reaches the URL. Two shapes fit the same table:

- **Query string**, `?lang=en` — what `lang.js` on `main` already does. Zero routing changes:
  the rules above ignore the query string and pass it through on redirects.
- **Path prefix**, `/en/about-me` — Google's recommended layout for multilingual sites. Then
  every rule above gets an optional `(sk|en|ua)/` in front, `routes.js` strips the prefix
  before matching, and the legacy block turns into the real thing. If you go this way, keep
  Slovak prefixed too (`/sk/…`), for the cached-301 reason explained above.

Either way, `lang.js` stays a per-page script and the server never needs to know a language.

## Open decisions (yours)

- Should `/gallery` become its own page again (Angular) or stay a redirect to `/`?
- `sitemap.xml` listing the canonical URLs — cheap, worth adding with the first release.
- `Options -MultiViews`: if Websupport has MultiViews on, Apache may serve `about-me.html`
  for `/about-me` on its own before the rules run. Harmless; that directive (if allowed)
  turns it off.
