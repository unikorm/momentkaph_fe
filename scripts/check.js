/**
 * Zero-dependency sanity check, run in CI and by `npm run check`.
 *
 * Without a compiler, three classes of mistake would otherwise only show up in
 * the browser, so they get checked here instead:
 *   1. syntax errors in any source file,
 *   2. a relative import pointing at a file that doesn't exist,
 *   3. an i18n key used in code but missing from a dictionary (or the three
 *      dictionaries drifting apart).
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(fileURLToPath(import.meta.url), '../..');
const src = join(projectRoot, 'src');
const errors = [];

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const jsFiles = [...walk(src), ...walk(join(projectRoot, 'scripts'))].filter((f) => extname(f) === '.js');

// 1. Syntax
for (const file of jsFiles) {
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
  } catch (err) {
    errors.push(`syntax: ${relative(projectRoot, file)}\n${err.stderr?.toString().trim()}`);
  }
}

// 2. Relative imports resolve
const IMPORT_RE = /(?:^|\s)(?:import|export)\s[^'"]*?from\s*['"](\.[^'"]+)['"]/gm;
for (const file of jsFiles) {
  const code = readFileSync(file, 'utf8');
  for (const [, spec] of code.matchAll(IMPORT_RE)) {
    if (!existsSync(resolve(dirname(file), spec))) {
      errors.push(`unresolved import: ${relative(projectRoot, file)} → ${spec}`);
    }
  }
}

// 3. i18n dictionaries agree, and every statically-written key exists
const localeFiles = readdirSync(join(src, 'i18n')).filter((f) => f.endsWith('.json'));
const dicts = Object.fromEntries(
  localeFiles.map((f) => [f.replace('.json', ''), JSON.parse(readFileSync(join(src, 'i18n', f), 'utf8'))]),
);
const [baseLocale, ...otherLocales] = Object.keys(dicts);
const baseKeys = Object.keys(dicts[baseLocale]);

for (const locale of otherLocales) {
  for (const key of baseKeys) {
    if (!(key in dicts[locale])) errors.push(`i18n: '${key}' missing from ${locale}.json`);
  }
  for (const key of Object.keys(dicts[locale])) {
    if (!(key in dicts[baseLocale])) errors.push(`i18n: '${key}' in ${locale}.json but not ${baseLocale}.json`);
  }
}

// Only literal keys are checkable; keys built with template literals (the wedding
// description/tips loops) are covered by the count constants in gallery-type.data.js.
const T_CALL_RE = /i18n\.t\(\s*'([^']+)'/g;
for (const file of jsFiles) {
  for (const [, key] of readFileSync(file, 'utf8').matchAll(T_CALL_RE)) {
    if (!(key in dicts[baseLocale])) {
      errors.push(`i18n: '${key}' used in ${relative(projectRoot, file)} but not defined`);
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  console.error(`\n${errors.length} problem(s) found.`);
  process.exit(1);
}
console.log(`OK — ${jsFiles.length} JS files, ${localeFiles.length} locales, ${baseKeys.length} keys.`);
