#!/usr/bin/env node
/**
 * Dev server, zero dependencies:   npm start   →   http://localhost:4200
 *
 * Serves src/ the way production Apache does (src/.htaccess), driven by the
 * same route table (src/js/routes.js):
 *
 *   /                          → redirect /sk | /en | /ua  (cookie, Accept-Language, else sk)
 *   /about-me                  → redirect /<lang>/about-me  (same choice)
 *   /sk/about-me               → src/about-me.html
 *   /en/gallery/weddings       → src/gallery.html  (page reads the type from the path)
 *   /sk/gallery                → redirect /sk
 *   /sk/about-me.html  /sk/about-me/
 *                              → redirect /sk/about-me  (one address per page)
 *   /sk/assets/x.avif          → redirect /assets/x.avif  (old Angular asset addresses)
 *   anything else              → 404 status + src/404.html
 *
 * Redirects are 302 here: browsers cache 301s, which hurts while iterating.
 * Production uses 301 where the address is permanent.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_LANG, ROUTES, match, splitLang, withLang } from './src/js/routes.js';

const ROOT = fileURLToPath(new URL('./src/', import.meta.url));
const PORT = Number(process.argv[2] ?? process.env.PORT ?? 4200);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
};

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`);
  try {
    await handle(req, url, res);
  } catch (err) {
    console.error(err);
    res.writeHead(500).end('internal error');
  }
  console.log(res.statusCode, req.method, url.pathname + url.search);
}).listen(PORT, () => console.log(`momentkaph_fe → http://localhost:${PORT}`));

async function handle(req, { pathname, search }, res) {
  // Anything with an extension is a static file and is served as-is…
  if (extname(pathname)) {
    // …except .html: a page's address is its clean URL…
    if (pathname.endsWith('.html')) return redirect(res, cleanUrlFor(pathname) + search);
    // …and old Angular asset addresses, which carried the language prefix.
    const legacy = /^\/(?:sk|en|ua)(\/(?:assets|fonts)\/.+)$/.exec(pathname);
    if (legacy) return redirect(res, legacy[1] + search);
    return sendFile(res, pathname);
  }

  const { lang, path } = splitLang(pathname);

  // No language in the address → choose one, the same way .htaccess does.
  if (!lang) return redirect(res, withLang(path, pickLang(req)) + search);

  // One address per page: no trailing slash.
  const canonical = withLang(path, lang);
  if (pathname !== canonical) return redirect(res, canonical + search);

  const hit = match(pathname);
  if (!hit) return sendFile(res, '/404.html', 404);
  if (hit.route.redirect) return redirect(res, withLang(hit.route.redirect, lang) + search);
  return sendFile(res, '/' + hit.route.file, hit.route.status ?? 200);
}

/** The switcher's cookie, else Accept-Language, else Slovak — same order as .htaccess. */
function pickLang({ headers }) {
  const cookie = /(?:^|;\s*)lang=(sk|en|ua)(?:;|$)/.exec(headers.cookie ?? '')?.[1];
  if (cookie) return cookie;

  const accept = (headers['accept-language'] ?? '').toLowerCase();
  if (/^(uk|ru)/.test(accept)) return 'ua';
  if (/^en/.test(accept)) return 'en';
  return DEFAULT_LANG;
}

/** '/sk/about-me.html' → '/sk/about-me';  '/en/index.html' → '/en';  '/about-me.html' → '/about-me' (then the language redirect). */
function cleanUrlFor(pathname) {
  const { lang, path } = splitLang(pathname);
  const route = ROUTES.find((r) => r.file === path.slice(1) && !r.path.includes(':'));
  const clean = route?.path ?? '/';
  return lang ? withLang(clean, lang) : clean;
}

async function sendFile(res, pathname, status = 200) {
  const file = join(ROOT, normalize(decodeURIComponent(pathname)));
  if (!file.startsWith(ROOT)) return sendFile(res, '/404.html', 404); // no escaping src/

  let body;
  try {
    body = await readFile(file);
  } catch (err) {
    if (err.code !== 'ENOENT' && err.code !== 'EISDIR') throw err;
    if (status === 404) return res.writeHead(404).end('404'); // 404.html itself is missing
    return sendFile(res, '/404.html', 404);
  }

  res.writeHead(status, {
    'Content-Type': MIME[extname(file)] ?? 'application/octet-stream',
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function redirect(res, location) {
  res.writeHead(302, { Location: location });
  res.end();
}
