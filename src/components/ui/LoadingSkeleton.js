"use client";

import { useTranslation } from "react-i18next";

/**
 * Generic pulse-loading placeholder. `lines` renders stacked bars (for
 * text-shaped content); pass `className` to size it for other shapes
 * (a chart, a map, a card).
 */
export function LoadingSkeleton({ lines = 1, className = "" }) {
  const { t } = useTranslation();
  const label = t("common.loading");

  if (lines > 1) {
    return (
      <div
        className={`flex flex-col gap-2 ${className}`}
        role="status"
        aria-label={label}
      >
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className="h-3 animate-pulse rounded bg-muted "
            style={{ width: index === lines - 1 ? "60%" : "100%" }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`animate-pulse rounded bg-muted ${className || "h-3 w-full"}`}
      role="status"
      aria-label={label}
    />
  );
}
