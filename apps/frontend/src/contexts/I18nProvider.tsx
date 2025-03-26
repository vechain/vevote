"use client";
import { I18nContext } from "@/i18n/i18n-react";
import { loadedFormatters, loadedLocales } from "@/i18n/i18n-util";
import { useEffect, useMemo, useState } from "react";
import { i18nObject } from "typesafe-i18n";
import { TypesafeI18nProps } from "typesafe-i18n/react";

import type { Formatters, Locales, TranslationFunctions, Translations } from "@/i18n/i18n-types";
import type { I18nContextType } from "typesafe-i18n/react";
// TAKEN FROM: https://github.com/ivanhofer/typesafe-i18n/blob/main/packages/runtime/src/core-utils.mts

export const getFallbackProxy = (): TranslationFunctions =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new Proxy(Object.assign(() => "", {}) as any, {
    get: (_target, key: string) => (key === "length" ? 0 : getFallbackProxy()),
  });

export const createI18nReact = (
  translations: Record<Locales, Translations>,
  formatters: Record<Locales, Formatters> = {} as Record<Locales, Formatters>,
) => {
  const Component: React.FunctionComponent<TypesafeI18nProps<Locales>> = props => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [locale, setLocale] = useState<Locales>(null as unknown as Locales);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [LL, setLL] = useState<TranslationFunctions>(getFallbackProxy());

    const setLocal = (newLocale: Locales): void => {
      setLocale(newLocale);
      setLL(() =>
        i18nObject<Locales, Translations, TranslationFunctions, Formatters>(
          newLocale,
          translations[newLocale],
          formatters[newLocale],
        ),
      );
    };

    // Setup initial locale on build -> english
    !locale && setLocal(props.locale);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      setLocal(props.locale);
    }, [props.locale]);

    const ctx = useMemo(
      () => ({ setLocale: setLocal, locale, LL }) as I18nContextType<Locales, Translations, TranslationFunctions>,
      [LL, locale],
    );

    return <I18nContext.Provider value={ctx}>{props.children}</I18nContext.Provider>;
  };

  return Component;
};

const Provider = createI18nReact(loadedLocales, loadedFormatters);

export { Provider as I18nProvider };
