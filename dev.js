/**
 * Dev server — `node dev.js`, then open http://localhost:4200
 *
 * Needed because Chrome refuses ES modules over file:// (opaque origin), so the
 * app must come from http://. No build step: src/ IS the web root, so editing a
 * file and hitting reload is the whole loop.
 *
 * Serves index.html for any extensionless path so /gallery/weddings survives a
 * refresh, and proxies the two API paths, whose CORS allowlist names only
 * momentkaph.sk and so rejects localhost.
 */
import { createServer } from 'node:http';
import { request } from 'node:https';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.avif': 'image/avif', '.webp': 'image/webp',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json',
};

const API = 'https://api.momentkaph.sk';
const PROXY = ['/cloud_storage/', '/email_sending'];

const port = Number(process.argv[2] || process.env.PORT || 4200);
const root = resolve(process.argv.includes('--dist') ? 'dist' : 'src');
const index = join(root, 'index.html');

createServer(async (req, res) => {
  const url = req.url || '/';

  if (PROXY.some((p) => url.startsWith(p))) {
    const target = new URL(url, API);
    const up = request(target, { method: req.method, headers: { ...req.headers, host: target.host, origin: API } },
      (r) => { res.writeHead(r.statusCode || 502, r.headers); r.pipe(res); });
    up.on('error', (e) => { res.writeHead(502); res.end(`Proxy failed: ${e.message}`); });
    req.pipe(up);
    return;
  }

  // Resolve inside root only — a path that climbs out with ../ is not served.
  const path = resolve(join(root, normalize(decodeURIComponent(url.split('?')[0]))));
  let file = path === root || path.startsWith(root + sep) ? path : null;

  if (file) {
    const found = await stat(file).then((s) => s.isFile()).catch(() => false);
    // Extensionless miss = a client-side route; a miss with an extension = a real 404.
    if (!found) file = extname(file) === '' ? index : null;
  }

  if (!file) { res.writeHead(404); res.end('Not found'); return; }

  res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  createReadStream(file).pipe(res);
}).listen(port, () => console.log(`http://localhost:${port}  (serving ${root})`));
