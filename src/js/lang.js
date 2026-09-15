/**
 * Language, for every page.
 *
 * The language is the first path segment: /sk/about-me, /en/about-me,
 * /ua/gallery/weddings. The server guarantees it is there — an address
 * without a prefix is redirected before this script ever runs (cookie from
 * the switcher, then Accept-Language, then Slovak; see src/.htaccess). So
 * this module never detects anything: the URL is the only source of truth,
 * and refresh, share, back button and bookmarks all keep the language they
 * were opened with.
 *
 * The Slovak text is already written into the HTML, so Slovak visitors fetch
 * no dictionary at all; other languages swap it out from /lang/<tag>.json.
 */
import { DEFAULT_LANG, LANGS, splitLang, withLang } from './routes.js';

const COOKIE = 'lang';
const { lang } = splitLang(location.pathname);

if (lang) apply(lang);

async function apply(lang) {
  const tag = LANGS[lang]; // 'ua' → 'uk'
  document.documentElement.lang = tag;

  if (lang !== DEFAULT_LANG) {
    const dict = await (await fetch(`/lang/${tag}.json`)).json();

    for (const el of document.querySelectorAll('[data-i18n]')) {
      if (dict[el.dataset.i18n]) el.innerHTML = dict[el.dataset.i18n];
    }
    for (const el of document.querySelectorAll('[data-i18n-ph]')) {
      if (dict[el.dataset.i18nPh]) el.placeholder = dict[el.dataset.i18nPh];
    }
  }

  // Carry the language across every internal link (the HTML links to /sk/…).
  for (const a of document.querySelectorAll('a[href]')) {
    const href = new URL(a.href, location.href);
    if (href.origin !== location.origin) continue;
    a.setAttribute('href', withLang(href.pathname, lang) + href.search + href.hash);
  }

  // The switcher opens this same page in the chosen language and remembers
  // the choice in a cookie the server reads for prefix-less addresses.
  document.querySelector(`.language_switcher [data-lang="${lang}"]`)?.classList.add('activeLanguage');
  document.querySelector('.language_switcher')?.addEventListener('click', (e) => {
    const button = e.target.closest('button[data-lang]');
    if (!button) return;
    const next = button.dataset.lang;
    document.cookie = `${COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`;
    location.assign(withLang(location.pathname, next) + location.search + location.hash);
  });
}
