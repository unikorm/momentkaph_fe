/**
 * "Build" = copy `src/` to `dist/`. The app ships the sources as-is: plain ES
 * modules, plain CSS, no transpiling and no bundling, so there is nothing to
 * compile — this exists only to produce a clean deployable folder.
 *
 *   node scripts/build.js
 */
import { cpSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(fileURLToPath(import.meta.url), '../..');
const src = join(projectRoot, 'src');
const dist = join(projectRoot, 'dist');

rmSync(dist, { recursive: true, force: true });
cpSync(src, dist, {
  recursive: true,
  filter: (path) => !path.endsWith('.DS_Store'),
});

console.log(`Built ${dist}`);
