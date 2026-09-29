import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "@/i18n/locales/en.json";
import hi from "@/i18n/locales/hi.json";

/**
 * react-i18next setup. Resources are bundled directly
 * (no async backend/HTTP loader) since the translated string set is small
 * — this also means there is nothing to fetch, so language switching is
 * instant. The instance always initializes to English so server and
 * client render the same markup on first paint; `I18nProvider` syncs it
 * to the persisted `languageStore` value after mount.
 */
if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
    },
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    returnEmptyString: false,
  });
}

export default i18n;
