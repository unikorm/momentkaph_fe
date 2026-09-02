/**
 * Production build — `node build.js`, output in dist/.
 *
 * Zero dependencies. It does the three things that actually move the needle for
 * a site this size:
 *   1. bundles every ES module into one classic script, so the browser makes a
 *      single request instead of 22 and never walks the import waterfall,
 *   2. inlines all CSS into index.html, removing a render-blocking round trip,
 *   3. content-hashes the bundle and pre-compresses every text file with brotli
 *      and gzip, so a host with brotli_static serves the small copy directly.
 *
 * Deliberately NOT minified: after brotli it would save on the order of a
 * kilobyte, and a hand-rolled minifier is a silent-breakage risk that isn't
 * worth a kilobyte. Run `npx esbuild --minify` over dist/app.*.js if you ever
 * want it — the bundle is a plain script, so nothing depends on that choice.
 */
import { readFileSync, writeFileSync, rmSync, mkdirSync, cpSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { brotliCompressSync, gzipSync, constants } from 'node:zlib';
import { dirname, join, relative, resolve } from 'node:path';

const SRC = resolve('src');
const DIST = resolve('dist');
const ENTRY = join(SRC, 'main.js');

// ---------------------------------------------------------------- JS bundling

const IMPORT_RE = /^import\s+(?:(\{[^}]*\})|(\w+))\s+from\s+['"]([^'"]+)['"];?[ \t]*$/gm;

/** A stable JS identifier for a module, derived from its path relative to src/. */
const idOf = (file) => '_' + relative(SRC, file).replace(/[^a-zA-Z0-9]/g, '_');

const modules = new Map(); // absolute path -> { code, deps }

function collect(file) {
  if (modules.has(file)) return;
  const source = readFileSync(file, 'utf8');
  const deps = [];

  // Turn each `import ... from './x.js'` into a binding off the dependency's
  // exports object, and record the edge so the emit order can be topological.
  const code = source.replace(IMPORT_RE, (_, named, def, spec) => {
    const dep = resolve(dirname(file), spec);
    deps.push(dep);
    return named ? `const ${named} = ${idOf(dep)};` : `const ${def} = ${idOf(dep)}.default;`;
  });

  modules.set(file, { code, deps });
  deps.forEach(collect);
}

/** Strips the `export` keyword and returns the names the module exposes. */
function rewriteExports(code) {
  const names = new Set();
  let out = code
    .replace(/^export\s+default\s+(class|function)\s+(\w+)/gm, (_, kind, name) => {
      names.add(`default: ${name}`);
      return `${kind} ${name}`;
    })
    .replace(/^export\s+(async\s+function|function|class|const|let)\s+(\w+)/gm, (_, kind, name) => {
      names.add(name);
      return `${kind} ${name}`;
    });

  if (/^export\s/m.test(out)) throw new Error(`Unhandled export form:\n${out.match(/^export\s.*/m)[0]}`);
  return { code: out, names: [...names] };
}

function bundle() {
  collect(ENTRY);

  const ordered = [];
  const seen = new Set();
  (function visit(file) {
    if (seen.has(file)) return;
    seen.add(file);
    modules.get(file).deps.forEach(visit); // dependencies first
    ordered.push(file);
  })(ENTRY);

  const body = ordered.map((file) => {
    const { code, names } = rewriteExports(modules.get(file).code);
    return `// ${relative(SRC, file)}\nconst ${idOf(file)} = (() => {\n${code}\nreturn { ${names.join(', ')} };\n})();`;
  }).join('\n\n');

  return `(() => {\n'use strict';\n${body}\n})();\n`;
}

// --------------------------------------------------------------- CSS + assets

/** Safe for CSS: no regex/template ambiguity, so comments and slack whitespace just go. */
const minifyCss = (css) => css
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\s*([{}:;,>])\s*/g, '$1')
  .replace(/;}/g, '}')
  .replace(/\s+/g, ' ')
  .trim();

// ---------------------------------------------------------------------- build

rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });

const html = readFileSync(join(SRC, 'index.html'), 'utf8');

// CSS in <link> order, so the cascade is preserved exactly as the browser saw it.
const sheets = [...html.matchAll(/<link rel="stylesheet" href="\/styles\/([^"]+)">/g)].map((m) => m[1]);
const css = minifyCss(sheets.map((f) => readFileSync(join(SRC, 'styles', f), 'utf8')).join('\n'));

const js = bundle();
const hash = createHash('sha256').update(js).digest('hex').slice(0, 8);
const jsName = `app.${hash}.js`;
writeFileSync(join(DIST, jsName), js);

const outHtml = html
  .replace(/\s*<link rel="stylesheet"[^>]*>/g, '')
  .replace('</head>', `  <style>${css}</style>\n</head>`)
  .replace('<script type="module" src="/main.js"></script>', `<script src="/${jsName}" defer></script>`)
  .replace(/\n\s*\n/g, '\n');
writeFileSync(join(DIST, 'index.html'), outHtml);

for (const dir of ['assets', 'fonts', 'i18n']) cpSync(join(SRC, dir), join(DIST, dir), { recursive: true });

// Pre-compress text: a host with brotli_static/gzip_static serves these as-is.
const COMPRESSIBLE = /\.(js|css|html|json|svg|webmanifest)$/;
const walk = (d) => readdirSync(d, { withFileTypes: true })
  .flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));

let raw = 0, br = 0;
for (const file of walk(DIST)) {
  if (!COMPRESSIBLE.test(file)) continue;
  const buf = readFileSync(file);
  const brotli = brotliCompressSync(buf, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } });
  writeFileSync(`${file}.br`, brotli);
  writeFileSync(`${file}.gz`, gzipSync(buf, { level: 9 }));
  raw += buf.length;
  br += brotli.length;
}

const kb = (n) => `${(n / 1024).toFixed(1)} kB`;
const assetBytes = walk(DIST).filter((f) => /assets|fonts/.test(f)).reduce((n, f) => n + statSync(f).size, 0);

console.log(`dist/${jsName}   ${kb(statSync(join(DIST, jsName)).size)}  (${modules.size} modules)`);
console.log(`dist/index.html  ${kb(Buffer.byteLength(outHtml))}  (CSS inlined from ${sheets.length} files)`);
console.log(`\ncode  ${kb(raw)} raw -> ${kb(br)} brotli`);
console.log(`media ${kb(assetBytes)}  <- the actual weight of this site`);
