"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDataStore } from "@/store/dataStore";
import { useSelectionStore } from "@/store/selectionStore";
import { useAdvisoryStore } from "@/store/advisoryStore";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Tabs } from "@/components/ui/Tabs";
import { TodaysActionCard } from "@/components/farmer/TodaysActionCard";
import { FiveDayForecast } from "@/components/farmer/FiveDayForecast";
import { FarmerAlerts } from "@/components/farmer/FarmerAlerts";
import { CropSelector } from "@/components/farmer/CropSelector";
import { RainChanceToday } from "@/components/farmer/RainChanceToday";
import { CropThresholdOutlook } from "@/components/farmer/CropThresholdOutlook";
import { TodaysWeatherCard } from "@/components/farmer/TodaysWeatherCard";
import { HourlyRainProbabilityCard } from "@/components/farmer/HourlyRainProbabilityCard";
import { HeatColdStressCard } from "@/components/farmer/HeatColdStressCard";
import { PestDiseaseCard } from "@/components/farmer/PestDiseaseCard";
import { IrrigationScheduleCard } from "@/components/farmer/IrrigationScheduleCard";
import { RainfallReportCard } from "@/components/farmer/RainfallReportCard";
import { GeneralRecommendationsCard } from "@/components/farmer/GeneralRecommendationsCard";
import { ReadAloudButton } from "@/components/farmer/ReadAloudButton";
import { EnvironmentalConditionCards } from "@/components/farmer/EnvironmentalConditionCards";
import { FiveDayForecastChart } from "@/components/farmer/FiveDayForecastChart";
import { StressBreakdownChart } from "@/components/farmer/StressBreakdownChart";
import {
  selectPublishedAdvisoryForPanchayat,
  getLatestVersionContent,
  getLatestVersionTimestamp,
} from "@/data/selectors/publishedAdvisories";
import { selectForecastPanchayat } from "@/data/selectors";
import {
  selectTodaysActionCard,
  selectFiveDayForecast,
  selectTodayRainByDaypart,
  selectCropThresholdOutlook,
} from "@/data/selectors/farmerHome";
import {
  selectTodaysWeather,
  selectHourlyRainProbability,
  selectHeatColdStress,
  selectPestDiseaseRisk,
  selectIrrigationSchedule,
} from "@/data/selectors/farmerInfoCards";
import { selectPanchayatAlerts } from "@/data/selectors/alerts";
import { selectEffectiveThresholdForCrop } from "@/data/effectiveThresholds";
import { useThresholdStore } from "@/store/thresholdStore";
import { useFarmerStore } from "@/store/farmerStore";
import { formatHourLabel } from "@/lib/formatters";
import { RISK_COLORS } from "@/lib/riskLevels";

const PRIORITY_TO_RISK_COLOR = {
  Low: RISK_COLORS.green,
  Medium: RISK_COLORS.yellow,
  High: RISK_COLORS.red,
};

export default function FarmerPortalPage() {
  const { t } = useTranslation();
  const status = useDataStore((state) => state.status);
  const error = useDataStore((state) => state.error);
  const data = useDataStore((state) => state.data);
  const selectedPanchayat = useSelectionStore(
    (state) => state.selectedPanchayat,
  );
  const setSelectedPanchayat = useSelectionStore(
    (state) => state.setSelectedPanchayat,
  );
  const advisories = useAdvisoryStore((state) => state.advisories);
  const selectedCrop = useFarmerStore((state) => state.selectedCrop);
  const thresholdOverrides = useThresholdStore((state) => state.overrides);
  const [activeTab, setActiveTab] = useState("today");

  const homeTabs = [
    { key: "today", label: t("farmer.tabs.today") },
    { key: "weather", label: t("farmer.tabs.weather") },
  ];

  // Offline support: `advisoryStore` is a separate,
  // already-persisted Zustand store from `dataStore` — it survives a
  // page reload and doesn't depend on the local data fetch succeeding.
  const cachedAdvisory = selectedPanchayat
    ? selectPublishedAdvisoryForPanchayat(advisories, selectedPanchayat)
    : null;
  const isLive = status === "ready";

  if (!selectedPanchayat) {
    if (status === "idle" || status === "loading") {
      return (
        <main className="flex-1 px-6 py-8">
          <LoadingSkeleton lines={6} />
        </main>
      );
    }

    if (status === "error") {
      return (
        <main className="flex-1 px-6 py-8">
          <ErrorState title={t("common.loadFailedTitle")} description={error} />
        </main>
      );
    }

    return (
      <main className="flex-1 px-6 py-8">
        <EmptyState
          title={t("farmer.selectPanchayatTitle")}
          description={t("farmer.selectPanchayatDescription")}
          action={
            <div className="flex flex-wrap justify-center gap-2">
              {data.panchayats.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSelectedPanchayat(p)}
                  className="rounded-full border border-border px-4 py-1.5 text-sm transition hover:border-border-hover "
                >
                  {p}
                </button>
              ))}
            </div>
          }
        />
      </main>
    );
  }

  // A panchayat is selected. If live data isn't ready, all we can
  // possibly show is a previously cached advisory (the
  // offline-cache behavior) — the Action Card / 5-day forecast /
  // alerts below all need live forecast data, which isn't available.
  if (!isLive) {
    if (cachedAdvisory) {
      return (
        <main className="flex-1 space-y-6 px-6 py-8">
          <Alert tone="warning">{t("farmer.offlineCached")}</Alert>
          <AdvisorySection
            advisory={cachedAdvisory}
            panchayat={selectedPanchayat}
            t={t}
          />
        </main>
      );
    }

    if (status === "error") {
      return (
        <main className="flex-1 px-6 py-8">
          <ErrorState title={t("common.loadFailedTitle")} description={error} />
        </main>
      );
    }

    return (
      <main className="flex-1 px-6 py-8">
        <LoadingSkeleton lines={6} />
      </main>
    );
  }

  // Live data is ready: the primary Farmer Home screen —
  // Action Card / alerts / 5-day forecast are computed directly from the
  // current forecast and don't depend on a Scientist having published an
  // advisory yet. The published advisory (if any) is a richer narrative
  // shown underneath, not a gate on the rest of the page.
  const actionCard = selectTodaysActionCard(data, selectedPanchayat);
  const fiveDayForecast = selectFiveDayForecast(data, selectedPanchayat);
  const alerts = selectPanchayatAlerts(data, selectedPanchayat);
  const rainByDaypart = selectTodayRainByDaypart(data, selectedPanchayat);
  const currentSoilDeficit =
    selectForecastPanchayat(data, selectedPanchayat)[0]?.soilDeficit ?? null;
  const cropThresholds = selectedCrop
    ? selectEffectiveThresholdForCrop(thresholdOverrides, selectedCrop)
    : null;
  const cropOutlook = selectCropThresholdOutlook(
    data,
    selectedPanchayat,
    cropThresholds ?? undefined,
  );
  const todaysWeather = selectTodaysWeather(data, selectedPanchayat);
  const hourlyRain = selectHourlyRainProbability(data, selectedPanchayat);
  const heatColdStress = selectHeatColdStress(data, selectedPanchayat);
  const pestDiseaseRisk = selectPestDiseaseRisk(data, selectedPanchayat);
  const irrigationSchedule = selectIrrigationSchedule(data, selectedPanchayat);

  return (
    <main className="flex-1 space-y-6 px-6 py-8">
      <div>
        <p className="text-xs uppercase tracking-wide text-foreground/40">
          {selectedPanchayat}
        </p>
        <h1 className="mt-1 text-xl font-semibold">
          {t("farmer.todaysAdvisory")}
        </h1>
      </div>

      <Tabs tabs={homeTabs} active={activeTab} onChange={setActiveTab} />

      {activeTab === "today" ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wide text-foreground/60">
              {t("farmer.cropSelectionCard.title")}
            </h2>
            <p className="mt-1 text-xs text-foreground/50">
              {t("farmer.cropSelectionCard.description")}
            </p>
            <div className="mt-4">
              <CropSelector />
            </div>
          </div>

          {cachedAdvisory ? (
            <AdvisorySection
              advisory={cachedAdvisory}
              panchayat={selectedPanchayat}
              t={t}
            />
          ) : (
            <EmptyState
              title={t("farmer.noAdvisoryTitle")}
              description={t("farmer.noAdvisoryDescription", {
                panchayat: selectedPanchayat,
              })}
            />
          )}

          <EnvironmentalConditionCards current={todaysWeather} />

          <TodaysActionCard actionCard={actionCard} />

          <GeneralRecommendationsCard />

          <FarmerAlerts alerts={alerts} />
        </div>
      ) : (
        <div className="space-y-6">
          <FiveDayForecastChart days={fiveDayForecast} />

          <StressBreakdownChart
            current={todaysWeather}
            soilMoistureDeficit={currentSoilDeficit}
          />

          <FiveDayForecast days={fiveDayForecast} />

          <RainChanceToday dayparts={rainByDaypart} />

          <CropThresholdOutlook crop={selectedCrop} days={cropOutlook} />

          <TodaysWeatherCard current={todaysWeather} />

          <HourlyRainProbabilityCard hours={hourlyRain} />

          <HeatColdStressCard heatColdStress={heatColdStress} />

          <PestDiseaseCard pestDiseaseRisk={pestDiseaseRisk} />

          <IrrigationScheduleCard days={irrigationSchedule} />

          <RainfallReportCard panchayat={selectedPanchayat} />
        </div>
      )}
    </main>
  );
}

function AdvisorySection({ advisory, panchayat, t }) {
  const { i18n } = useTranslation();
  const content = getLatestVersionContent(advisory);
  const completedActionKeys = useFarmerStore(
    (state) => state.completedActionKeys,
  );
  const toggleActionCompleted = useFarmerStore(
    (state) => state.toggleActionCompleted,
  );

  const completedCount = content.actions.filter((_, index) =>
    completedActionKeys.includes(`${advisory.id}:${index}`),
  ).length;
  const totalCount = content.actions.length;
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-foreground/40">
          {panchayat} — {t(`farmer.crops.${advisory.crop}`, advisory.crop)}
        </p>
        <p className="mt-1 text-xs text-foreground/50">
          {t("farmer.published", {
            time: formatHourLabel(
              new Date(getLatestVersionTimestamp(advisory)),
              i18n.language,
            ),
          })}
        </p>
      </div>

      <Card>
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm">{content.summary}</p>
          <ReadAloudButton
            text={content.summary}
            lang={content.language === "hi" ? "hi-IN" : "en-IN"}
          />
        </div>
      </Card>

      <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold">
            {t("farmer.advisoryProgress.title")}
          </p>
          <p className="text-sm font-bold text-primary">
            {completedCount} / {totalCount}
          </p>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <section className="space-y-3">
        {content.actions.map((action, index) => {
          const key = `${advisory.id}:${index}`;
          const done = completedActionKeys.includes(key);
          return (
            <label
              key={index}
              className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4 shadow-sm cursor-pointer"
            >
              <input
                type="checkbox"
                checked={done}
                onChange={() => toggleActionCompleted(advisory.id, index)}
                className="mt-1 h-5 w-5 shrink-0 accent-primary"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor:
                        PRIORITY_TO_RISK_COLOR[action.priority] ??
                        RISK_COLORS.green,
                    }}
                    aria-hidden="true"
                  />
                  <p
                    className={`text-base font-semibold ${done ? "text-foreground/40 line-through" : ""}`}
                  >
                    {action.title}
                  </p>
                </div>
                <p
                  className={`mt-1 text-sm ${done ? "text-foreground/30 line-through" : "text-foreground/70"}`}
                >
                  {action.description}
                </p>
              </div>
            </label>
          );
        })}
      </section>

      <Card className="text-xs text-foreground/50">
        <p className="mb-1 font-medium uppercase tracking-wide">
          {t("farmer.why")}
        </p>
        <ul className="list-disc space-y-1 pl-4">
          {content.reasons.map((reason, index) => (
            <li key={index}>{reason}</li>
          ))}
        </ul>
        <p className="mt-2">
          {t("farmer.confidence", { confidence: content.confidence })}
        </p>
      </Card>
    </div>
  );
}
