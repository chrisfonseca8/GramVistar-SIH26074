"use client";

import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDayLabel, formatTemperature } from "@/lib/formatters";

// These tiles keep a fixed light pastel background in both light and dark
// mode (they're small semantic status accents, not full-page surfaces),
// so their text uses fixed dark colors too — theme-relative
// `text-foreground` would turn near-white in dark mode and disappear
// against a background that never got darker.
const STATUS_TO_CLASSES = {
  hot: "border-red-300 bg-red-50 text-red-900",
  cold: "border-blue-300 bg-blue-50 text-blue-900",
  safe: "border-green-300 bg-green-50 text-green-900",
  unavailable: "border-border bg-surface text-foreground",
};

/**
 * Mobile version of the Scientist portal's Plot 7 (Crop Threshold Time
 * Series). Collapses the hourly line-vs-threshold chart
 * into one safe/hot/cold tile per day for the next 5 days, using the
 * selected crop's *effective* thresholds (so a Scientist's Crop
 * Threshold Editor override is reflected here too).
 */
export function CropThresholdOutlook({ crop, days }) {
  const { t, i18n } = useTranslation();

  if (!crop) {
    return (
      <Card title={t("farmer.cropOutlook.title", { crop: "—" })}>
        <EmptyState title={t("farmer.cropOutlook.selectCropFirst")} />
      </Card>
    );
  }

  return (
    <Card
      title={t("farmer.cropOutlook.title", {
        crop: t(`farmer.crops.${crop}`, crop),
      })}
    >
      <div className="grid grid-cols-5 gap-2 text-center">
        {days.map((day) => (
          <div
            key={day.dateKey}
            className={`rounded-md border p-2 ${STATUS_TO_CLASSES[day.status]}`}
          >
            <p className="text-xs opacity-70">
              {formatDayLabel(day.dateKey, i18n.language)}
            </p>
            <p className="mt-1 text-xs font-semibold">
              {formatTemperature(day.tempMaxC)}
            </p>
            <p className="text-[11px] opacity-70">
              {t(`farmer.cropOutlook.${day.status}`)}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
