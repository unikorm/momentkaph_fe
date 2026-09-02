const SUPPORTED = ['sk', 'en', 'uk'];
const DEFAULT_LOCALE = 'sk';
const STORAGE_KEY = 'lang';

function detectLocale() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED.includes(stored)) return stored;

  for (const lang of navigator.languages ?? [navigator.language]) {
    const prefix = lang.slice(0, 2).toLowerCase();
    if (prefix === 'ru' || prefix === 'uk') return 'uk';
    if (prefix === 'en') return 'en';
    if (prefix === 'sk') return 'sk';
  }
  return DEFAULT_LOCALE;
}

class I18nService {
  #dict = {};
  #locale = DEFAULT_LOCALE;
  #listeners = new Set();

  async init() {
    this.#locale = detectLocale();
    await this.#load(this.#locale);
    document.documentElement.lang = this.#locale;
  }

  get currentLocale() {
    return this.#locale;
  }

  async setLocale(locale) {
    if (locale === this.#locale) return;
    await this.#load(locale);
    this.#locale = locale;
    localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
    this.#listeners.forEach((fn) => fn());
  }

  t(key, fallback) {
    return this.#dict[key] ?? fallback ?? key;
  }

  onChange(fn) {
    this.#listeners.add(fn);
    return () => this.#listeners.delete(fn);
  }

  async #load(locale) {
    const res = await fetch(`/i18n/${locale}.json`);
    this.#dict = res.ok ? await res.json() : {};
  }
}

export const i18n = new I18nService();
