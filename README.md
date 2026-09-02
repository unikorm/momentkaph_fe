# momentkaph_fe

Frontend for [momentka.ph](https://momentkaph.sk) — Anna Lednicka's photography portfolio.

Plain ES modules, plain CSS, browser APIs only. **No framework, no dependencies, no build step.**

## Run it

```bash
npm start          # http://localhost:4200
```

That's the whole setup — there is nothing to install. `npm start` runs a small
static server from the Node standard library ([scripts/serve.js](scripts/serve.js))
that serves `src/` and falls back to `index.html` so client-side routes survive a
refresh.

```bash
npm run check      # syntax, unresolved imports, i18n key drift
npm run build      # copy src/ -> dist/ for deployment
npm run preview    # build, then serve dist/
```

## Layout

```
src/
  index.html                 the only HTML file; loads main.js as a module
  main.js                    bootstrap: load locale -> mount shell -> start router
  router.js                  History API router (path params, redirects, catch-all)
  routes.js                  the route table
  config/env.js              backend origin
  pages/<name>/<name>.page.js   one class per page: render(container, params), optional destroy()
  services/                  fetch wrappers + the i18n store
  shared/                    nav markup, carousel index tracker, matchMedia helper, static data
  i18n/{sk,en,uk}.json       flat key -> string dictionaries
  styles/                    one stylesheet per page, all linked from index.html
  assets/, fonts/
```

## How it works

- **Routing** — `router.js` intercepts same-origin link clicks, pushes to the
  History API and mounts the matching page into the outlet. Pages are classes
  with `render(container, params)` and an optional `destroy()` for teardown.
- **Templating** — pages return HTML strings assigned to `innerHTML`. Listeners
  bound to elements inside the outlet die with that markup on the next render;
  anything document- or window-scoped (a `matchMedia` listener, a `setTimeout`)
  must be released in `destroy()`.
- **i18n** — `i18n.t('some.key')` reads a flat dictionary fetched at startup.
  Switching the locale re-fetches, persists to `localStorage` and re-renders the
  current page in place. `npm run check` fails on a key that's missing from a
  dictionary or used but never defined.
- **Backend** — `https://api.momentkaph.sk` (`GET /cloud_storage/{type}`,
  `POST /email_sending`). Point it elsewhere without editing a file:
  `localStorage.setItem('apiUrl', 'http://localhost:8080')`, then reload.

## Deploying

`npm run build` writes `dist/`. Serve it as static files with one rule: **any path
that isn't a file must return `index.html`**, otherwise a refresh on
`/gallery/weddings` 404s.
