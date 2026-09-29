"use client";

import { useMemo, useState } from "react";
import { PlotlyChart } from "@/components/charts/PlotlyChart";
import { EmptyState } from "@/components/ui/EmptyState";
import { binPointsToGrid } from "@/lib/spatial/grid";
import { geoJsonPolygonsToLines } from "@/lib/spatial/geojsonLines";
import { interpolateIdw } from "@/lib/downscaling/idw";
import { selectIdwKnownPointsForMonth } from "@/data/selectors/downscaling";

/**
 * Elevation vs. IDW-interpolated historical temperature, side by side
 * (originally Scientist Model Diagnostics' Plot 3) — extracted
 * into a standalone component so the Government portal (which
 * explicitly asks to reuse Plot 3 "using reusable chart/map components")
 * can render the exact same chart instead of a second copy. Callers
 * supply their own `Card`/title/description around this; it only renders
 * the month picker + chart.
 */
export function ElevationTemperatureContours({ data }) {
  const availableMonths = useMemo(
    () =>
      Array.from(
        new Set(
          data.historicalPanchayats.map((r) => r.monthKey).filter(Boolean),
        ),
      ).sort(),
    [data.historicalPanchayats],
  );
  const [selectedMonth, setSelectedMonth] = useState(
    availableMonths[availableMonths.length - 1] ?? null,
  );

  const elevationField = useMemo(
    () =>
      binPointsToGrid(data.elevationPoints, {
        gridSize: 20,
        valueField: "elevationM",
      }),
    [data.elevationPoints],
  );
  const borderLines = useMemo(
    () => geoJsonPolygonsToLines(data.borders),
    [data.borders],
  );

  const temperatureGrid = useMemo(() => {
    if (!selectedMonth || elevationField.lonCenters.length === 0) return null;
    const knownPoints = selectIdwKnownPointsForMonth(
      data,
      selectedMonth,
      "tempAvgC",
    );
    if (knownPoints.length === 0) return null;
    return elevationField.latCenters.map((lat) =>
      elevationField.lonCenters.map((lon) => {
        const result = interpolateIdw(
          { longitude: lon, latitude: lat },
          knownPoints,
        );
        return result.available ? result.value : null;
      }),
    );
  }, [data, selectedMonth, elevationField]);

  if (!elevationField.bounds) {
    return <EmptyState title="No elevation data available" />;
  }

  return (
    <>
      <label className="mb-3 flex items-center gap-2 text-xs text-foreground/60">
        Month:
        <select
          value={selectedMonth ?? ""}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="rounded-md border border-border bg-surface px-2 py-1 "
        >
          {availableMonths.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
      </label>

      {!temperatureGrid ? (
        <EmptyState title="No temperature data for this month" />
      ) : (
        <PlotlyChart
          data={[
            {
              type: "contour",
              x: elevationField.lonCenters,
              y: elevationField.latCenters,
              z: elevationField.grid,
              xaxis: "x",
              yaxis: "y",
              colorscale: "Earth",
              showscale: true,
              colorbar: { x: 0.44, title: "m" },
              hovertemplate:
                "lon %{x:.3f}, lat %{y:.3f}<br>Elevation: %{z:.0f} m<extra></extra>",
            },
            {
              type: "scatter",
              mode: "lines",
              x: borderLines.x,
              y: borderLines.y,
              xaxis: "x",
              yaxis: "y",
              line: { color: "black", width: 1 },
              showlegend: false,
              hoverinfo: "skip",
            },
            {
              type: "contour",
              x: elevationField.lonCenters,
              y: elevationField.latCenters,
              z: temperatureGrid,
              xaxis: "x2",
              yaxis: "y2",
              colorscale: "RdBu",
              reversescale: true,
              showscale: true,
              colorbar: { x: 1.0, title: "°C" },
              hovertemplate:
                "lon %{x:.3f}, lat %{y:.3f}<br>Temperature (IDW): %{z:.1f} °C<extra></extra>",
            },
            {
              type: "scatter",
              mode: "lines",
              x: borderLines.x,
              y: borderLines.y,
              xaxis: "x2",
              yaxis: "y2",
              line: { color: "black", width: 1 },
              showlegend: false,
              hoverinfo: "skip",
            },
          ]}
          layout={{
            height: 420,
            margin: { t: 40, l: 50, r: 50 },
            grid: { rows: 1, columns: 2, pattern: "independent" },
            annotations: [
              {
                text: "Elevation (m)",
                x: 0.2,
                y: 1.08,
                xref: "paper",
                yref: "paper",
                showarrow: false,
              },
              {
                text: `Temperature — ${selectedMonth} (°C)`,
                x: 0.85,
                y: 1.08,
                xref: "paper",
                yref: "paper",
                showarrow: false,
              },
            ],
          }}
          style={{ width: "100%" }}
          config={{ displayModeBar: false, responsive: true }}
        />
      )}
    </>
  );
}
