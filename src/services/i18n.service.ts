export type SupportedLocale = 'sk' | 'en' | 'uk';

const SUPPORTED: SupportedLocale[] = ['sk', 'en', 'uk'];
const DEFAULT_LOCALE: SupportedLocale = 'sk';
const STORAGE_KEY = 'lang';

function detectLocale(): SupportedLocale {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED.includes(stored as SupportedLocale)) return stored as SupportedLocale;

  for (const lang of navigator.languages ?? [navigator.language]) {
    const prefix = lang.slice(0, 2).toLowerCase();
    if (prefix === 'ru' || prefix === 'uk') return 'uk';
    if (prefix === 'en') return 'en';
    if (prefix === 'sk') return 'sk';
  }
  return DEFAULT_LOCALE;
}

class I18nService {
  private dict: Record<string, string> = {};
  private locale: SupportedLocale = DEFAULT_LOCALE;
  private listeners = new Set<() => void>();

  async init(): Promise<void> {
    this.locale = detectLocale();
    await this.load(this.locale);
    document.documentElement.lang = this.locale;
  }

  get currentLocale(): SupportedLocale {
    return this.locale;
  }

  async setLocale(locale: SupportedLocale): Promise<void> {
    if (locale === this.locale) return;
    await this.load(locale);
    this.locale = locale;
    localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
    this.listeners.forEach((fn) => fn());
  }

  t(key: string, fallback?: string): string {
    return this.dict[key] ?? fallback ?? key;
  }

  onChange(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private async load(locale: SupportedLocale): Promise<void> {
    const res = await fetch(`/i18n/${locale}.json`);
    this.dict = res.ok ? await res.json() : {};
  }
}

export const i18n = new I18nService();
