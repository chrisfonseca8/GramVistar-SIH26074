"use client";

import { useTranslation } from "react-i18next";

/**
 * Generic "there is nothing here" placeholder — used instead of a blank
 * screen whenever data is legitimately absent (not an error, not still
 * loading). Unavailable data must be shown
 * explicitly, never silently hidden or replaced with fabricated values.
 */
export function EmptyState({ title, description, action }) {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t("common.nothingToShow");

  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border px-6 py-10 text-center ">
      <p className="text-sm font-medium text-foreground/70">{resolvedTitle}</p>
      {description ? (
        <p className="text-sm text-foreground/50">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
