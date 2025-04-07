import { i18nObject } from "typesafe-i18n";

import type { Formatters, Locales, TranslationFunctions, Translations } from "@/i18n/i18n-types";
import { detectLocale, loadedFormatters, loadedLocales } from "@/i18n/i18n-util";
import { loadLocale } from "@/i18n/i18n-util.sync";

const currentLocale = detectLocale();
loadLocale(currentLocale);

export const LL = i18nObject<Locales, Translations, TranslationFunctions, Formatters>(
  currentLocale,
  loadedLocales[currentLocale],
  loadedFormatters[currentLocale],
);
