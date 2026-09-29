"use client";

import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { formatPercent } from "@/lib/formatters";

/**
 * Mobile-simplified version of the Scientist portal's Plot 8 (Rainfall
 * Probability Distribution). Today's hourly rain
 * probability collapsed into 4 large dayparts instead of 24 tiny hourly
 * bars, which would fail the mobile "touch targets" requirement on a phone.
 */
export function RainChanceToday({ dayparts }) {
  const { t } = useTranslation();

  return (
    <Card title={t("farmer.rainChance.title")}>
      <div className="grid grid-cols-4 gap-2 text-center">
        {dayparts.map((part) => (
          <div key={part.key} className="rounded-md border border-border p-3 ">
            <p className="text-xs text-foreground/50">
              {t(`farmer.rainChance.${part.key}`)}
            </p>
            <p className="mt-1 text-lg font-semibold text-blue-600 dark:text-blue-400">
              {formatPercent(part.rainProbabilityPct)}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
