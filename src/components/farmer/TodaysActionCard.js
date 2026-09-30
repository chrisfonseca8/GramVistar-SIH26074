"use client";

import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";

/**
 * The primary "what do I do right now" screen for the Farmer portal —
 * one immediately-understandable YES/NO tile per action the decision-card
 * rule engine supports (`evaluateDecision`:
 * Irrigation/Spray/Fertilizer/Harvest/Livestock). No thresholds, formulas,
 * units, or "reasons" text is shown here by default — this screen
 * deliberately doesn't expose Scientist-level complexity; the reasoning is
 * available in the published advisory's "Why" section further down the
 * page for a farmer who wants more detail.
 */
export function TodaysActionCard({ actionCard }) {
  const { t } = useTranslation();

  const actions = [
    { key: "irrigation", label: t("farmer.actionCard.irrigate") },
    { key: "spray", label: t("farmer.actionCard.spray") },
    { key: "fertilizer", label: t("farmer.actionCard.fertilizer") },
    { key: "harvest", label: t("farmer.actionCard.harvest") },
    { key: "livestock", label: t("farmer.actionCard.livestock") },
  ];

  return (
    <Card title={t("farmer.actionCard.title")}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {actions.map(({ key, label }) => (
          <ActionTile key={key} label={label} result={actionCard?.[key]} />
        ))}
      </div>
    </Card>
  );
}

function ActionTile({ label, result }) {
  const { t } = useTranslation();

  if (!result?.available) {
    return (
      <div className="rounded-lg border border-border p-4 text-center ">
        <p className="text-sm font-medium text-foreground/70">{label}</p>
        <p className="mt-2 text-xs text-foreground/40">
          {t("farmer.actionCard.unavailable")}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border p-4 text-center ">
      <p className="text-sm font-medium text-foreground/70">{label}</p>
      <p
        className={`mt-2 text-2xl font-bold ${result.decision ? "text-green-600" : "text-foreground/70"}`}
      >
        {result.decision
          ? t("farmer.actionCard.yes")
          : t("farmer.actionCard.no")}
      </p>
    </div>
  );
}
