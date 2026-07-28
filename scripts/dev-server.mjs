import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', 'dist');
const port = process.env.PORT ? Number(process.env.PORT) : 4200;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
  '.map': 'application/json',
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
  const requested = path.join(root, urlPath);

  // path traversal guard
  if (!requested.startsWith(root)) {
    res.writeHead(403);
    res.end();
    return;
  }

  const serveIndex = () => {
    fs.readFile(path.join(root, 'index.html'), (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': MIME['.html'] });
      res.end(data);
    });
  };

  fs.stat(requested, (statErr, stats) => {
    const filePath = !statErr && stats.isDirectory() ? path.join(requested, 'index.html') : requested;

    fs.readFile(filePath, (err, data) => {
      if (err) {
        // SPA fallback: unknown paths are client-side routes, always serve index.html
        serveIndex();
        return;
      }
      const ext = path.extname(filePath);
      res.writeHead(200, { 'Content-Type': MIME[ext] ?? 'application/octet-stream' });
      res.end(data);
    });
  });
});

server.listen(port, () => console.log(`dev server: http://localhost:${port}`));
