"use client";

import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n/config";
import { useLanguageStore } from "@/store/languageStore";

/**
 * Wires the app's persisted `languageStore` language into react-i18next.
 * i18next always starts at "en" (see `src/i18n/config.js`
 * for why); this effect pushes the real persisted choice in after mount,
 * and keeps pushing it whenever `LanguageSwitch` changes it.
 */
export function I18nProvider({ children }) {
  const language = useLanguageStore((state) => state.language);

  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
