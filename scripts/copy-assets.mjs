import { cpSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(__dirname, '..', 'src');
const dist = path.join(__dirname, '..', 'dist');

cpSync(src, dist, {
  recursive: true,
  filter: (source) => !source.endsWith('.ts'),
});

console.log('Copied static assets to dist/');
