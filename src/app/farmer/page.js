"use client";

import { useTranslation } from "react-i18next";
import { useDataStore } from "@/store/dataStore";
import { useSelectionStore } from "@/store/selectionStore";
import { useAdvisoryStore } from "@/store/advisoryStore";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { TodaysActionCard } from "@/components/farmer/TodaysActionCard";
import { FiveDayForecast } from "@/components/farmer/FiveDayForecast";
import { FarmerAlerts } from "@/components/farmer/FarmerAlerts";
import { CropStageSelectors } from "@/components/farmer/CropStageSelectors";
import { RainChanceToday } from "@/components/farmer/RainChanceToday";
import { SoilMoistureGaugeCard } from "@/components/farmer/SoilMoistureGaugeCard";
import { WeeklyOperationsOutlook } from "@/components/farmer/WeeklyOperationsOutlook";
import { CropThresholdOutlook } from "@/components/farmer/CropThresholdOutlook";
import { TodaysWeatherCard } from "@/components/farmer/TodaysWeatherCard";
import { HourlyRainProbabilityCard } from "@/components/farmer/HourlyRainProbabilityCard";
import { HeatColdStressCard } from "@/components/farmer/HeatColdStressCard";
import { PestDiseaseCard } from "@/components/farmer/PestDiseaseCard";
import { IrrigationScheduleCard } from "@/components/farmer/IrrigationScheduleCard";
import { RainfallReportCard } from "@/components/farmer/RainfallReportCard";
import { PreparednessCard } from "@/components/farmer/PreparednessCard";
import { ReadAloudButton } from "@/components/farmer/ReadAloudButton";
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
  selectWeeklyOperationsOutlook,
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
  const selectedCropStage = useFarmerStore((state) => state.selectedCropStage);
  const thresholdOverrides = useThresholdStore((state) => state.overrides);

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
          <ErrorState title="Failed to load local data" description={error} />
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
          <ErrorState title="Failed to load local data" description={error} />
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
  const actionCard = selectTodaysActionCard(
    data,
    selectedPanchayat,
    selectedCropStage,
  );
  const fiveDayForecast = selectFiveDayForecast(data, selectedPanchayat);
  const alerts = selectPanchayatAlerts(data, selectedPanchayat);
  const rainByDaypart = selectTodayRainByDaypart(data, selectedPanchayat);
  const operationsOutlook = selectWeeklyOperationsOutlook(
    data,
    selectedPanchayat,
  );
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

      <CropStageSelectors />

      <TodaysActionCard actionCard={actionCard} />

      <FarmerAlerts alerts={alerts} />

      <PreparednessCard alerts={alerts} />

      <FiveDayForecast days={fiveDayForecast} />

      <RainChanceToday dayparts={rainByDaypart} />

      <SoilMoistureGaugeCard soilMoistureDeficit={currentSoilDeficit} />

      <WeeklyOperationsOutlook days={operationsOutlook} />

      <CropThresholdOutlook crop={selectedCrop} days={cropOutlook} />

      <TodaysWeatherCard current={todaysWeather} />

      <HourlyRainProbabilityCard hours={hourlyRain} />

      <HeatColdStressCard heatColdStress={heatColdStress} />

      <PestDiseaseCard pestDiseaseRisk={pestDiseaseRisk} />

      <IrrigationScheduleCard days={irrigationSchedule} />

      <RainfallReportCard panchayat={selectedPanchayat} />

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
    </main>
  );
}

function AdvisorySection({ advisory, panchayat, t }) {
  const content = getLatestVersionContent(advisory);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-foreground/40">
          {panchayat} — {advisory.crop} ({advisory.cropStage})
        </p>
        <p className="mt-1 text-xs text-foreground/50">
          {t("farmer.published", {
            time: formatHourLabel(
              new Date(getLatestVersionTimestamp(advisory)),
            ),
          })}
        </p>
      </div>

      <Card>
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm">{content.summary}</p>
          <ReadAloudButton text={content.summary} />
        </div>
      </Card>

      <section className="space-y-3">
        {content.actions.map((action, index) => (
          <div key={index} className="rounded-lg border border-border p-4 ">
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
              <p className="text-base font-semibold">{action.title}</p>
            </div>
            <p className="mt-1 text-sm text-foreground/70">
              {action.description}
            </p>
          </div>
        ))}
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
