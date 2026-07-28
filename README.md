# Client

FE for momentkaph.sk — vanilla TypeScript, zero runtime dependencies, no bundler.
`tsc` compiles `src/**/*.ts` straight to native ES modules, loaded via
`<script type="module">` in the browser.

## Development

```
npm run build   # tsc + copy static assets (html/css/json/assets/fonts) into dist/
npm run serve   # serve dist/ on http://localhost:4200 with SPA fallback
npm run dev     # both of the above
npm run watch   # tsc --watch (run alongside `npm run serve` in another terminal)
npm run typecheck
```

## Structure

- `src/main.ts` — bootstraps the app: mounts the layout, starts the router.
- `src/router.ts` / `src/routes.ts` — hand-rolled client-side router (History API,
  no dependency).
- `src/pages/*/*.page.ts` — one class per route, implementing `render()`/`destroy()`.
- `src/services/` — `cloud-storage` (gallery images), `email` (contact form),
  `i18n` (sk/en/uk).
- `src/i18n/{sk,en,uk}.json` — translation dictionaries, loaded at runtime.
- `src/styles/*.css` — one stylesheet per page + `global.css`, all loaded upfront.
- `src/config/env.ts` — resolves the API base URL from `location.hostname`.

## Deployment

`npm run build` produces a static `dist/` — deploy it as-is. `.htaccess` (Apache)
handles SPA fallback routing and security/cache headers.
