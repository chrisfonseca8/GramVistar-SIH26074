"use client";

import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { MetricTile } from "@/components/ui/MetricTile";
import {
  formatPercent,
  formatTemperature,
  formatWindSpeed,
} from "@/lib/formatters";

/** Today's Weather card — the current forecast hour's raw readings. */
export function TodaysWeatherCard({ current }) {
  const { t } = useTranslation();

  return (
    <Card title={t("farmer.weather.title")}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricTile
          bordered
          label={t("farmer.weather.temperature")}
          value={formatTemperature(current?.temperatureC)}
        />
        <MetricTile
          bordered
          label={t("farmer.weather.humidity")}
          value={formatPercent(current?.humidityPct)}
        />
        <MetricTile
          bordered
          label={t("farmer.weather.wind")}
          value={formatWindSpeed(current?.windSpeedKmh)}
        />
        <MetricTile
          bordered
          label={t("farmer.weather.rainChance")}
          value={formatPercent(current?.rainProbabilityPct)}
        />
      </div>
    </Card>
  );
}
