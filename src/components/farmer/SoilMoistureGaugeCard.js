"use client";

import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { Gauge } from "@/components/charts/Gauge";
import { RISK_COLORS } from "@/lib/riskLevels";
import { formatNumber } from "@/lib/formatters";

/**
 * Mobile version of the Scientist portal's Plot 9 (Soil Moisture Deficit
 * Gauge). Reuses the same `Gauge` component and the same
 * illustrative zone boundaries (0.03 / 0.06 m³/m³) as Plot 9 exactly, so
 * the two portals never show a different gauge for the same reading;
 * only the caption is simplified to plain language, per "do not expose
 * scientist-level complexity on the primary farmer screen."
 */
export function SoilMoistureGaugeCard({ soilMoistureDeficit }) {
  const { t } = useTranslation();

  return (
    <Card
      title={t("farmer.soilMoisture.title")}
      description={t("farmer.soilMoisture.description")}
    >
      <Gauge
        value={soilMoistureDeficit}
        min={0}
        max={0.1}
        zones={[
          { to: 0.03, color: RISK_COLORS.green },
          { to: 0.06, color: RISK_COLORS.yellow },
          { to: 0.1, color: RISK_COLORS.red },
        ]}
        label={t("farmer.soilMoisture.title")}
        valueLabel={formatNumber(soilMoistureDeficit, {
          decimals: 3,
          suffix: "m³/m³",
        })}
      />
    </Card>
  );
}
