"use client";

import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";

function formatDayLabel(dateKey) {
  return new Date(dateKey).toLocaleDateString("en-IN", {
    weekday: "short",
    timeZone: "UTC",
  });
}

/**
 * Irrigation Schedule card — a plain-language day list
 * built from the same irrigation decision `selectWeeklyOperationsOutlook`
 * already computes, not a re-derivation.
 */
export function IrrigationScheduleCard({ days }) {
  const { t } = useTranslation();

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
                  ? "border-blue-300 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/30"
                  : "border-border "
              }`}
            >
              <p className="text-xs text-foreground/50">
                {formatDayLabel(day.dateKey)}
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
