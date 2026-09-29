"use client";

import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { RISK_COLORS } from "@/lib/riskLevels";

const LEVEL_TO_COLOR = {
  low: RISK_COLORS.green,
  moderate: RISK_COLORS.yellow,
  high: RISK_COLORS.red,
};

/**
 * Pest/Disease card. See `computeFungalDiseaseRisk`'s own
 * documentation for why this is a general illustrative heuristic, not a
 * validated pest model — the disclaimer here is not boilerplate, it's the
 * load-bearing fact a farmer needs to correctly weigh this card.
 */
export function PestDiseaseCard({ pestDiseaseRisk }) {
  const { t } = useTranslation();

  if (!pestDiseaseRisk?.available) {
    return (
      <Card title={t("farmer.pestDisease.title")}>
        <EmptyState title={t("farmer.actionCard.unavailable")} />
      </Card>
    );
  }

  return (
    <Card title={t("farmer.pestDisease.title")}>
      <div className="flex items-center gap-3">
        <span
          className="h-3 w-3 shrink-0 rounded-full"
          style={{
            backgroundColor: LEVEL_TO_COLOR[pestDiseaseRisk.value.level],
          }}
          aria-hidden="true"
        />
        <p className="text-lg font-semibold">
          {t(`farmer.pestDisease.${pestDiseaseRisk.value.level}`)}
        </p>
      </div>
      <p className="mt-2 text-xs text-foreground/50">
        {t("farmer.pestDisease.disclaimer")}
      </p>
    </Card>
  );
}
