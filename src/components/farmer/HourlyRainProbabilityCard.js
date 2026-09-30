"use client";

import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { formatHourOnly, formatPercent } from "@/lib/formatters";

/**
 * Hourly Rain Probability card — genuinely hour-by-hour,
 * as a short list rather than a chart (unlike the daypart-bucketed
 * "Rain Chance Today" card, which exists to satisfy the mobile "touch
 * targets" requirement specifically).
 */
export function HourlyRainProbabilityCard({ hours }) {
  const { t, i18n } = useTranslation();

  return (
    <Card title={t("farmer.hourlyRain.title")}>
      <div className="flex justify-between gap-2 overflow-x-auto">
        {hours.map((hour, index) => (
          <div
            key={hour.date.toISOString()}
            className="flex flex-col items-center gap-1 text-center"
          >
            <span className="text-xs text-foreground/50">
              {index === 0
                ? t("farmer.hourlyRain.now")
                : formatHourOnly(hour.date, i18n.language)}
            </span>
            <span className="text-sm font-semibold text-blue-600">
              {formatPercent(hour.rainProbabilityPct)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
