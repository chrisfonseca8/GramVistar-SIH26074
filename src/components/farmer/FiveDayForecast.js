"use client";

import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatPercent, formatTemperature } from "@/lib/formatters";

function formatDayLabel(dateKey) {
  return new Date(dateKey).toLocaleDateString("en-IN", {
    weekday: "short",
    timeZone: "UTC",
  });
}

/**
 * A simplified 5-day daily forecast strip — day, high/low
 * temperature and rain chance only. This is the Farmer-facing companion
 * to the Scientist portal's hourly Forecast Explorer, deliberately
 * collapsed to daily granularity with no per-hour detail.
 */
export function FiveDayForecast({ days }) {
  const { t } = useTranslation();

  if (!days || days.length === 0) {
    return (
      <Card title={t("farmer.forecast.title")}>
        <EmptyState title={t("farmer.forecast.unavailable")} />
      </Card>
    );
  }

  return (
    <Card title={t("farmer.forecast.title")}>
      <div className="grid grid-cols-5 gap-2 text-center">
        {days.map((day) => (
          <div
            key={day.dateKey}
            className="rounded-md border border-border p-2 "
          >
            <p className="text-xs text-foreground/50">
              {formatDayLabel(day.dateKey)}
            </p>
            <p className="mt-1 text-sm font-semibold">
              {formatTemperature(day.tempMaxC)}
            </p>
            <p className="text-xs text-foreground/50">
              {formatTemperature(day.tempMinC)}
            </p>
            <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
              {formatPercent(day.rainProbabilityMaxPct)}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
