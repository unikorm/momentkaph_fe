/**
 * Language, for every page.
 *
 * The language lives in the URL (?lang=sk). On a first visit there is nothing
 * there yet, so the browser's own preference decides and gets written into the
 * URL. After that the URL is the only source of truth — refresh, share, back
 * button and bookmarks all keep the language they were opened with.
 *
 * The Slovak text is already written into the HTML, so Slovak visitors fetch no
 * dictionary at all; other languages swap it out from i18n/<lang>.json.
 */
const SUPPORTED = ['sk', 'en', 'uk'];
const DEFAULT = 'sk';

const url = new URL(location.href);
const requested = url.searchParams.get('lang');

if (SUPPORTED.includes(requested)) {
  apply(requested);
} else {
  url.searchParams.set('lang', detect());
  location.replace(url); // replace, so the language-less URL stays out of history
}

function detect() {
  return navigator.languages
    .map((tag) => tag.split('-')[0])
    .map((base) => (base === 'ru' ? 'uk' : base))
    .find((base) => SUPPORTED.includes(base)) ?? DEFAULT;
}

async function apply(lang) {
  document.documentElement.lang = lang;

  if (lang !== DEFAULT) {
    const dict = await (await fetch(`i18n/${lang}.json`)).json();

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
    if (href.origin === location.origin) {
      href.searchParams.set('lang', lang);
      a.href = href;
    }
  }

  // Clicking a button reloads this same page in the chosen language.
  document.querySelector(`.language_switcher [data-lang="${lang}"]`)?.classList.add('activeLanguage');
  document.querySelector('.language_switcher')?.addEventListener('click', (e) => {
    const button = e.target.closest('button[data-lang]');
    if (!button) return;
    const next = new URL(location.href);
    next.searchParams.set('lang', button.dataset.lang);
    location.assign(next);
  });
}
