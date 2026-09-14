#!/usr/bin/env node
/**
 * Dev server, zero dependencies:   npm start   →   http://localhost:4200
 *
 * Serves src/ the way production does (deploy/nginx-frontend.conf), driven by
 * the same route table (src/js/routes.js):
 *
 *   /about-me                              → src/about-me.html
 *   /gallery/weddings                      → src/gallery.html  (page reads the type from the path)
 *   /gallery                               → redirect /
 *   /about-me.html  /about-me/  /sk/about-me
 *                                          → redirect /about-me  (one address per page)
 *   /en/…  /uk/…                           → same files, prefix kept
 *   anything else                          → 404 status + src/404.html
 *
 * Redirects are 302 here: browsers cache 301s, which hurts while iterating.
 * Production uses 301.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROUTES, match, splitLang, withLang } from './src/js/routes.js';

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
    await handle(url, res);
  } catch (err) {
    console.error(err);
    res.writeHead(500).end('internal error');
  }
  console.log(res.statusCode, req.method, url.pathname + url.search);
}).listen(PORT, () => console.log(`momentkaph_fe → http://localhost:${PORT}`));

async function handle({ pathname, search }, res) {
  // Anything with an extension is a static file and is served as-is…
  if (extname(pathname)) {
    // …except .html: a page's address is its clean URL.
    if (pathname.endsWith('.html')) return redirect(res, cleanUrlFor(pathname) + search);
    return sendFile(res, pathname);
  }

  // One address per page: no trailing slash, no /sk/ prefix.
  const { lang, path } = splitLang(pathname);
  const canonical = withLang(path, lang);
  if (pathname !== canonical) return redirect(res, canonical + search);

  const hit = match(pathname);
  if (!hit) return sendFile(res, '/404.html', 404);
  if (hit.route.redirect) return redirect(res, withLang(hit.route.redirect, lang) + search);
  return sendFile(res, '/' + hit.route.file, hit.route.status ?? 200);
}

/** '/about-me.html' → '/about-me';  '/index.html' → '/';  '/en/gallery.html' → '/en'. */
function cleanUrlFor(pathname) {
  const { lang, path } = splitLang(pathname);
  const route = ROUTES.find((r) => r.file === path.slice(1) && !r.path.includes(':'));
  return withLang(route?.path ?? '/', lang);
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
