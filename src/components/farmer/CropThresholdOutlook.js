"use client";

import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatTemperature } from "@/lib/formatters";

const STATUS_TO_CLASSES = {
  hot: "border-red-300 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30",
  cold: "border-blue-300 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/30",
  safe: "border-green-300 bg-green-50 dark:border-green-900/50 dark:bg-green-950/30",
  unavailable: "border-border ",
};

function formatDayLabel(dateKey) {
  return new Date(dateKey).toLocaleDateString("en-IN", {
    weekday: "short",
    timeZone: "UTC",
  });
}

/**
 * Mobile version of the Scientist portal's Plot 7 (Crop Threshold Time
 * Series). Collapses the hourly line-vs-threshold chart
 * into one safe/hot/cold tile per day for the next 5 days, using the
 * selected crop's *effective* thresholds (so a Scientist's Crop
 * Threshold Editor override is reflected here too).
 */
export function CropThresholdOutlook({ crop, days }) {
  const { t } = useTranslation();

  if (!crop) {
    return (
      <Card title={t("farmer.cropOutlook.title", { crop: "—" })}>
        <EmptyState title={t("farmer.cropOutlook.selectCropFirst")} />
      </Card>
    );
  }

  return (
    <Card title={t("farmer.cropOutlook.title", { crop })}>
      <div className="grid grid-cols-5 gap-2 text-center">
        {days.map((day) => (
          <div
            key={day.dateKey}
            className={`rounded-md border p-2 ${STATUS_TO_CLASSES[day.status]}`}
          >
            <p className="text-xs text-foreground/50">
              {formatDayLabel(day.dateKey)}
            </p>
            <p className="mt-1 text-xs font-semibold">
              {formatTemperature(day.tempMaxC)}
            </p>
            <p className="text-[11px] text-foreground/50">
              {t(`farmer.cropOutlook.${day.status}`)}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
