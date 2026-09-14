/**
 * The site's URL space, in one place.
 *
 *   /                          index.html      tiles + reviews (the "gallery" home)
 *   /about-me                  about-me.html
 *   /contact-me                contact-me.html
 *   /gallery                   → /                        (redirect)
 *   /gallery/babies            → /gallery/babies/baptism  (redirect)
 *   /gallery/:type             gallery.html    weddings | love-story | pregnancy | studio | family | portrait
 *   /gallery/babies/:variant   gallery.html    baptism | newborn
 *   /404                       404.html        served with a 404 status
 *
 * Any route may carry a language prefix: /en/about-me, /uk/gallery/weddings.
 * Slovak is the default and stays unprefixed; /sk/… redirects to /…
 *
 * Nothing here touches the DOM, so the same module runs in the browser
 * (gallery.js, lang.js) and in Node (dev.js). Production nginx does not run
 * JS — deploy/nginx-frontend.conf mirrors this table by hand. Add a route
 * here, add it there.
 */

export const LANGS = ['sk', 'en', 'uk'];
export const DEFAULT_LANG = 'sk';

/** Gallery types that are a page of their own: /gallery/<type>. */
export const GALLERY_TYPES = ['weddings', 'love-story', 'pregnancy', 'studio', 'family', 'portrait'];

/** Gallery sections with variants: /gallery/<section>/<variant>. */
export const GALLERY_VARIANTS = { babies: ['baptism', 'newborn'] };

/**
 * First match wins. `:name` segments are parameters; `where` restricts what a
 * parameter may be, so /gallery/anything is a 404 rather than a broken page.
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
 * → { route, params, lang, path } or null. `path` is the pathname without its
 * language prefix, which is what ROUTES are written against.
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

/** '/en/about-me' → { lang: 'en', path: '/about-me' };  '/about-me' → { lang: 'sk', path: '/about-me' }. */
export function splitLang(pathname) {
  const segments = split(pathname);
  const lang = LANGS.includes(segments[0]) ? segments.shift() : DEFAULT_LANG;
  return { lang, path: '/' + segments.join('/') };
}

/** withLang('/about-me', 'en') → '/en/about-me';  withLang('/en/about-me', 'sk') → '/about-me'. */
export function withLang(pathname, lang) {
  const { path } = splitLang(pathname);
  if (lang === DEFAULT_LANG) return path;
  return path === '/' ? `/${lang}` : `/${lang}${path}`;
}

/** '/gallery/weddings' → 'weddings';  '/gallery/babies/newborn' → 'newborn';  anything else → null. */
export function galleryTypeFrom(pathname) {
  const hit = match(pathname);
  if (!hit || hit.route.file !== 'gallery.html') return null;
  return hit.params.variant ?? hit.params.type;
}

/** galleryUrl('weddings') → '/gallery/weddings';  galleryUrl('newborn', 'en') → '/en/gallery/babies/newborn'. */
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
