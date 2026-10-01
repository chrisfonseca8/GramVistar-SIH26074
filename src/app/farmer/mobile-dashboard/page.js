"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDataStore } from "@/store/dataStore";
import { useSelectionStore } from "@/store/selectionStore";
import { useFarmerStore } from "@/store/farmerStore";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { CropSelector } from "@/components/farmer/CropSelector";
import { FeedbackPanel } from "@/components/farmer/FeedbackPanel";
import {
  selectTodaysActionCard,
  selectFiveDayForecast,
} from "@/data/selectors/farmerHome";
import { selectTodaysWeather } from "@/data/selectors/farmerInfoCards";
import {
  formatDayLabel,
  formatPercent,
  formatTemperature,
} from "@/lib/formatters";

const TABS = ["actions", "forecast", "feedback"];
const TAB_ICONS = { actions: "✅", forecast: "⛅", feedback: "💬" };

const ACTIONS = [
  { key: "irrigation", icon: "💧", labelKey: "farmer.actionCard.irrigate" },
  { key: "spray", icon: "🧴", labelKey: "farmer.actionCard.spray" },
  { key: "fertilizer", icon: "🌱", labelKey: "farmer.actionCard.fertilizer" },
  { key: "harvest", icon: "🌾", labelKey: "farmer.actionCard.harvest" },
  { key: "livestock", icon: "🐄", labelKey: "farmer.actionCard.livestock" },
];

/**
 * A compact, phone-first alternative to the full Farmer home screen,
 * styled as a phone-frame mockup (status strip, colored status cards, a
 * bottom icon tab bar) rather than the portal's usual desktop card grid.
 * Reuses the exact same selectors, `CropSelector`/`FeedbackPanel`
 * components and `feedbackStore` as the main Farmer screens — only the
 * presentation here is bespoke, not the underlying data or logic.
 */
export default function FarmerMobileDashboardPage() {
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
  const selectedCropStage = useFarmerStore((state) => state.selectedCropStage);
  const [activeTab, setActiveTab] = useState("actions");

  const tabLabels = {
    actions: t("farmer.actionCard.title"),
    forecast: t("farmer.forecast.title"),
    feedback: t("farmer.feedback.title"),
  };

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

  if (!selectedPanchayat) {
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

  const actionCard = selectTodaysActionCard(
    data,
    selectedPanchayat,
    selectedCropStage,
  );
  const fiveDayForecast = selectFiveDayForecast(data, selectedPanchayat);
  const today = selectTodaysWeather(data, selectedPanchayat);

  return (
    <main className="flex-1 bg-[#f3f4f6] px-4 py-8">
      {/* Phone frame */}
      <div className="mx-auto w-full max-w-[380px] overflow-hidden rounded-[2.5rem] border-[10px] border-gray-900 bg-gray-900 shadow-2xl">
        <div className="flex max-h-[720px] min-h-[600px] flex-col overflow-hidden rounded-[1.75rem] bg-white">
          {/* Status strip */}
          <div className="flex shrink-0 items-center gap-1.5 bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground">
            <span aria-hidden="true">📍</span>
            {selectedPanchayat}
          </div>

          {/* Scrollable content */}
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {activeTab === "actions" ? (
              <>
                <CropSelector />
                <div className="space-y-2.5">
                  {ACTIONS.map((action) => (
                    <ActionStatusCard
                      key={action.key}
                      icon={action.icon}
                      label={t(action.labelKey)}
                      result={actionCard?.[action.key]}
                      t={t}
                    />
                  ))}
                </div>
              </>
            ) : null}

            {activeTab === "forecast" ? (
              <>
                <TodaysWeatherCard today={today} t={t} />
                <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                  {fiveDayForecast.map((day) => (
                    <ForecastDayCard key={day.dateKey} day={day} />
                  ))}
                </div>
              </>
            ) : null}

            {activeTab === "feedback" ? <FeedbackPanel /> : null}
          </div>

          {/* Bottom tab bar */}
          <nav
            className="flex shrink-0 border-t border-border bg-white"
            aria-label={t("farmer.mobileDashboard.navLabel")}
          >
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                aria-pressed={activeTab === tab}
                className={`flex flex-1 flex-col items-center gap-0.5 py-3 text-[11px] font-semibold transition ${
                  activeTab === tab
                    ? "text-primary"
                    : "text-foreground/40 hover:text-foreground/70"
                }`}
              >
                <span className="text-lg" aria-hidden="true">
                  {TAB_ICONS[tab]}
                </span>
                {tabLabels[tab]}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </main>
  );
}

function ActionStatusCard({ icon, label, result, t }) {
  if (!result?.available) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-border bg-muted px-3 py-3">
        <span className="text-xl" aria-hidden="true">
          {icon}
        </span>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground/70">{label}</p>
          <p className="text-xs text-foreground/40">
            {t("farmer.actionCard.unavailable")}
          </p>
        </div>
      </div>
    );
  }

  const isYes = result.decision;

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border-l-4 px-3 py-3 ${
        isYes
          ? "border-l-green-500 bg-green-50"
          : "border-l-gray-300 bg-gray-50"
      }`}
    >
      <span className="text-xl" aria-hidden="true">
        {icon}
      </span>
      <p className="flex-1 text-sm font-medium text-gray-800">{label}</p>
      <span
        className={`text-base font-extrabold ${isYes ? "text-green-600" : "text-gray-400"}`}
      >
        {isYes ? t("farmer.actionCard.yes") : t("farmer.actionCard.no")}
      </span>
    </div>
  );
}

function TodaysWeatherCard({ today, t }) {
  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <p className="text-xs text-foreground/50">{t("farmer.weather.title")}</p>
      <div className="mt-1 flex items-end justify-between">
        <p className="text-4xl font-bold text-gray-900">
          {formatTemperature(today?.temperatureC)}
        </p>
        <span className="text-3xl" aria-hidden="true">
          ⛅
        </span>
      </div>
      <p className="mt-1 text-xs text-foreground/50">
        {t("farmer.weather.rainChance")}:{" "}
        <span className="font-semibold text-blue-600">
          {formatPercent(today?.rainProbabilityPct)}
        </span>
      </p>
    </div>
  );
}

function ForecastDayCard({ day }) {
  const rainPct = day.rainProbabilityMaxPct;
  const isWet = typeof rainPct === "number" && rainPct >= 50;

  return (
    <div
      className={`w-[72px] shrink-0 rounded-xl border px-2 py-3 text-center ${
        isWet ? "border-blue-200 bg-blue-50" : "border-border bg-white"
      }`}
    >
      <p className="text-xs font-semibold text-gray-700">
        {formatDayLabel(day.dateKey)}
      </p>
      <p className="mt-1 text-lg" aria-hidden="true">
        {isWet ? "🌧️" : "☀️"}
      </p>
      <p className="mt-1 text-sm font-bold text-gray-800">
        {formatTemperature(day.tempMaxC)}
      </p>
      <p className="text-[10px] text-foreground/40">
        {formatTemperature(day.tempMinC)}
      </p>
      <p className="mt-1 text-[10px] font-medium text-blue-600">
        {formatPercent(rainPct)}
      </p>
    </div>
  );
}
