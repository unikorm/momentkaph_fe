# Routing — draft

Goal: `momentkaph.sk/gallery/weddings` instead of `momentkaph.sk/gallery.html?type=weddings`,
with zero dependencies and zero build step. Branch `feat/routing`.

## TL;DR

**Clean URLs are a server concern, not a JavaScript concern.** The site stays a handful
of plain HTML files. The server maps `/about-me` → `about-me.html` and
`/gallery/weddings` → `gallery.html`. No router runs in the browser. The only JS
involved is `gallery.js` reading the type from `location.pathname` instead of `?type=`.

That is the opposite of what Angular did (one `index.html`, router in JS, server
falls back to `index.html` for every path). Angular needed that because it renders
pages in JS. This site doesn't, so it gets the nicer URLs for free.

What this branch contains:

| file | role |
|---|---|
| `src/js/routes.js` | The URL map (mirrors the Angular `routes` array), a matcher, URL builders. Pure — runs in the browser and in Node. |
| `dev.js`, `package.json` | Zero-dependency dev server applying the map locally: `npm start` → http://localhost:4200 |
| `deploy/nginx-frontend.conf` | The same map for production nginx (DRAFT, not run against a real nginx yet) |
| `deploy/_redirects` | The same map for Netlify / Cloudflare Pages |
| `src/*.html` | Links are clean (`/about-me`), asset paths are root-absolute (`/assets/…`) |
| `src/js/gallery.js` | Reads the type from the path; builds babies links with `galleryUrl()` |
| `src/js/lang.js` | Language from a path prefix (`/en/about-me`) instead of `?lang=` (still disabled in HTML, as before) |

## The URL map

| URL | serves | Angular equivalent |
|---|---|---|
| `/` | `index.html` (tiles + reviews) | `''` → redirect `gallery` |
| `/about-me` | `about-me.html` | `about-me` |
| `/contact-me` | `contact-me.html` | `contact-me` |
| `/gallery` | 301 → `/` | `gallery` (was its own page; here the tiles *are* the home page) |
| `/gallery/babies` | 301 → `/gallery/babies/baptism` | same redirect |
| `/gallery/:type` | `gallery.html`, type ∈ weddings, love-story, pregnancy, studio, family, portrait | `gallery/:type` |
| `/gallery/babies/:variant` | `gallery.html`, variant ∈ baptism, newborn | `gallery/:type/:variant` |
| `/404` | `404.html`, **with a 404 status** | `404` |
| anything else | 404 + `404.html` | `**` → redirect `404` |
| `/en/…`, `/uk/…` | same files, prefix kept | Angular's localized builds under `/sk/`, `/en/`, `/uk/` |
| `/sk/…` | 301 → `/…` | — (Slovak is unprefixed now) |

Differences from Angular, on purpose:

- `/gallery` redirects to `/` instead of being a page — there is no separate gallery
  page in the vanilla version, the tiles live on the home page. Easy to flip if you
  add one: change the `redirect` entry in `routes.js` to `file: 'gallery.html'`.
- Unknown paths get a real 404 status at the original URL, not a redirect to `/404`.
  Search engines and link checkers need the status; a redirect to `/404` returns 200.
- `:variant` only exists under `babies`. Angular's generic `:type/:variant` was
  never used for anything else and the API endpoints are `baptism` / `newborn` directly.

## Options considered

| | **A. server rewrites** (this branch) | B. folders | C. SPA router (Angular way) | D. hash router |
|---|---|---|---|---|
| address | `/about-me` | `/about-me/` | `/about-me` | `/#/about-me` |
| server config | a few lines | none | fallback to `index.html` | none |
| JS for routing | none | none | router + templating | router |
| SEO / sharing | best | good | needs care | poor |
| gallery pages | one `gallery.html` | 8 copies (or a copy script) | one template | one template |
| works on GitHub Pages | no | yes | no | yes |

**B** is the fallback if the host cannot rewrite at all: `src/about-me/index.html`,
`src/contact-me/index.html`, `src/gallery/weddings/index.html` ×8. Every static host
serves those. Costs: trailing slashes, and the 8 gallery copies need a 10-line copy
script in the build (which then is no longer "zero build").

**C** is what Angular did. Costs: HTML becomes templates fetched and inserted by JS,
nothing renders before JS runs, `<title>`, meta and i18n all move into JS, and you
re-implement what the browser already does (back button, scroll restoration, focus).
No upside for a four-page site.

**D** needs no server support but the URLs are ugly and crawlers ignore the fragment.

## Best practices baked in

1. **One canonical address per page.** No `.html`, no trailing slash, no `/sk/`,
   no `www`. Every other spelling 301s to the canonical one. Search engines, shared
   links and analytics then agree on one URL per page.
2. **Root-absolute paths** for assets, styles, scripts and fetches (`/assets/x.avif`,
   `fetch('/lang/en.json')`). Relative paths break the moment an address contains a
   slash: `/gallery/weddings` + `assets/x` = `/gallery/assets/x`. The Angular-era
   `<base href="/">` was doing this job on `index.html` only; it is gone now.
3. **A real 404.** Unknown paths and unknown gallery types return status 404 with
   `404.html` at the requested URL. nginx enumerates the valid types; `gallery.js`
   keeps a client-side redirect to `/404` only as a fallback for hosts that can't.
4. **Let the browser navigate.** Page changes are plain `<a href>`. The History API
   (`pushState` / `popstate`) is used only where the page genuinely stays and content
   swaps in place — the Krsty / Novorodenci sub-nav — and that already existed.
5. **Redirects for old addresses.** `/gallery/babies` → baptism, `/sk/…` → `/…` for
   whatever Google still has from the Angular site, `.html` → clean.
6. **The route table lives in one file** (`routes.js`) and the server configs mirror
   it. The dev server runs the real table, so local behaviour equals production.
7. **Language as a path prefix**, default language unprefixed. This is what Google
   recommends for multilingual sites; `?lang=` query strings get treated inconsistently.
8. **`<title>` per page** stays in each HTML file; `gallery.js` sets it per type.
   That is the whole of Angular's `title:` config.

## Language

`lang.js` now reads the language from the path (`/en/…`), not from `?lang=`:

- First visit to an unprefixed URL: `navigator.languages` decides; non-Slovak
  visitors are `location.replace`d to `/en/…` or `/uk/…`.
- The choice is remembered in `localStorage`, so a Slovak visitor is never bounced
  and an English one lands on `/en/…` even from a shared unprefixed link.
- Every internal link on the page gets the prefix; the switcher navigates to the
  same page under another prefix and updates the remembered choice.
- The server serves the *same* file for every prefix and never looks at the language.

It is still commented out in every HTML `<head>`, exactly as on `main`. Enabling it
is uncommenting `<script type="module" src="/js/lang.js">`.

Known limitation of client-side i18n: a crawler fetching `/en/about-me` receives
Slovak HTML with `lang="sk"` and the English text arrives after JS runs. Angular
avoided this with one pre-rendered build per language. If EN/UK search visibility
matters, the fix is a small build step that bakes each dictionary into per-language
copies (`dist/en/about-me.html`), plus `<link rel="alternate" hreflang>` tags. Not
needed for the Slovak pages, which are already static.

## Per host

- **nginx (own server):** `deploy/nginx-frontend.conf`, `root` = the contents of
  `src/`. Run `nginx -t` first — it is a hand-written draft. It follows the
  default-deny style of `apis.conf` in the backend repo.
- **Netlify / Cloudflare Pages:** copy `deploy/_redirects` next to `index.html`.
  Both hosts serve `/about-me` from `about-me.html` on their own and serve `404.html`
  with a 404 status; the file adds the gallery and language rules.
- **Vercel:** `vercel.json` with `"cleanUrls": true`, `"trailingSlash": false` and
  `rewrites` for `/gallery/:type` and `/gallery/babies/:variant` → `/gallery.html`.
- **GitHub Pages:** no rewrites at all → option B (folders), or accept `/404` losing
  the status.

## Local

```
npm start            # http://localhost:4200, clean URLs, real 404s, 302s instead of 301s
npm run check        # node --check on every JS file (same as CI)
```

`dev.js` is the CI's `find src/js dev.js …` target again; it had been deleted.

## Open decisions (yours)

- Which host? That decides which of the two deploy files matters and whether the
  `www` / `http` server blocks in the nginx file are wanted.
- Should `/gallery` become its own page again (Angular) or stay a redirect to `/`?
- When to enable `lang.js` (uncomment the script tag once dictionaries are complete),
  and whether EN/UK need the pre-rendered variant above.
- `sitemap.xml` listing the canonical URLs — cheap, worth adding with the first release.
- Caching and security headers for the static host; deliberately not in this draft.
