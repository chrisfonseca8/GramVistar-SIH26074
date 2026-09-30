"use client";

import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { RISK_COLORS } from "@/lib/riskLevels";

const SEVERITY_TO_COLOR = {
  yellow: RISK_COLORS.yellow,
  orange: RISK_COLORS.orange,
  red: RISK_COLORS.red,
};

const CODE_TO_TYPE_KEY = {
  frost: "farmer.alertsDetail.frostType",
  heavyRain: "farmer.alertsDetail.heavyRainType",
  heatStress: "farmer.alertsDetail.heatStressType",
};

const FROST_LEVEL_TO_KEY = {
  watch: "farmer.heatCold.frostWatch",
  warning: "farmer.heatCold.frostWarning",
};

/**
 * Alerts for the farmer's own panchayat, reusing
 * `selectPanchayatAlerts` — the same derivation `selectBlockAlerts`
 * already uses for the Scientist Block Overview, scoped to one
 * panchayat.
 *
 * `alert.type`/`alert.message` (from the shared selector) are English
 * prose meant for the Scientist portal — here we rebuild both from
 * `alert.code`/`alert.data` through i18next instead, so this card is
 * fully translated when Hindi is selected.
 */
export function FarmerAlerts({ alerts }) {
  const { t } = useTranslation();

  function alertType(alert) {
    const key = CODE_TO_TYPE_KEY[alert.code];
    return key ? t(key) : alert.type;
  }

  function alertMessage(alert) {
    if (alert.code === "frost") {
      return t("farmer.alertsDetail.frostMessage", {
        level: t(FROST_LEVEL_TO_KEY[alert.data.level] ?? alert.data.level),
        tempC: alert.data.tempC,
      });
    }
    if (alert.code === "heavyRain") {
      return t("farmer.alertsDetail.heavyRainMessage", {
        pct: alert.data.pct,
      });
    }
    if (alert.code === "heatStress") {
      return t("farmer.alertsDetail.heatStressMessage", {
        value: alert.data.value,
      });
    }
    return alert.message;
  }

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
                <span className="font-medium">{alertType(alert)}</span> —{" "}
                {alertMessage(alert)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
