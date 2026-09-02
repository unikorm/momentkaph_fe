# momentkaph_fe

Frontend for [momentka.ph](https://momentkaph.sk) — Anna Lednicka's photography portfolio.
Plain ES modules, plain CSS, browser APIs only. No framework, no dependencies.

## Working on it

```bash
node dev.js          # http://localhost:4200
```

Edit any file under `src/`, hit reload, see the change. There is no build step in
development and nothing to install — `dev.js` is one file on the Node standard library.

> **You cannot open `src/index.html` as a `file://` URL.** Chrome blocks ES modules
> from `file://` (opaque origin), so every `import` fails before the app runs and you
> get a blank page. Absolute paths like `/main.js` also resolve to your filesystem
> root there. Any app using `import` has to be served over http — hence `dev.js`.

`dev.js` also proxies `/cloud_storage/` and `/email_sending` to the real backend,
because the API's CORS allowlist names only `momentkaph.sk` and would otherwise
reject localhost. That's why galleries load locally.

## Production build

```bash
node build.js        # -> dist/
node dev.js 4300 --dist   # serve the build to check it
```

It bundles all 17 modules into one hashed classic script, inlines the 8 stylesheets
into `index.html`, and writes `.br`/`.gz` next to every text file.

| | raw | brotli |
|---|---|---|
| `app.<hash>.js` | 33 kB | **8 kB** |
| `index.html` (CSS inlined) | 15 kB | **3 kB** |
| **first paint total** | | **~11 kB** |

One request for the HTML, one for the JS, one for the locale JSON. The bundle is
content-hashed, so it can be cached forever; `index.html` should not be.

**Not minified, on purpose.** After brotli it would save roughly a kilobyte, which
does not justify a hand-rolled minifier that can break silently. If you want it:
`npx esbuild dist/app.*.js --minify --allow-overwrite --outfile=dist/app.<hash>.js`.
The output is a plain script, so nothing depends on that choice.

### Where the weight actually is

Code is ~11 kB compressed. **The images are 3.8 MB.** The gallery landing page alone
pulls six hero AVIFs of 420–610 kB each. Nothing a bundler does will matter next to
that — if you want this site faster, resize the hero images and give them
`srcset`/`sizes` so phones stop downloading 2000px files. The gallery tiles render at
roughly 500×700 on desktop.

Serving hints: enable `brotli_static`, cache `app.*.js` and `assets/` with
`immutable`, and route any path that isn't a file to `index.html` (otherwise a
refresh on `/gallery/weddings` 404s).

## Layout

```
dev.js, build.js             the entire toolchain, stdlib only
src/
  index.html                 the only HTML file
  main.js                    bootstrap: load locale -> mount shell -> start router
  router.js                  History API router (path params, redirects, catch-all)
  routes.js                  the route table
  pages/<name>/<name>.page.js   one class per page: render(container, params), optional destroy()
  services/api.js            the two backend calls + the API origin
  services/i18n.service.js   locale store
  shared/                    nav markup, carousel index tracker, matchMedia helper, static data
  i18n/{sk,en,uk}.json       flat key -> string dictionaries
  styles/                    one stylesheet per page, linked from index.html
  assets/, fonts/
```

Pages return HTML strings assigned to `innerHTML`. Listeners on elements inside the
outlet die with that markup on the next render; anything document- or window-scoped
(a `matchMedia` listener, a `setTimeout`) must be released in `destroy()`.

To point at a local backend: `localStorage.setItem('apiUrl', ...)` is gone — edit
`API` at the top of [src/services/api.js](src/services/api.js).
