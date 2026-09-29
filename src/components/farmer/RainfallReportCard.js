"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useRainfallReportsStore } from "@/store/rainfallReportsStore";

/**
 * Participatory sensing — lets a farmer report today's
 * actual rainfall, independent of the official forecast. Scientists can
 * compare these against the forecast on the Participatory Sensing page.
 */
export function RainfallReportCard({ panchayat }) {
  const { t } = useTranslation();
  const addReport = useRainfallReportsStore((state) => state.addReport);
  const [estimatedMm, setEstimatedMm] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    if (estimatedMm === "") return;
    addReport({ panchayat, estimatedMm: Number(estimatedMm), notes: null });
    setSubmitted(true);
    setEstimatedMm("");
  }

  return (
    <Card
      title={t("farmer.rainfallReport.title")}
      description={t("farmer.rainfallReport.description")}
    >
      {submitted ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-foreground/70">
            {t("farmer.rainfallReport.thanks")}
          </p>
          <Button variant="ghost" size="sm" onClick={() => setSubmitted(false)}>
            {t("farmer.rainfallReport.reportAgain")}
          </Button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-wrap items-end gap-3"
        >
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs uppercase tracking-wide text-foreground/40">
              {t("farmer.rainfallReport.amountLabel")}
            </span>
            <input
              type="number"
              min={0}
              step="0.1"
              value={estimatedMm}
              onChange={(event) => setEstimatedMm(event.target.value)}
              className="w-32 rounded-md border border-border bg-surface px-3 py-2 text-sm "
            />
          </label>
          <Button type="submit" variant="primary">
            {t("farmer.rainfallReport.submit")}
          </Button>
        </form>
      )}
    </Card>
  );
}
