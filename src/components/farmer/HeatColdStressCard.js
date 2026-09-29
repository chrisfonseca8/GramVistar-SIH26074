"use client";

import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

// Matches the same 41°C danger threshold `selectBlockAlerts`/`selectPanchayatAlerts`
// already use, so this card's "Danger" label lines up with when an alert fires.
const HEAT_DANGER_THRESHOLD_C = 41;
const HEAT_CAUTION_THRESHOLD_C = 32;

function heatIndexToCategory(heatIndexC) {
  if (heatIndexC >= HEAT_DANGER_THRESHOLD_C) return "heatDanger";
  if (heatIndexC >= HEAT_CAUTION_THRESHOLD_C) return "heatCaution";
  return "heatComfortable";
}

const FROST_LEVEL_TO_KEY = {
  none: "frostNone",
  watch: "frostWatch",
  warning: "frostWarning",
};

/**
 * Heat/Cold Stress card — always shows the current status
 * in plain language, unlike the Alerts card which only surfaces
 * something once it crosses a danger threshold.
 */
export function HeatColdStressCard({ heatColdStress }) {
  const { t } = useTranslation();

  if (!heatColdStress) {
    return (
      <Card title={t("farmer.heatCold.title")}>
        <EmptyState title={t("farmer.actionCard.unavailable")} />
      </Card>
    );
  }

  const { heatIndex, frostRisk } = heatColdStress;

  return (
    <Card title={t("farmer.heatCold.title")}>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-border p-4 text-center ">
          <p className="text-sm font-medium text-foreground/70">
            {t("farmer.heatCold.heatLabel")}
          </p>
          <p className="mt-2 text-lg font-semibold">
            {heatIndex.available
              ? t(`farmer.heatCold.${heatIndexToCategory(heatIndex.value)}`)
              : t("farmer.cropOutlook.unavailable")}
          </p>
        </div>
        <div className="rounded-lg border border-border p-4 text-center ">
          <p className="text-sm font-medium text-foreground/70">
            {t("farmer.heatCold.frostLabel")}
          </p>
          <p className="mt-2 text-lg font-semibold">
            {frostRisk.available
              ? t(`farmer.heatCold.${FROST_LEVEL_TO_KEY[frostRisk.value]}`)
              : t("farmer.cropOutlook.unavailable")}
          </p>
        </div>
      </div>
    </Card>
  );
}
