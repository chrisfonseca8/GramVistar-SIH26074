"use client";

import { useTranslation } from "react-i18next";
import { PlotlyChart } from "@/components/charts/PlotlyChart";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

/**
 * Current relative humidity, soil moisture deficit and wind speed as one
 * bar chart, each on its own natural scale (%, m³/m³, km/h) called out
 * per bar — read straight from the current forecast hour, nothing
 * simulated.
 */
export function StressBreakdownChart({ current, soilMoistureDeficit }) {
  const { t } = useTranslation();

  const bars = [
    {
      label: t("farmer.stressBreakdown.humidity"),
      value: current?.humidityPct ?? null,
      text: current?.humidityPct != null ? `${current.humidityPct.toFixed(0)}%` : "—",
      color: "#ef4444",
    },
    {
      label: t("farmer.stressBreakdown.soilDeficit"),
      value: soilMoistureDeficit != null ? soilMoistureDeficit * 100 : null,
      text: soilMoistureDeficit != null ? soilMoistureDeficit.toFixed(3) : "—",
      color: "#0f766e",
    },
    {
      label: t("farmer.stressBreakdown.wind"),
      value: current?.windSpeedKmh ?? null,
      text: current?.windSpeedKmh != null ? `${current.windSpeedKmh.toFixed(0)} km/h` : "—",
      color: "#f59e0b",
    },
  ].filter((bar) => bar.value != null);

  if (bars.length === 0) {
    return (
      <Card title={t("farmer.stressBreakdown.title")}>
        <EmptyState title={t("farmer.stressBreakdown.unavailable")} />
      </Card>
    );
  }

  return (
    <Card title={t("farmer.stressBreakdown.title")}>
      <PlotlyChart
        data={[
          {
            type: "bar",
            x: bars.map((b) => b.label),
            y: bars.map((b) => b.value),
            text: bars.map((b) => b.text),
            textposition: "outside",
            marker: { color: bars.map((b) => b.color) },
            hovertemplate: "%{x}: %{text}<extra></extra>",
          },
        ]}
        layout={{
          height: 300,
          margin: { t: 20, l: 40, r: 20, b: 60 },
          showlegend: false,
          yaxis: { visible: false },
        }}
        style={{ width: "100%" }}
        config={{ displayModeBar: false, responsive: true }}
      />
    </Card>
  );
}
