"use client";

import { useLanguageStore } from "@/store/languageStore";

const OPTIONS = [
  { code: "en", label: "EN" },
  { code: "hi", label: "HI" },
];

/**
 * Toggles the globally selected UI language. This only flips the shared
 * `languageStore` state for now — actual translated strings are wired up
 * separately by react-i18next.
 */
export function LanguageSwitch() {
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  return (
    <div
      className="flex overflow-hidden rounded-full border border-border text-xs font-medium "
      role="group"
      aria-label="Language"
    >
      {OPTIONS.map((option) => (
        <button
          key={option.code}
          type="button"
          onClick={() => setLanguage(option.code)}
          aria-pressed={language === option.code}
          className={`px-3 py-1.5 transition ${
            language === option.code
              ? "bg-primary text-primary-foreground"
              : "text-foreground/60 hover:text-foreground"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
