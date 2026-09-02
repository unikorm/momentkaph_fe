/**
 * Zero-dependency static server for the app (Node stdlib only).
 *
 * There is no build step: `src/` IS the web root, so every path in index.html
 * ('/main.js', '/styles/...', '/assets/...', '/i18n/...') resolves straight to
 * a file on disk. Any request that isn't a file falls back to index.html, which
 * is what makes the client-side routes (/gallery/weddings, /about-me, ...)
 * survive a hard refresh or a pasted URL.
 *
 * It also proxies the backend paths (see PROXY_PREFIXES): the API's CORS
 * allowlist only names momentkaph.sk, so a direct call from localhost is
 * blocked by the browser. Going through this same-origin proxy sidesteps that
 * and lets the galleries and the contact form work in local development.
 *
 *   node scripts/serve.js [port] [--root dir] [--api origin]
 */
import { createServer, request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.webmanifest': 'application/manifest+json',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
};

/** Request paths handed to the backend instead of the filesystem. Must match the services in src/services/. */
const PROXY_PREFIXES = ['/cloud_storage/', '/email_sending'];

function flag(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? fallback : process.argv[i + 1];
}

const projectRoot = resolve(fileURLToPath(import.meta.url), '../..');
const root = resolve(flag('root', join(projectRoot, 'src')));
const apiOrigin = new URL(flag('api', process.env.API_URL ?? 'https://api.momentkaph.sk'));
const port = Number(process.argv.slice(2).find((a) => /^\d+$/.test(a)) ?? process.env.PORT ?? 4200);

const indexHtml = join(root, 'index.html');

/** Resolves a URL path to a file inside `root`, or null if it escapes the root. */
function toFilePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const candidate = resolve(join(root, normalize(decoded)));
  if (candidate !== root && !candidate.startsWith(root + sep)) return null;
  return candidate;
}

async function fileToServe(urlPath) {
  const candidate = toFilePath(urlPath);
  if (!candidate) return null;
  try {
    if ((await stat(candidate)).isFile()) return candidate;
  } catch {
    /* falls through to the SPA fallback below */
  }
  // An unknown path with a file extension is a genuine 404 (a missing asset), not a route.
  return extname(candidate) === '' ? indexHtml : null;
}

function proxy(req, res) {
  const target = new URL(req.url, apiOrigin);
  const send = target.protocol === 'https:' ? httpsRequest : httpRequest;

  const upstream = send(
    target,
    { method: req.method, headers: { ...req.headers, host: target.host, origin: apiOrigin.origin } },
    (upstreamRes) => {
      res.writeHead(upstreamRes.statusCode ?? 502, upstreamRes.headers);
      upstreamRes.pipe(res);
    },
  );

  upstream.on('error', (err) => {
    console.error(`proxy ${req.method} ${req.url} → ${err.message}`);
    res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('502 Bad Gateway');
  });

  req.pipe(upstream);
}

const server = createServer(async (req, res) => {
  const url = req.url ?? '/';

  if (PROXY_PREFIXES.some((prefix) => url.startsWith(prefix))) {
    proxy(req, res);
    return;
  }

  const file = await fileToServe(url);
  if (!file) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
    return;
  }

  res.writeHead(200, {
    'Content-Type': MIME_TYPES[extname(file)] ?? 'application/octet-stream',
    // Dev server: never cache, so a reload always picks up the edit you just made.
    'Cache-Control': 'no-store',
  });
  createReadStream(file).pipe(res);
});

server.listen(port, () => {
  console.log(`momentkaph_fe  serving ${root}`);
  console.log(`               proxying ${PROXY_PREFIXES.join(', ')} → ${apiOrigin.origin}`);
  console.log(`               → http://localhost:${port}`);
});
