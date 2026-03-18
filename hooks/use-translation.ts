'use client';

import { useEffect, useState, useCallback } from 'react';
import { useLanguageStore, type Locale } from '@/stores/language-store';
import { getTranslation, loadTranslation, type TranslationKeys } from '@/i18n';

export function useTranslation() {
  const locale = useLanguageStore((s) => s.locale);
  const [translations, setTranslations] = useState<TranslationKeys>(() => getTranslation(locale));

  useEffect(() => {
    loadTranslation(locale).then(setTranslations);
  }, [locale]);

  const t = useCallback(
    <S extends keyof TranslationKeys>(
      section: S,
      key: keyof TranslationKeys[S],
      params?: Record<string, string | number>
    ): string => {
      const sectionObj = translations[section];
      let value = (sectionObj as Record<string, string>)[key as string] || (key as string);

      if (params) {
        for (const [k, v] of Object.entries(params)) {
          value = value.replace(`{${k}}`, String(v));
        }
      }

      return value;
    },
    [translations]
  );

  return { t, locale };
}
