"use client";

import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { RISK_COLORS } from "@/lib/riskLevels";

const SEVERITY_TO_COLOR = {
  yellow: RISK_COLORS.yellow,
  orange: RISK_COLORS.orange,
  red: RISK_COLORS.red,
};

/**
 * Alerts for the farmer's own panchayat, reusing
 * `selectPanchayatAlerts` — the same derivation `selectBlockAlerts`
 * already uses for the Scientist Block Overview, scoped to one
 * panchayat.
 */
export function FarmerAlerts({ alerts }) {
  const { t } = useTranslation();

  return (
    <Card title={t("farmer.alerts.title")}>
      {alerts.length === 0 ? (
        <p className="text-sm text-foreground/50">{t("farmer.alerts.none")}</p>
      ) : (
        <ul className="space-y-2">
          {alerts.map((alert, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <span
                className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                style={{
                  backgroundColor:
                    SEVERITY_TO_COLOR[alert.severity] ?? RISK_COLORS.yellow,
                }}
                aria-hidden="true"
              />
              <span>
                <span className="font-medium">{alert.type}</span> —{" "}
                {alert.message}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
