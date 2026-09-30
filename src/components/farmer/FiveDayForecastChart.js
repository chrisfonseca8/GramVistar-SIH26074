"use client";

import { useTranslation } from "react-i18next";
import { PlotlyChart } from "@/components/charts/PlotlyChart";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDayLabel } from "@/lib/formatters";

/**
 * 5-day max temperature vs. rainfall combo chart — the same daily
 * min/max/rain-probability/precipitation-total values `FiveDayForecast`'s
 * card list already shows, just as a chart. No separate data source, no
 * simulated values.
 */
export function FiveDayForecastChart({ days }) {
  const { t, i18n } = useTranslation();
  const usable = (days ?? []).filter(
    (d) => d.tempMaxC != null || d.precipitationTotalMm != null,
  );

  if (usable.length === 0) {
    return (
      <Card title={t("farmer.forecastChart.title")}>
        <EmptyState title={t("farmer.forecast.unavailable")} />
      </Card>
    );
  }

  const labels = usable.map((d) => formatDayLabel(d.dateKey, i18n.language));

  return (
    <Card title={t("farmer.forecastChart.title")}>
      <PlotlyChart
        data={[
          {
            type: "bar",
            name: t("farmer.forecastChart.rainfall"),
            x: labels,
            y: usable.map((d) => d.precipitationTotalMm),
            marker: { color: "rgba(15, 118, 110, 0.55)" },
            yaxis: "y2",
            hovertemplate: "%{x}: %{y:.1f} mm<extra></extra>",
          },
          {
            type: "scatter",
            mode: "lines+markers",
            name: t("farmer.forecastChart.maxTemp"),
            x: labels,
            y: usable.map((d) => d.tempMaxC),
            line: { color: "#d97706", width: 3 },
            marker: { size: 7 },
            hovertemplate: "%{x}: %{y:.1f}°C<extra></extra>",
          },
        ]}
        layout={{
          height: 320,
          margin: { t: 20, l: 50, r: 50, b: 40 },
          showlegend: true,
          legend: { orientation: "h", y: -0.2 },
          yaxis: { title: t("farmer.forecastChart.temperatureAxis") },
          yaxis2: {
            title: t("farmer.forecastChart.rainfall"),
            overlaying: "y",
            side: "right",
          },
        }}
        style={{ width: "100%" }}
        config={{ displayModeBar: false, responsive: true }}
      />
    </Card>
  );
}
