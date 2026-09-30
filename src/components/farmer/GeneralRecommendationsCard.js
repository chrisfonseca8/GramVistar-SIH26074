"use client";

import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";

/**
 * A short list of general good-practice farming tips — deliberately
 * NOT derived from today's forecast, the selected panchayat, or any
 * calculation: a fixed, clearly-labeled set of generic recommendations,
 * distinct from the panchayat-specific Today's Actions / published
 * advisory above it.
 */
export function GeneralRecommendationsCard() {
  const { t } = useTranslation();
  const tips = t("farmer.generalRecommendations.tips", { returnObjects: true });

  return (
    <Card
      title={t("farmer.generalRecommendations.title")}
      description={t("farmer.generalRecommendations.disclaimer")}
    >
      <ul className="list-disc space-y-2 pl-5 text-sm text-foreground/70">
        {Array.isArray(tips)
          ? tips.map((tip, index) => <li key={index}>{tip}</li>)
          : null}
      </ul>
    </Card>
  );
}
