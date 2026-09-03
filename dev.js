/**
 * Local server — `node dev.js`, then http://localhost:4200
 *
 * Needed only because Chrome refuses ES modules and fetch() over file://.
 * It serves src/ as-is and proxies the two backend paths, whose CORS allowlist
 * names momentkaph.sk and so rejects localhost.
 */
import { createServer } from 'node:http';
import { request } from 'node:https';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.avif': 'image/avif', '.png': 'image/png',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json',
};

const API = 'https://api.momentkaph.sk';
const root = resolve('src');

createServer(async (req, res) => {
  const path = req.url.split('?')[0];

  if (path.startsWith('/cloud_storage/') || path.startsWith('/email_sending')) {
    const target = new URL(req.url, API);
    const up = request(target, { method: req.method, headers: { ...req.headers, host: target.host, origin: API } },
      (r) => { res.writeHead(r.statusCode, r.headers); r.pipe(res); });
    up.on('error', () => { res.writeHead(502); res.end('Proxy failed'); });
    req.pipe(up);
    return;
  }

  const file = join(root, path === '/' ? 'index.html' : decodeURIComponent(path));
  try {
    if (!file.startsWith(root)) throw new Error('outside root');
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': MIME['.html'] });
    res.end(await readFile(join(root, '404.html')));
  }
}).listen(4200, () => console.log('http://localhost:4200'));
