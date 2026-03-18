import type { Locale } from '@/stores/language-store';
import type { TranslationKeys } from './en';
import en from './en';

const translations: Record<Locale, TranslationKeys> = {
  en,
  // Lazy-loaded translations are imported dynamically below
  pt: en, // fallback until loaded
  es: en,
  fr: en,
  zh: en,
};

let loaded = new Set<Locale>(['en']);

export async function loadTranslation(locale: Locale): Promise<TranslationKeys> {
  if (loaded.has(locale)) return translations[locale];

  try {
    const mod = await import(`./${locale}`);
    translations[locale] = mod.default;
    loaded.add(locale);
    return mod.default;
  } catch {
    return en;
  }
}

export function getTranslation(locale: Locale): TranslationKeys {
  return translations[locale] || en;
}

export { en };
export type { TranslationKeys };
