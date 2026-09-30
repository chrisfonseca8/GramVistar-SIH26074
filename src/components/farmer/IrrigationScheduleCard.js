"use client";

import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { formatDayLabel } from "@/lib/formatters";

/**
 * Irrigation Schedule card — a plain-language day list
 * built from the same irrigation decision `selectWeeklyOperationsOutlook`
 * already computes, not a re-derivation.
 */
export function IrrigationScheduleCard({ days }) {
  const { t, i18n } = useTranslation();

  return (
    <Card title={t("farmer.irrigationSchedule.title")}>
      <div className="grid grid-cols-5 gap-2 text-center">
        {days.map((day) => {
          const decision = day.irrigate.available
            ? day.irrigate.value.irrigate
            : null;
          return (
            <div
              key={day.dateKey}
              className={`rounded-md border p-2 ${
                decision
                  ? "border-blue-300 bg-blue-50 text-blue-900"
                  : "border-border bg-surface text-foreground"
              }`}
            >
              <p className="text-xs opacity-70">
                {formatDayLabel(day.dateKey, i18n.language)}
              </p>
              <p className="mt-1 text-xs font-semibold">
                {decision === null
                  ? "—"
                  : decision
                    ? t("farmer.irrigationSchedule.water")
                    : t("farmer.irrigationSchedule.skip")}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
