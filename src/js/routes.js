/**
 * The site's URL space, in one place.
 *
 * Every page address carries a language prefix — /sk/…, /en/…, /ua/… — and
 * all three serve the same file; js/lang.js reads the prefix and swaps the
 * text. An address without a prefix gets one from the server (302, chosen
 * from the switcher's cookie, then Accept-Language, then Slovak).
 *
 *   /sk                           index.html      tiles + reviews (the "gallery" home)
 *   /sk/about-me                  about-me.html
 *   /sk/contact-me                contact-me.html
 *   /sk/gallery                   → /sk                       (redirect)
 *   /sk/gallery/babies            → /sk/gallery/babies/baptism (redirect)
 *   /sk/gallery/:type             gallery.html    weddings | love-story | pregnancy | studio | family | portrait
 *   /sk/gallery/babies/:variant   gallery.html    baptism | newborn
 *   /sk/404                       404.html        served with a 404 status
 *
 * Nothing here touches the DOM, so the same module runs in the browser
 * (gallery.js, lang.js) and in Node (dev.js). Production Apache does not run
 * JS — src/.htaccess mirrors this table by hand. Add a route here, add it there.
 */

/**
 * URL prefix → language tag. 'ua' is the address Google already knows from
 * the Angular site; 'uk' is the code for Ukrainian (<html lang>, lang/uk.json).
 */
export const LANGS = { sk: 'sk', en: 'en', ua: 'uk' };
export const DEFAULT_LANG = 'sk';
export const PREFIXES = Object.keys(LANGS);

/** Gallery types that are a page of their own: /<lang>/gallery/<type>. */
export const GALLERY_TYPES = ['weddings', 'love-story', 'pregnancy', 'studio', 'family', 'portrait'];

/** Gallery sections with variants: /<lang>/gallery/<section>/<variant>. */
export const GALLERY_VARIANTS = { babies: ['baptism', 'newborn'] };

/**
 * Written against the path WITHOUT its language prefix. First match wins.
 * `:name` segments are parameters; `where` restricts what a parameter may be,
 * so /sk/gallery/anything is a 404 rather than a broken page.
 */
export const ROUTES = [
  { path: '/', file: 'index.html' },
  { path: '/about-me', file: 'about-me.html' },
  { path: '/contact-me', file: 'contact-me.html' },
  { path: '/gallery', redirect: '/' },
  { path: '/gallery/babies', redirect: '/gallery/babies/baptism' },
  { path: '/gallery/:type', file: 'gallery.html', where: { type: GALLERY_TYPES } },
  { path: '/gallery/babies/:variant', file: 'gallery.html', where: { variant: GALLERY_VARIANTS.babies } },
  { path: '/404', file: '404.html', status: 404 },
];

/**
 * Resolve a pathname against ROUTES.
 * → { route, params, lang, path } or null. `lang` is the prefix ('sk' | 'en' |
 * 'ua') or null when the address has none; `path` is the rest.
 */
export function match(pathname) {
  const { lang, path } = splitLang(pathname);
  const segments = split(path);

  for (const route of ROUTES) {
    const params = matchPattern(route.path, segments, route.where);
    if (params) return { route, params, lang, path };
  }
  return null;
}

/** '/en/about-me' → { lang: 'en', path: '/about-me' };  '/about-me' → { lang: null, path: '/about-me' }. */
export function splitLang(pathname) {
  const segments = split(pathname);
  const lang = PREFIXES.includes(segments[0]) ? segments.shift() : null;
  return { lang, path: '/' + segments.join('/') };
}

/** withLang('/about-me', 'en') → '/en/about-me';  withLang('/en/about-me', 'sk') → '/sk/about-me';  withLang('/', 'sk') → '/sk'. */
export function withLang(pathname, lang) {
  const { path } = splitLang(pathname);
  return path === '/' ? `/${lang}` : `/${lang}${path}`;
}

/** '/sk/gallery/weddings' → 'weddings';  '/ua/gallery/babies/newborn' → 'newborn';  anything else → null. */
export function galleryTypeFrom(pathname) {
  const hit = match(pathname);
  if (!hit || hit.route.file !== 'gallery.html') return null;
  return hit.params.variant ?? hit.params.type;
}

/** galleryUrl('weddings') → '/sk/gallery/weddings';  galleryUrl('newborn', 'en') → '/en/gallery/babies/newborn'. */
export function galleryUrl(type, lang = DEFAULT_LANG) {
  const section = Object.keys(GALLERY_VARIANTS).find((name) => GALLERY_VARIANTS[name].includes(type));
  return withLang(section ? `/gallery/${section}/${type}` : `/gallery/${type}`, lang);
}

function split(pathname) {
  return pathname.split('/').filter(Boolean);
}

function matchPattern(pattern, segments, where = {}) {
  const parts = split(pattern);
  if (parts.length !== segments.length) return null;

  const params = {};
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].startsWith(':')) {
      const name = parts[i].slice(1);
      if (where[name] && !where[name].includes(segments[i])) return null;
      params[name] = segments[i];
    } else if (parts[i] !== segments[i]) {
      return null;
    }
  }
  return params;
}
