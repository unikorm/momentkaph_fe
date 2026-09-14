/**
 * Language, for every page.
 *
 * The language is the first path segment: /en/about-me, /uk/gallery/weddings.
 * Slovak is the default and has no prefix (/about-me). The server serves the
 * same file for every prefix (see routes.js), so this module is the only thing
 * that knows a language exists.
 *
 * First visit: the browser's preference decides and the visitor is sent to
 * the matching address. That choice is remembered, so a Slovak visitor stays
 * on unprefixed URLs and an English one lands on /en/… even from a shared
 * unprefixed link. After that the URL is the source of truth — refresh, share,
 * back button and bookmarks all keep the language they were opened with.
 *
 * The Slovak text is already written into the HTML, so Slovak visitors fetch no
 * dictionary at all; other languages swap it out from /lang/<lang>.json.
 */
import { LANGS, DEFAULT_LANG, splitLang, withLang } from './routes.js';

const STORAGE_KEY = 'lang';
const { lang: fromPath } = splitLang(location.pathname);

if (fromPath !== DEFAULT_LANG) {
  remember(fromPath);
  apply(fromPath);
} else {
  const preferred = remembered() ?? detect();
  if (preferred !== DEFAULT_LANG) {
    // replace, so the wrong-language URL stays out of history
    location.replace(withLang(location.pathname, preferred) + location.search + location.hash);
  } else {
    remember(DEFAULT_LANG);
    apply(DEFAULT_LANG);
  }
}

function detect() {
  return navigator.languages
    .map((tag) => tag.split('-')[0])
    .map((base) => (base === 'ru' ? 'uk' : base))
    .find((base) => LANGS.includes(base)) ?? DEFAULT_LANG;
}

function remembered() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return LANGS.includes(value) ? value : null;
  } catch {
    return null; // storage blocked (private mode etc.) — detect every time
  }
}

function remember(lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* storage blocked — nothing to do */
  }
}

async function apply(lang) {
  document.documentElement.lang = lang;

  if (lang !== DEFAULT_LANG) {
    const dict = await (await fetch(`/lang/${lang}.json`)).json();

    for (const el of document.querySelectorAll('[data-i18n]')) {
      if (dict[el.dataset.i18n]) el.innerHTML = dict[el.dataset.i18n];
    }
    for (const el of document.querySelectorAll('[data-i18n-ph]')) {
      if (dict[el.dataset.i18nPh]) el.placeholder = dict[el.dataset.i18nPh];
    }
  }

  // Carry the language across every internal link.
  for (const a of document.querySelectorAll('a[href]')) {
    const href = new URL(a.href, location.href);
    if (href.origin !== location.origin) continue;
    href.pathname = withLang(href.pathname, lang);
    a.href = href;
  }

  // Clicking a button opens this same page in the chosen language.
  document.querySelector(`.language_switcher [data-lang="${lang}"]`)?.classList.add('activeLanguage');
  document.querySelector('.language_switcher')?.addEventListener('click', (e) => {
    const button = e.target.closest('button[data-lang]');
    if (!button) return;
    remember(button.dataset.lang);
    location.assign(withLang(location.pathname, button.dataset.lang) + location.search + location.hash);
  });
}
