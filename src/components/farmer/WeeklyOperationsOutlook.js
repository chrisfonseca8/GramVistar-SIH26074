"use client";

import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { RISK_COLORS } from "@/lib/riskLevels";

const FROST_LEVEL_TO_COLOR = {
  green: null,
  yellow: RISK_COLORS.yellow,
  orange: RISK_COLORS.orange,
  red: RISK_COLORS.red,
};

function formatDayLabel(dateKey) {
  return new Date(dateKey).toLocaleDateString("en-IN", {
    weekday: "short",
    timeZone: "UTC",
  });
}

/**
 * Mobile version of the Scientist portal's Plot 12 (Farm Operations
 * Window Matrix). Same one-representative-afternoon-per-
 * day approach and the same calculation functions, shown as a simple
 * YES/NO list instead of a dense heatmap (which doesn't read well on a
 * phone and needs a legend to interpret).
 */
export function WeeklyOperationsOutlook({ days }) {
  const { t } = useTranslation();

  return (
    <Card title={t("farmer.operationsOutlook.title")}>
      <div className="space-y-2">
        {days.map((day) => (
          <div
            key={day.dateKey}
            className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm "
          >
            <span className="w-12 shrink-0 font-medium">
              {formatDayLabel(day.dateKey)}
            </span>
            <DecisionPill
              label={t("farmer.operationsOutlook.spray")}
              result={day.spray}
              valueKey="favorable"
            />
            <DecisionPill
              label={t("farmer.operationsOutlook.irrigate")}
              result={day.irrigate}
              valueKey="irrigate"
            />
            {day.frostRiskLevel && FROST_LEVEL_TO_COLOR[day.frostRiskLevel] ? (
              <span
                className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
                style={{
                  backgroundColor: FROST_LEVEL_TO_COLOR[day.frostRiskLevel],
                }}
              >
                {t("farmer.operationsOutlook.frost")}
              </span>
            ) : (
              <span className="w-12 shrink-0" aria-hidden="true" />
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

function DecisionPill({ label, result, valueKey }) {
  if (!result?.available) {
    return (
      <span className="w-16 shrink-0 text-center text-xs text-foreground/30">
        {label}: —
      </span>
    );
  }

  const decision = Boolean(result.value[valueKey]);

  return (
    <span
      className={`w-16 shrink-0 rounded-full px-2 py-0.5 text-center text-xs font-medium ${
        decision
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : "bg-muted text-foreground/50 "
      }`}
    >
      {label}
    </span>
  );
}
