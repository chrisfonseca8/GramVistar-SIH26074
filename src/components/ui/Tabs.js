"use client";

/**
 * Controlled tab strip. Extracted from Panchayat Deep
 * Dive's original hand-rolled tab markup, which is now the reference
 * implementation every future tabbed page should use instead of
 * recreating its own.
 *
 * `tabs` accepts either plain strings (the string is both the stable
 * identity and the displayed label — fine when the label never changes,
 * e.g. Panchayat Deep Dive's untranslated English-only tabs) or
 * `{ key, label }` objects (the Feedback confirmation screen needs
 * this: its tab labels are translated, so the *label* text can change
 * when the language switches, but `active` must keep matching a stable
 * `key`, not the label text itself).
 *
 * @param {{ tabs: (string | { key: string, label: string })[], active: string, onChange: (key: string) => void }} props
 */
export function Tabs({ tabs, active, onChange }) {
  const normalized = tabs.map((tab) =>
    typeof tab === "string" ? { key: tab, label: tab } : tab,
  );

  return (
    <div
      className="flex flex-wrap gap-1.5 overflow-x-auto rounded-full bg-surface-muted p-1"
      role="tablist"
    >
      {normalized.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          role="tab"
          aria-selected={active === key}
          onClick={() => onChange(key)}
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
            active === key
              ? "bg-primary text-primary-foreground"
              : "text-foreground/60 hover:bg-white hover:text-foreground"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
