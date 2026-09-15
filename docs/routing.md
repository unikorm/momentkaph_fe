# Routing — draft

Goal: `momentkaph.sk/sk/gallery/weddings` instead of `momentkaph.sk/gallery.html?type=weddings`,
with zero dependencies and zero build step, on Websupport shared hosting (Apache, `.htaccess`
is the only config you can touch). Branch `feat/routing`.

## TL;DR

**Clean URLs are a server concern, not a JavaScript concern.** The site stays a handful of
plain HTML files. Apache maps `/sk/about-me` → `about-me.html` and `/en/gallery/weddings` →
`gallery.html`. No router runs in the browser. The only JS involved is `gallery.js` reading
the type from `location.pathname` instead of `?type=`.

That is the opposite of what Angular did (one `index.html` per language, router in JS,
`.htaccess` falling back to `index.html` for every path). Angular needed that because it
renders pages in JS. This site doesn't, so it gets the nicer URLs for free.

What this branch contains:

| file | role |
|---|---|
| `src/.htaccess` | Your current file with the Angular routing block replaced. Security, headers, MIME and brotli sections are kept; caching is adjusted (see below). |
| `src/js/routes.js` | The URL map (mirrors the Angular `routes` array), a matcher, URL builders. Pure — runs in the browser and in Node. |
| `dev.js`, `package.json` | Zero-dependency dev server applying the same map locally: `npm start` → http://localhost:4200 |
| `src/*.html` | Links are clean (`/sk/about-me`), asset paths are root-absolute (`/assets/…`) |
| `src/js/gallery.js` | Reads the type from the path; builds babies links with `galleryUrl()` |
| `src/js/lang.js` | Language from the path prefix, no detection at all (the server did it). Still commented out in every page, as on `main`. |

## The URL map

Every page address carries a language prefix. `/sk/…` is shown; `/en/…` and `/ua/…` are identical.

| URL | serves | Angular equivalent |
|---|---|---|
| `/` | 302 → `/sk`, `/en` or `/ua` — cookie from the switcher, else `Accept-Language`, else Slovak | `/` → `/<lang>/index.html`, same detection |
| `/about-me` (no prefix) | 302 → `/<lang>/about-me`, same choice | — |
| `/sk` | `index.html` (tiles + reviews) | `''` → redirect `gallery` |
| `/sk/about-me` | `about-me.html` | `about-me` |
| `/sk/contact-me` | `contact-me.html` | `contact-me` |
| `/sk/gallery` | 301 → `/sk` | `gallery` (was a page; here the tiles *are* the home page) |
| `/sk/gallery/babies` | 301 → `/sk/gallery/babies/baptism` | same redirect |
| `/sk/gallery/:type` | `gallery.html`, type ∈ weddings, love-story, pregnancy, studio, family, portrait | `gallery/:type` |
| `/sk/gallery/babies/:variant` | `gallery.html`, variant ∈ baptism, newborn | `gallery/:type/:variant` |
| `/sk/404`, anything else | **404 status** + `404.html` | `404`, `**` → redirect `404` |
| `/sk/about-me.html`, `/sk/about-me/` | 301 → `/sk/about-me` | — |
| `/sk/assets/x.avif` | 301 → `/assets/x.avif` | your old internal rewrite (Angular used relative paths) |

### Why every language keeps its prefix, Slovak included

The first draft had Slovak unprefixed (`/about-me`) with `/sk/…` redirecting to it. Your
production changed that:

- **Your live `.htaccess` 301-redirects `/` to `/sk/index.html`.** Browsers cache 301s. A
  visitor with that cached redirect who then met a new rule sending `/sk/…` back to `/…`
  would bounce between the two forever. Keeping `/sk/` makes the cached redirect harmless
  (`/sk/index.html` → `/sk`, one hop, done).
- **Every URL Google has indexed** (`/sk/gallery/weddings`, `/en/about-me`, `/ua/contact-me`)
  keeps resolving with zero redirects.
- It matches the language detection you already run at the root, unchanged.

Cost: Slovak addresses are three characters longer. Google treats `/sk/` subdirectories as
the standard multilingual layout, so nothing is lost.

### `ua` in the URL, `uk` everywhere else

Your URLs and switcher say `ua`, and Google knows those addresses. But `ua` is a country
code, not a language: `<html lang>` and `hreflang` must say `uk` (Ukrainian). So `routes.js`
maps prefix → tag (`{ sk: 'sk', en: 'en', ua: 'uk' }`); the URL stays `/ua/…`, the page gets
`lang="uk"` and loads `lang/uk.json`. The switcher button sends `ua`.

## Options considered

| | **A. server rewrites** (this branch) | B. folders | C. SPA router (Angular way) | D. hash router |
|---|---|---|---|---|
| address | `/sk/about-me` | `/sk/about-me/` | `/sk/about-me` | `/#/about-me` |
| server config | ~25 lines of `.htaccess` | none | fallback to `index.html` | none |
| JS for routing | none | none | router + templating | router |
| SEO / sharing | best | good | needs care | poor |
| gallery pages | one `gallery.html` | 8 copies × 3 languages, or a copy script | one template | one template |

**B** is what you'd do on a host with no rewrites (GitHub Pages). Websupport has
`mod_rewrite`, so no reason to pay the trailing slashes and duplicated files.

**C** is what Angular did. Costs: HTML becomes templates fetched and inserted by JS, nothing
renders before JS runs, `<title>`, meta and i18n all move into JS, and you re-implement what
the browser already does (back button, scroll restoration, focus). No upside for four pages.

**D** needs no server support but the URLs are ugly and crawlers ignore the fragment.

## Best practices baked in

1. **One canonical address per page.** No `.html`, no trailing slash, no `www`, always a
   language prefix. Every other spelling 301s to the canonical one. Search engines, shared
   links and analytics then agree on one URL per page.
2. **Root-absolute paths** for assets, styles, scripts and fetches (`/assets/x.avif`,
   `fetch('/lang/uk.json')`). Relative paths break the moment an address contains a slash:
   `/sk/gallery/weddings` + `assets/x` = `/sk/gallery/assets/x`. Your old
   `^(sk|en|ua)/assets/` rewrite existed to patch exactly this; it survives only as a 301
   for old links. The Angular-era `<base href="/">` on `index.html` is gone.
3. **A real 404.** Unknown paths and unknown gallery types return status 404 with
   `404.html` at the requested URL (`ErrorDocument`). `.htaccess` enumerates the valid types;
   `gallery.js` keeps a client-side redirect to `/sk/404` only as a fallback.
4. **Let the browser navigate.** Page changes are plain `<a href>`. The History API is used
   only where the page genuinely stays and content swaps in place — the Krsty / Novorodenci
   sub-nav — and that already existed.
5. **Redirects for old addresses.** `/sk/gallery/babies` → baptism, `.html` → clean,
   prefixed assets → `/assets/`.
6. **The route table lives in one file** (`routes.js`) and `.htaccess` mirrors it. The dev
   server runs the real table with the same language choice, so local behaviour equals
   production. Both were run against the same URL matrix; `.htaccess` was tested on a
   local Apache 2.4 with `AllowOverride All`.
7. **Language as a path prefix**, the layout Google recommends for multilingual sites.
8. **`<title>` per page** stays in each HTML file; `gallery.js` sets it per type. That is the
   whole of Angular's `title:` config.

## Language

The server decides, once, for prefix-less addresses — in this order:

1. `lang` cookie, set by the switcher (`lang=en; path=/; max-age=1y; SameSite=Lax`),
2. `Accept-Language` (`uk`/`ru` → `/ua`, `en` → `/en`), exactly your existing rules,
3. Slovak.

`lang.js` therefore contains no detection and no storage logic: read the prefix, set
`<html lang>`, load the dictionary if not Slovak, put the prefix on every internal link,
and on a switcher click set the cookie and open the same page under the other prefix.
HTML links are written as `/sk/…` so the site has no redirects on navigation even while
`lang.js` stays disabled. Enabling it is uncommenting one `<script>` tag per page.

Known limitation of client-side i18n: a crawler fetching `/en/about-me` receives Slovak
HTML with `lang="sk"` and the English text arrives after JS runs. Your Angular build
avoided this with one pre-rendered folder per language. If EN/UA search visibility
matters, the fix is a small build step that bakes each dictionary into per-language copies
(`dist/en/about-me.html` etc.) plus `<link rel="alternate" hreflang>` tags — and
`.htaccess` would then map `/en/about-me` → `en/about-me.html`. Not needed for the
Slovak pages, which are already static.

## Deploying to Websupport

1. In `/web/`, **delete** `sk/`, `en/`, `ua/` — a real directory beats the rewrite rules
   and would serve the old Angular `index.html`.
2. Upload the **contents** of `src/` into `/web/`: the five HTML files, `.htaccess`,
   `assets/`, `styles/`, `js/`, `lang/`, `fonts/`.
3. Open `momentkaph.sk/`, `/sk/gallery/weddings`, `/sk/nope` (must show the 404 page) and
   `/sk/about-me.html` (must land on `/sk/about-me`).

What changed in `.htaccess` besides routing:

- **Cache-Control for js/css is no longer "1 year, immutable".** Angular content-hashed those
  files; the vanilla ones are not hashed, so a 1-year cache would freeze old code after every
  deploy. They now get `no-cache, must-revalidate` like HTML, which costs one cheap 304 round
  trip. Images, icons and fonts keep the 1-year cache — rename the file when one changes.
- MIME types added for `.json`, `.webmanifest`, `.woff2`; `.json` added to brotli.
- Two trailing `# comments` on directive lines were moved to their own lines. Apache does not
  support inline comments; those words were being parsed as arguments.
- The CSP is unchanged. When the photos move to Scaleway, its host goes into `img-src`.

## Local

```
npm start            # http://localhost:4200 — clean URLs, real 404s, language redirect, 302s instead of 301s
npm run check        # node --check on every JS file (same as CI)
```

## Open decisions (yours)

- Should `/sk/gallery` become its own page again (Angular) or stay a redirect to `/sk`?
- When to enable `lang.js`, and whether EN/UA need the pre-rendered variant above.
- `sitemap.xml` listing the canonical `/sk/…`, `/en/…`, `/ua/…` URLs — cheap, worth adding with the first release.
- The `Options -MultiViews` question: if Websupport has MultiViews on, Apache may serve
  `about-me.html` for `/about-me` on its own before the rules run. Harmless, but if you see
  it, that directive (if allowed) turns it off.
