import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * The globally selected UI language. This only builds the switch and
 * this piece of state; wiring it up to actual translated strings via
 * react-i18next is a separate, later piece of work.
 */
export const useLanguageStore = create(
  persist(
    (set) => ({
      /** @type {"en"| "hi"} */
      language: "en",

      /** @param {"en"| "hi"} language */
      setLanguage(language) {
        set({ language });
      },
    }),
    {
      name: "chas-language-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
