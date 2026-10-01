"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useDataStore } from "@/store/dataStore";
import { useSelectionStore } from "@/store/selectionStore";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { PlotlyChart } from "@/components/charts/PlotlyChart";
import { ElevationMap } from "@/components/maps/ElevationMap";
import { ElevationTemperatureContours } from "@/components/charts/ElevationTemperatureContours";
import { VulnerabilityRankingChart } from "@/components/charts/VulnerabilityRankingChart";
import {
  selectHistoricalPanchayat,
  selectForecastPanchayat,
} from "@/data/selectors";
import { selectTemperatureEnsembleFramesAllPanchayats } from "@/data/selectors/ensemble";
import { selectTemperatureValidationAgainstReference } from "@/data/selectors/qa";
import { selectTemperatureEnsembleFrames } from "@/data/selectors/ensemble";
import {
  selectDailyCloudCoverGrid,
  selectDailyHumidityGrid,
  selectRainfallAccumulationSeries,
  selectTemperatureAnomalyByPanchayat,
} from "@/data/selectors/climateAggregates";
import {
  selectSpiSpeiTimeSeries,
  selectHeatIndexSeries,
  selectFrostRiskGrid,
  selectGddAccumulation,
  selectWaterBalanceSeries,
} from "@/data/selectors/derivedSeries";
import { selectPanchayatComparisonSummary } from "@/data/selectors/comparison";
import { selectAnimationFrames } from "@/data/selectors/modelAnimation";
import {
  groupRecordsByDay,
  pickRepresentativeHour,
} from "@/lib/time/dailyAggregation";
import { computeCorrelationMatrix } from "@/lib/stats/correlation";
import { AnimatedChoroplethMap } from "@/components/maps/AnimatedChoroplethMap";
import { ColorLegend } from "@/components/charts/ColorLegend";
import { getRainfallProbability } from "@/lib/calculations/rainfallProbability";
import { computeSprayWindow } from "@/lib/calculations/sprayWindow";
import { computeIrrigationWindow } from "@/lib/calculations/irrigationWindow";
import { computeFrostRisk } from "@/lib/calculations/frostRisk";
import { getVariableMeta } from "@/data/variableMetadata";
import {
  formatNumber,
  formatHourLabel,
  formatDateLabel,
} from "@/lib/formatters";
import { DEFAULT_CROP_THRESHOLDS } from "@/data/cropThresholds";
import { selectEffectiveCropThresholds } from "@/data/effectiveThresholds";
import { useThresholdStore } from "@/store/thresholdStore";
import { Gauge } from "@/components/charts/Gauge";
import { RISK_COLORS, mapFrostRiskToRiskLevel } from "@/lib/riskLevels";

const CORRELATION_FIELDS = [
  "tempMaxC",
  "tempMinC",
  "tempAvgC",
  "precipitationTotalMm",
  "soilMoistureAvg",
];

export default function ModelDiagnosticsPage() {
  const status = useDataStore((state) => state.status);
  const error = useDataStore((state) => state.error);
  const data = useDataStore((state) => state.data);
  const selectedPanchayat = useSelectionStore(
    (state) => state.selectedPanchayat,
  );

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

  const scope = selectedPanchayat ?? "Chas Block";

  return (
    <main className="flex-1 space-y-8 px-6 py-8">
      <div>
        <h1 className="text-xl font-semibold">Model Diagnostics</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Showing: <span className="font-medium">{scope}</span> — change the
          panchayat selector in the header to inspect a different scope.
        </p>
      </div>

      <Card
        title="Plot 1 — Elevation & Topography"
        description="Chas Block's elevation, binned from the 56,430-point survey grid."
      >
        <ElevationMap
          elevationPoints={data.elevationPoints}
          borders={data.borders}
        />
      </Card>

      <CorrelationSection data={data} selectedPanchayat={selectedPanchayat} />

      <ContourComparisonSection data={data} />

      <SpatialUncertaintySection data={data} />

      <PredictedVsObservedSection
        data={data}
        selectedPanchayat={selectedPanchayat}
      />

      <ResidualsSection data={data} selectedPanchayat={selectedPanchayat} />

      <CropThresholdSection data={data} selectedPanchayat={selectedPanchayat} />

      <RainfallProbabilitySection
        data={data}
        selectedPanchayat={selectedPanchayat}
      />

      <SoilMoistureGaugeSection
        data={data}
        selectedPanchayat={selectedPanchayat}
      />

      <VulnerabilityRankingSection data={data} />

      <OperationsWindowMatrixSection
        data={data}
        selectedPanchayat={selectedPanchayat}
      />

      <WindDistributionSection
        data={data}
        selectedPanchayat={selectedPanchayat}
      />

      <CloudCoverHeatmapSection data={data} />

      <HumidityHeatmapSection data={data} />

      <RainfallAccumulationSection data={data} />

      <ForecastSpaghettiSection
        data={data}
        selectedPanchayat={selectedPanchayat}
      />

      <AnomalyMapSection data={data} />

      <SpiSpeiSection data={data} selectedPanchayat={selectedPanchayat} />

      <HeatStressIndexSection
        data={data}
        selectedPanchayat={selectedPanchayat}
      />

      <FrostRiskCalendarSection data={data} />

      <GddTrackerSection data={data} selectedPanchayat={selectedPanchayat} />

      <WaterBalanceSection data={data} selectedPanchayat={selectedPanchayat} />

      <PanchayatComparisonSection data={data} />

      <ModelAnimationSection data={data} />
    </main>
  );
}

function CorrelationSection({ data, selectedPanchayat }) {
  const records = selectedPanchayat
    ? selectHistoricalPanchayat(data, selectedPanchayat)
    : data.historicalBlock;

  if (records.length < 2) {
    return (
      <Card title="Plot 2 — Variable Correlation Heatmap">
        <EmptyState title="Not enough historical data to compute correlations" />
      </Card>
    );
  }

  const { fields, matrix } = computeCorrelationMatrix(
    records,
    CORRELATION_FIELDS,
  );
  const labels = fields.map((field) => getVariableMeta(field)?.label ?? field);

  return (
    <Card
      title="Plot 2 — Variable Correlation Heatmap"
      description={`Pearson correlation between historical monthly variables, ${selectedPanchayat ?? "Chas Block"} (${records.length} months).`}
    >
      <PlotlyChart
        data={[
          {
            type: "heatmap",
            x: labels,
            y: labels,
            z: matrix,
            zmin: -1,
            zmax: 1,
            colorscale: "RdBu",
            reversescale: true,
            texttemplate: "%{z:.2f}",
            hovertemplate: "%{y} vs %{x}: r = %{z:.2f}<extra></extra>",
          },
        ]}
        layout={{
          height: 420,
          margin: { t: 20, l: 140, b: 100 },
          xaxis: { tickangle: -30 },
        }}
        style={{ width: "100%" }}
        config={{
          displayModeBar: "hover",
          displaylogo: false,
          responsive: true,
          toImageButtonOptions: {
            format: "png",
            filename: "variable-correlation-heatmap",
            scale: 2,
          },
        }}
      />
    </Card>
  );
}

function ContourComparisonSection({ data }) {
  return (
    <Card
      title="Plot 3 — Side-by-Side Spatial Contours"
      description="Elevation (left) vs. IDW-interpolated historical temperature across the 5 panchayats (right) — the same underlying micro-climate differences that drive downscaling."
    >
      <ElevationTemperatureContours data={data} />
    </Card>
  );
}

function SpatialUncertaintySection({ data }) {
  const frames = selectTemperatureEnsembleFramesAllPanchayats(data);
  const currentFrame = frames[0];

  if (!currentFrame) {
    return (
      <Card title="Plot 4 — Spatial Error / Uncertainty">
        <EmptyState title="No forecast data available" />
      </Card>
    );
  }

  const panchayats = data.panchayats.filter(
    (p) => currentFrame.byPanchayat[p]?.available,
  );

  if (panchayats.length === 0) {
    return (
      <Card title="Plot 4 — Spatial Error / Uncertainty">
        <EmptyState title="No downscaled estimates available for this hour" />
      </Card>
    );
  }

  return (
    <Card
      title="Plot 4 — Spatial Error / Uncertainty"
      description={`Downscaled temperature per panchayat at ${currentFrame.timeKey}, ± the parameter-sensitivity ensemble's standard deviation (a surrogate sensitivity measure, not a physically sourced meteorological ensemble).`}
    >
      <PlotlyChart
        data={[
          {
            type: "bar",
            x: panchayats,
            y: panchayats.map((p) => currentFrame.byPanchayat[p].mean),
            error_y: {
              type: "data",
              array: panchayats.map((p) => currentFrame.byPanchayat[p].stdDev),
            },
            hovertemplate:
              "%{x}: %{y:.2f}°C ± %{error_y.array:.3f}°C<extra></extra>",
          },
        ]}
        layout={{
          height: 360,
          margin: { t: 20, l: 50 },
          yaxis: { title: "Temperature (°C)" },
        }}
        style={{ width: "100%" }}
        config={{ displayModeBar: false, responsive: true }}
      />
    </Card>
  );
}

function PredictedVsObservedSection({ data, selectedPanchayat }) {
  if (!selectedPanchayat) {
    return (
      <Card title="Plot 5 — Predicted vs. Reference">
        <EmptyState
          title="Select a panchayat to compare"
          description="This comparison is per-panchayat — choose one in the header's panchayat selector."
        />
      </Card>
    );
  }

  const validation = selectTemperatureValidationAgainstReference(
    data,
    selectedPanchayat,
  );

  if (validation.pairCount === 0) {
    return (
      <Card title="Plot 5 — Predicted vs. Reference">
        <EmptyState title="No overlapping timestamps to compare" />
      </Card>
    );
  }

  const values = validation.pairs.flatMap((p) => [p.observed, p.predicted]);
  const lineMin = Math.min(...values);
  const lineMax = Math.max(...values);

  return (
    <Card
      title="Plot 5 — Predicted vs. Reference"
      description={`Downscaled (predicted) vs. this panchayat's own forecast (reference — not a field observation). R² = ${formatNumber(validation.rSquared.value, { decimals: 3 })}, RMSE = ${formatNumber(validation.rmse.value, { decimals: 3, suffix: "°C" })}.`}
    >
      <PlotlyChart
        data={[
          {
            type: "scatter",
            mode: "markers",
            x: validation.pairs.map((p) => p.observed),
            y: validation.pairs.map((p) => p.predicted),
            marker: { size: 6, opacity: 0.6 },
            name: "Hourly pairs",
            hovertemplate:
              "Reference: %{x:.1f}°C<br>Predicted: %{y:.1f}°C<extra></extra>",
          },
          {
            type: "scatter",
            mode: "lines",
            x: [lineMin, lineMax],
            y: [lineMin, lineMax],
            line: { color: "gray", dash: "dash" },
            name: "1:1 line",
            hoverinfo: "skip",
          },
        ]}
        layout={{
          height: 400,
          margin: { t: 20 },
          xaxis: { title: "Reference temperature (°C)" },
          yaxis: { title: "Predicted temperature (°C)" },
          showlegend: false,
        }}
        style={{ width: "100%" }}
        config={{
          displayModeBar: "hover",
          displaylogo: false,
          responsive: true,
          toImageButtonOptions: {
            format: "png",
            filename: "predicted-vs-reference-temperature",
            scale: 2,
          },
        }}
      />
    </Card>
  );
}

function ResidualsSection({ data, selectedPanchayat }) {
  if (!selectedPanchayat) {
    return (
      <Card title="Plot 6 — Time Series Residuals">
        <EmptyState
          title="Select a panchayat to inspect residuals"
          description="This comparison is per-panchayat — choose one in the header's panchayat selector."
        />
      </Card>
    );
  }

  const validation = selectTemperatureValidationAgainstReference(
    data,
    selectedPanchayat,
  );

  if (validation.pairCount === 0) {
    return (
      <Card title="Plot 6 — Time Series Residuals">
        <EmptyState title="No overlapping timestamps to compare" />
      </Card>
    );
  }

  return (
    <Card
      title="Plot 6 — Time Series Residuals"
      description="Predicted minus reference temperature over the forecast window — a sustained drift away from zero would indicate a seasonal/time-of-day bias."
    >
      <PlotlyChart
        data={[
          {
            type: "scatter",
            mode: "lines+markers",
            x: validation.pairs.map((p) => p.date),
            y: validation.pairs.map((p) => p.residual),
            marker: { size: 4 },
            line: { width: 1 },
            hovertemplate: "%{x}<br>Residual: %{y:.2f}°C<extra></extra>",
          },
        ]}
        layout={{
          height: 320,
          margin: { t: 20 },
          yaxis: {
            title: "Residual (°C)",
            zeroline: true,
            zerolinecolor: "#9ca3af",
            zerolinewidth: 1,
          },
          xaxis: { title: "Time" },
        }}
        style={{ width: "100%" }}
        config={{ displayModeBar: false, responsive: true }}
      />
    </Card>
  );
}

function CropThresholdSection({ data, selectedPanchayat }) {
  const thresholdOverrides = useThresholdStore((state) => state.overrides);
  const effectiveThresholds = selectEffectiveCropThresholds(thresholdOverrides);
  const [cropName, setCropName] = useState(DEFAULT_CROP_THRESHOLDS[0].crop);
  const crop = effectiveThresholds.find((c) => c.crop === cropName);
  const forecast = selectedPanchayat
    ? selectForecastPanchayat(data, selectedPanchayat)
    : data.forecastBlock;

  if (forecast.length === 0) {
    return (
      <Card title="Plot 7 — Crop Threshold Time Series">
        <EmptyState title="No forecast data available" />
      </Card>
    );
  }

  const colors = forecast.map((r) => {
    if (r.temperatureC == null) return "#9ca3af";
    if (r.temperatureC >= crop.heatStressC) return RISK_COLORS.red;
    if (r.temperatureC <= crop.coldStressC) return "#2563eb";
    return RISK_COLORS.green;
  });

  return (
    <Card
      title="Plot 7 — Crop Threshold Time Series"
      description={`Forecast temperature, ${selectedPanchayat ?? "Chas Block"}, against ${cropName}'s heat/cold stress thresholds.`}
    >
      <label className="mb-3 flex items-center gap-2 text-xs text-foreground/60">
        Crop:
        <select
          value={cropName}
          onChange={(e) => setCropName(e.target.value)}
          className="rounded-md border border-border bg-surface px-2 py-1 "
        >
          {effectiveThresholds.map((c) => (
            <option key={c.crop} value={c.crop}>
              {c.crop}
            </option>
          ))}
        </select>
      </label>
      <PlotlyChart
        data={[
          {
            type: "scatter",
            mode: "lines+markers",
            x: forecast.map((r) => r.date),
            y: forecast.map((r) => r.temperatureC),
            marker: { color: colors, size: 5 },
            line: { color: "#9ca3af", width: 1 },
            hovertemplate: "%{x}<br>%{y:.1f}°C<extra></extra>",
          },
        ]}
        layout={{
          height: 340,
          margin: { t: 20 },
          yaxis: { title: "Temperature (°C)" },
          shapes: [
            {
              type: "line",
              x0: 0,
              x1: 1,
              xref: "paper",
              y0: crop.heatStressC,
              y1: crop.heatStressC,
              line: { color: RISK_COLORS.red, dash: "dash", width: 1 },
            },
            {
              type: "line",
              x0: 0,
              x1: 1,
              xref: "paper",
              y0: crop.coldStressC,
              y1: crop.coldStressC,
              line: { color: "#2563eb", dash: "dash", width: 1 },
            },
          ],
        }}
        style={{ width: "100%" }}
        config={{ displayModeBar: false, responsive: true }}
      />
    </Card>
  );
}

function RainfallProbabilitySection({ data, selectedPanchayat }) {
  if (!selectedPanchayat) {
    return (
      <Card title="Plot 8 — Rainfall Probability Distribution">
        <EmptyState
          title="Select a panchayat to see rain probability"
          description="Only the panchayat-level forecast source provides Rain_Probability_Pct; the block forecast does not."
        />
      </Card>
    );
  }

  const forecast = selectForecastPanchayat(data, selectedPanchayat);
  const probabilities = forecast.map((r) =>
    getRainfallProbability({ rainProbabilityPct: r.rainProbabilityPct }),
  );

  if (forecast.length === 0) {
    return (
      <Card title="Plot 8 — Rainfall Probability Distribution">
        <EmptyState title="No forecast data available" />
      </Card>
    );
  }

  const colors = probabilities.map((p) => {
    if (!p.available) return "#9ca3af";
    if (p.value >= 80) return RISK_COLORS.red;
    if (p.value >= 60) return RISK_COLORS.orange;
    if (p.value >= 30) return RISK_COLORS.yellow;
    return RISK_COLORS.green;
  });

  return (
    <Card
      title="Plot 8 — Rainfall Probability Distribution"
      description={`Hourly rain probability, ${selectedPanchayat}. This is a single deterministic forecast value from the source data — no uncertainty band exists to display alongside it.`}
    >
      <PlotlyChart
        data={[
          {
            type: "bar",
            x: forecast.map((r) => r.date),
            y: probabilities.map((p) => p.value),
            marker: { color: colors },
            hovertemplate: "%{x}<br>Rain probability: %{y}%<extra></extra>",
          },
        ]}
        layout={{
          height: 320,
          margin: { t: 20 },
          yaxis: { title: "Rain probability (%)", range: [0, 100] },
        }}
        style={{ width: "100%" }}
        config={{ displayModeBar: false, responsive: true }}
      />
    </Card>
  );
}

function SoilMoistureGaugeSection({ data, selectedPanchayat }) {
  if (!selectedPanchayat) {
    return (
      <Card title="Plot 9 — Soil Moisture Gauge">
        <EmptyState
          title="Select a panchayat to see the gauge"
          description="Only the panchayat-level forecast source provides Soil_Moisture at this granularity; the block forecast does not."
        />
      </Card>
    );
  }

  const forecast = selectForecastPanchayat(data, selectedPanchayat);
  const current = forecast[0];

  if (!current) {
    return (
      <Card title="Plot 9 — Soil Moisture Gauge">
        <EmptyState title="No forecast data available" />
      </Card>
    );
  }

  return (
    <Card
      title="Plot 9 — Soil Moisture Gauge"
      description={`Current volumetric soil moisture, ${selectedPanchayat}, at ${formatHourLabel(current.date)}. Zone boundaries (0.24 / 0.26 m³/m³) are illustrative defaults, not an authoritative agronomic standard — see the irrigation decision engine for the actual recommendation logic.`}
    >
      <Gauge
        value={current.soilMoisture}
        min={0}
        max={0.4}
        zones={[
          { to: 0.24, color: RISK_COLORS.red },
          { to: 0.26, color: RISK_COLORS.yellow },
          { to: 0.4, color: RISK_COLORS.green },
        ]}
        label="Soil moisture"
        valueLabel={formatNumber(current.soilMoisture, {
          decimals: 3,
          suffix: "m³/m³",
        })}
      />
    </Card>
  );
}

function VulnerabilityRankingSection({ data }) {
  return (
    <Card
      title="Plot 11 — Panchayat Vulnerability Ranking"
      description="Climate/soil exposure proxy — rainfall variability, soil water capacity, elevation range and soil moisture. Excludes population/livelihoods, which don't exist anywhere in /data. Ranking is relative to these 5 panchayats only, not an absolute score."
    >
      <VulnerabilityRankingChart data={data} />
    </Card>
  );
}

const RISK_LEVEL_TO_NUMBER = { green: 0, yellow: 1, orange: 2, red: 3 };
const OPERATIONS_MATRIX_COLORSCALE = [
  [0, RISK_COLORS.green],
  [0.333, RISK_COLORS.green],
  [0.334, RISK_COLORS.yellow],
  [0.666, RISK_COLORS.yellow],
  [0.667, RISK_COLORS.orange],
  [0.999, RISK_COLORS.orange],
  [1, RISK_COLORS.red],
];

function OperationsWindowMatrixSection({ data, selectedPanchayat }) {
  if (!selectedPanchayat) {
    return (
      <Card title="Plot 12 — Farm Operations Window Matrix">
        <EmptyState
          title="Select a panchayat to see the operations matrix"
          description="Spray and irrigation windows need wind speed, rain probability and soil moisture — only the panchayat-level forecast provides those."
        />
      </Card>
    );
  }

  const forecast = selectForecastPanchayat(data, selectedPanchayat);
  const byDay = groupRecordsByDay(forecast);
  const dayKeys = Array.from(byDay.keys()).sort();

  if (dayKeys.length === 0) {
    return (
      <Card title="Plot 12 — Farm Operations Window Matrix">
        <EmptyState title="No forecast data available" />
      </Card>
    );
  }

  const representatives = dayKeys.map((key) =>
    pickRepresentativeHour(byDay.get(key)),
  );

  const sprayResults = representatives.map((r) =>
    computeSprayWindow({
      windSpeedKmh: r.windSpeedKmh,
      rainProbabilityPct: r.rainProbabilityPct,
      tempC: r.temperatureC,
    }),
  );
  const irrigationResults = representatives.map((r) =>
    computeIrrigationWindow({
      soilMoisture: r.soilMoisture,
      rainProbabilityPct: r.rainProbabilityPct,
    }),
  );
  const frostResults = representatives.map((r) =>
    computeFrostRisk({ tempMinC: r.temperatureC }),
  );

  const sprayLevels = sprayResults.map((res) =>
    res.available ? (res.value.favorable ? "green" : "red") : null,
  );
  const irrigateLevels = irrigationResults.map((res) =>
    res.available ? (res.value.irrigate ? "yellow" : "green") : null,
  );
  const frostLevels = frostResults.map((res) =>
    res.available ? mapFrostRiskToRiskLevel(res.value) : null,
  );

  const rows = [
    {
      label: "Spray",
      levels: sprayLevels,
      text: sprayLevels.map((l) =>
        l === "green" ? "Favorable" : l === "red" ? "Unfavorable" : "—",
      ),
    },
    {
      label: "Irrigate",
      levels: irrigateLevels,
      text: irrigateLevels.map((l) =>
        l === "yellow" ? "Irrigate" : l === "green" ? "No action" : "—",
      ),
    },
    {
      label: "Frost Risk",
      levels: frostLevels,
      text: frostResults.map((r) => (r.available ? r.value : "—")),
    },
  ];

  return (
    <Card
      title="Plot 12 — Farm Operations Window Matrix"
      description={`${selectedPanchayat}, one representative afternoon (~14:00) reading per day. Spray/irrigation use src/lib/calculations/sprayWindow.js and irrigationWindow.js's default thresholds; frost risk reuses hourly temperature as a rough daily-minimum proxy.`}
    >
      <PlotlyChart
        data={[
          {
            type: "heatmap",
            x: dayKeys.map((k) => formatDateLabel(new Date(k))),
            y: rows.map((row) => row.label),
            z: rows.map((row) =>
              row.levels.map((level) =>
                level ? RISK_LEVEL_TO_NUMBER[level] : null,
              ),
            ),
            text: rows.map((row) => row.text),
            texttemplate: "%{text}",
            zmin: 0,
            zmax: 3,
            colorscale: OPERATIONS_MATRIX_COLORSCALE,
            showscale: false,
            hovertemplate: "%{y}, %{x}: %{text}<extra></extra>",
          },
        ]}
        layout={{ height: 280, margin: { t: 20, l: 90 } }}
        style={{ width: "100%" }}
        config={{ displayModeBar: false, responsive: true }}
      />
    </Card>
  );
}

function WindDistributionSection({ data, selectedPanchayat }) {
  if (!selectedPanchayat) {
    return (
      <Card title="Plot 13 — Wind Distribution">
        <EmptyState
          title="Select a panchayat to see wind data"
          description="Only the panchayat-level forecast provides Wind_Speed_kmh; the block forecast does not."
        />
      </Card>
    );
  }

  const speeds = selectForecastPanchayat(data, selectedPanchayat)
    .map((r) => r.windSpeedKmh)
    .filter((v) => v != null);

  if (speeds.length === 0) {
    return (
      <Card title="Plot 13 — Wind Distribution">
        <EmptyState title="No wind speed data available" />
      </Card>
    );
  }

  return (
    <Card
      title="Plot 13 — Wind Distribution"
      description={`No wind direction data exists anywhere in /data (see src/lib/calculations/windSpeed.js's getWindDirection — always unavailable), so a true compass wind rose cannot be drawn without fabricating directions. Shown instead: the real hourly wind speed distribution for ${selectedPanchayat}.`}
    >
      <PlotlyChart
        data={[
          {
            type: "histogram",
            x: speeds,
            marker: { color: "#64748b" },
            hovertemplate: "%{x} km/h<extra></extra>",
          },
        ]}
        layout={{
          height: 300,
          margin: { t: 20 },
          xaxis: { title: "Wind speed (km/h)" },
          yaxis: { title: "Hours" },
        }}
        style={{ width: "100%" }}
        config={{ displayModeBar: false, responsive: true }}
      />
    </Card>
  );
}

function ClimateGridHeatmap({
  title,
  description,
  grid,
  days,
  panchayats,
  colorscale,
  unit,
  valueFormat = "%{z:.1f}",
}) {
  const hasData = grid.some((row) => row.some((v) => v !== null));

  if (!hasData) {
    return (
      <Card title={title} description={description}>
        <EmptyState title="No data available" />
      </Card>
    );
  }

  return (
    <Card title={title} description={description}>
      <PlotlyChart
        data={[
          {
            type: "heatmap",
            x: days.map((d) => formatDateLabel(new Date(d))),
            y: panchayats,
            z: grid,
            colorscale,
            hovertemplate: `%{y}, %{x}: ${valueFormat} ${unit}<extra></extra>`,
            colorbar: { title: unit },
          },
        ]}
        layout={{ height: 280, margin: { t: 20, l: 120 } }}
        style={{ width: "100%" }}
        config={{ displayModeBar: false, responsive: true }}
      />
    </Card>
  );
}

function CloudCoverHeatmapSection({ data }) {
  const { panchayats, days, grid } = selectDailyCloudCoverGrid(data);
  return (
    <ClimateGridHeatmap
      title="Plot 14 — Cloud Cover Heatmap (estimate)"
      description="Estimated from each day's temperature range (a small diurnal range suggests more cloud) — a heuristic proxy, not an observation. See src/lib/calculations/cloudCover.js."
      grid={grid}
      days={days}
      panchayats={panchayats}
      colorscale="Blues"
      unit="% (est.)"
    />
  );
}

function HumidityHeatmapSection({ data }) {
  const { panchayats, days, grid } = selectDailyHumidityGrid(data);
  return (
    <ClimateGridHeatmap
      title="Plot 15 — Humidity Heatmap"
      description="Mean daily relative humidity from the panchayat forecast's own Humidity_Pct field — an observed forecast value, not derived."
      grid={grid}
      days={days}
      panchayats={panchayats}
      colorscale="YlGnBu"
      unit="%"
    />
  );
}

function RainfallAccumulationSection({ data }) {
  const series = selectRainfallAccumulationSeries(data);
  const hasData = series.some((s) => s.dates.length > 0);

  if (!hasData) {
    return (
      <Card title="Plot 16 — Rainfall Accumulation">
        <EmptyState title="No forecast rainfall data available" />
      </Card>
    );
  }

  return (
    <Card
      title="Plot 16 — Rainfall Accumulation"
      description="Cumulative forecast rainfall over the week, per panchayat."
    >
      <PlotlyChart
        data={series.map((s) => ({
          type: "scatter",
          mode: "lines",
          name: s.panchayat,
          x: s.dates,
          y: s.cumulativeMm,
          hovertemplate: "%{x}<br>%{y:.1f} mm cumulative<extra></extra>",
        }))}
        layout={{
          height: 340,
          margin: { t: 20 },
          yaxis: { title: "Cumulative rainfall (mm)" },
        }}
        style={{ width: "100%" }}
        config={{ displayModeBar: false, responsive: true }}
      />
    </Card>
  );
}

function ForecastSpaghettiSection({ data, selectedPanchayat }) {
  if (!selectedPanchayat) {
    return (
      <Card title="Plot 17 — Forecast Spaghetti">
        <EmptyState
          title="Select a panchayat to see the spaghetti plot"
          description="Downscaling is per-panchayat — choose one in the header's panchayat selector."
        />
      </Card>
    );
  }

  const frames = selectTemperatureEnsembleFrames(data, selectedPanchayat);
  if (frames.length === 0 || !frames[0].available) {
    return (
      <Card title="Plot 17 — Forecast Spaghetti">
        <EmptyState title="No ensemble data available" />
      </Card>
    );
  }

  const memberIds = frames[0].members.map((m) => m.id);

  return (
    <Card
      title="Plot 17 — Forecast Spaghetti"
      description={`Each thin line is one of the 9 deterministic sensitivity-ensemble variants for ${selectedPanchayat} — a surrogate spread from this app's own downscaling parameters, not a physically sourced multi-model weather ensemble.`}
    >
      <PlotlyChart
        data={memberIds.map((id) => {
          const label = frames[0].members.find((m) => m.id === id)?.label ?? id;
          const isBaseline = id === "baseline";
          return {
            type: "scatter",
            mode: "lines",
            name: label,
            x: frames.map((f) => f.date),
            y: frames.map(
              (f) => f.members.find((m) => m.id === id)?.value ?? null,
            ),
            line: {
              width: isBaseline ? 2.5 : 1,
              dash: isBaseline ? "solid" : "dot",
            },
            opacity: isBaseline ? 1 : 0.6,
          };
        })}
        layout={{
          height: 360,
          margin: { t: 20 },
          yaxis: { title: "Downscaled temperature (°C)" },
          legend: { font: { size: 9 } },
        }}
        style={{ width: "100%" }}
        config={{ displayModeBar: false, responsive: true }}
      />
    </Card>
  );
}

function AnomalyMapSection({ data }) {
  const anomalies = selectTemperatureAnomalyByPanchayat(data, "-09").filter(
    (a) => a.anomalyC !== null,
  );

  if (anomalies.length === 0) {
    return (
      <Card title="Plot 18 — Anomaly Map">
        <EmptyState title="Not enough historical/forecast data to compute anomalies" />
      </Card>
    );
  }

  return (
    <Card
      title="Plot 18 — Anomaly Map"
      description="This forecast week's mean temperature minus the 10-year September historical average, per panchayat. The forecast window spans late September into early October, so this is compared against September's normal specifically."
    >
      <PlotlyChart
        data={[
          {
            type: "bar",
            x: anomalies.map((a) => a.panchayat),
            y: anomalies.map((a) => a.anomalyC),
            marker: {
              color: anomalies.map((a) =>
                a.anomalyC >= 0 ? RISK_COLORS.red : "#2563eb",
              ),
            },
            hovertemplate: "%{x}: %{y:+.2f}°C vs. Sept normal<extra></extra>",
          },
        ]}
        layout={{
          height: 320,
          margin: { t: 20 },
          yaxis: {
            title: "Anomaly (°C)",
            zeroline: true,
            zerolinecolor: "#9ca3af",
          },
        }}
        style={{ width: "100%" }}
        config={{ displayModeBar: false, responsive: true }}
      />
    </Card>
  );
}

function SpiSpeiSection({ data, selectedPanchayat }) {
  if (!selectedPanchayat) {
    return (
      <Card title="Plot 19 — SPI/SPEI">
        <EmptyState
          title="Select a panchayat to see SPI/SPEI"
          description="ET0 (for SPEI) needs that panchayat's own centroid latitude."
        />
      </Card>
    );
  }

  const series = selectSpiSpeiTimeSeries(data, selectedPanchayat);
  if (series.length === 0) {
    return (
      <Card title="Plot 19 — SPI/SPEI">
        <EmptyState title="No historical data available" />
      </Card>
    );
  }

  return (
    <Card
      title="Plot 19 — SPI/SPEI"
      description={`${selectedPanchayat}, 10-year monthly history. Simplified z-score proxies (see src/lib/calculations/spi.js), not the WMO Gamma-fitted SPI/SPEI — 10 years per calendar month is too short to responsibly fit a Gamma distribution.`}
    >
      <PlotlyChart
        data={[
          {
            type: "scatter",
            mode: "lines",
            name: "SPI (precipitation)",
            x: series.map((p) => p.date),
            y: series.map((p) => (p.spi.available ? p.spi.value : null)),
          },
          {
            type: "scatter",
            mode: "lines",
            name: "SPEI (precip − ET0)",
            x: series.map((p) => p.date),
            y: series.map((p) => (p.spei.available ? p.spei.value : null)),
          },
        ]}
        layout={{
          height: 340,
          margin: { t: 20 },
          yaxis: {
            title: "Standardized index (σ)",
            zeroline: true,
            zerolinecolor: "#9ca3af",
          },
        }}
        style={{ width: "100%" }}
        config={{ displayModeBar: false, responsive: true }}
      />
    </Card>
  );
}

function HeatStressIndexSection({ data, selectedPanchayat }) {
  if (!selectedPanchayat) {
    return (
      <Card title="Plot 20 — Heat Stress Index">
        <EmptyState
          title="Select a panchayat to see heat stress"
          description="Heat index needs humidity, which only the panchayat-level forecast provides."
        />
      </Card>
    );
  }

  const series = selectHeatIndexSeries(data, selectedPanchayat);
  if (series.length === 0) {
    return (
      <Card title="Plot 20 — Heat Stress Index">
        <EmptyState title="No forecast data available" />
      </Card>
    );
  }

  return (
    <Card
      title="Plot 20 — Heat Stress Index"
      description={`NOAA apparent-temperature index, ${selectedPanchayat}, hourly.`}
    >
      <PlotlyChart
        data={[
          {
            type: "scatter",
            mode: "lines",
            x: series.map((p) => p.date),
            y: series.map((p) =>
              p.heatIndex.available ? p.heatIndex.value : null,
            ),
            line: { color: RISK_COLORS.orange },
            hovertemplate: "%{x}<br>%{y:.1f}°C<extra></extra>",
          },
        ]}
        layout={{
          height: 320,
          margin: { t: 20 },
          yaxis: { title: "Heat index (°C)" },
        }}
        style={{ width: "100%" }}
        config={{ displayModeBar: false, responsive: true }}
      />
    </Card>
  );
}

function FrostRiskCalendarSection({ data }) {
  const { panchayats, days, grid } = selectFrostRiskGrid(data);
  const hasData = grid.some((row) => row.some((v) => v !== null));

  if (!hasData) {
    return (
      <Card title="Plot 21 — Frost Risk Calendar">
        <EmptyState title="No forecast data available" />
      </Card>
    );
  }

  return (
    <Card
      title="Plot 21 — Frost Risk Calendar"
      description="Daily minimum forecast temperature vs. frost thresholds (src/lib/calculations/frostRisk.js), all panchayats."
    >
      <PlotlyChart
        data={[
          {
            type: "heatmap",
            x: days.map((d) => formatDateLabel(new Date(d))),
            y: panchayats,
            z: grid.map((row) =>
              row.map((level) =>
                level
                  ? RISK_LEVEL_TO_NUMBER[mapFrostRiskToRiskLevel(level)]
                  : null,
              ),
            ),
            text: grid,
            texttemplate: "%{text}",
            zmin: 0,
            zmax: 3,
            colorscale: OPERATIONS_MATRIX_COLORSCALE,
            showscale: false,
            hovertemplate: "%{y}, %{x}: %{text}<extra></extra>",
          },
        ]}
        layout={{ height: 280, margin: { t: 20, l: 120 } }}
        style={{ width: "100%" }}
        config={{ displayModeBar: false, responsive: true }}
      />
    </Card>
  );
}

function GddTrackerSection({ data, selectedPanchayat }) {
  const thresholdOverrides = useThresholdStore((state) => state.overrides);
  const effectiveThresholds = selectEffectiveCropThresholds(thresholdOverrides);
  const [cropName, setCropName] = useState(DEFAULT_CROP_THRESHOLDS[0].crop);
  const crop = effectiveThresholds.find((c) => c.crop === cropName);

  if (!selectedPanchayat) {
    return (
      <Card title="Plot 22 — GDD Tracker">
        <EmptyState title="Select a panchayat to track GDD" />
      </Card>
    );
  }

  const series = selectGddAccumulation(data, selectedPanchayat, {
    baseTempC: crop.baseTempC,
  });
  if (series.length === 0) {
    return (
      <Card title="Plot 22 — GDD Tracker">
        <EmptyState title="No forecast data available" />
      </Card>
    );
  }

  return (
    <Card
      title="Plot 22 — GDD Tracker"
      description={`Cumulative Growing Degree Days over the forecast week, ${selectedPanchayat}, base temperature ${crop.baseTempC}°C (${cropName}).`}
    >
      <label className="mb-3 flex items-center gap-2 text-xs text-foreground/60">
        Crop:
        <select
          value={cropName}
          onChange={(e) => setCropName(e.target.value)}
          className="rounded-md border border-border bg-surface px-2 py-1 "
        >
          {effectiveThresholds.map((c) => (
            <option key={c.crop} value={c.crop}>
              {c.crop}
            </option>
          ))}
        </select>
      </label>
      <PlotlyChart
        data={[
          {
            type: "scatter",
            mode: "lines+markers",
            x: series.map((p) => formatDateLabel(new Date(p.day))),
            y: series.map((p) => p.cumulativeGdd),
            hovertemplate:
              "%{x}<br>Cumulative GDD: %{y:.1f}°C·day<extra></extra>",
          },
        ]}
        layout={{
          height: 300,
          margin: { t: 20 },
          yaxis: { title: "Cumulative GDD (°C·day)" },
        }}
        style={{ width: "100%" }}
        config={{ displayModeBar: false, responsive: true }}
      />
    </Card>
  );
}

function WaterBalanceSection({ data, selectedPanchayat }) {
  if (!selectedPanchayat) {
    return (
      <Card title="Plot 23 — Water Balance">
        <EmptyState title="Select a panchayat to see water balance" />
      </Card>
    );
  }

  const series = selectWaterBalanceSeries(data, selectedPanchayat);
  if (series.length === 0) {
    return (
      <Card title="Plot 23 — Water Balance">
        <EmptyState title="No forecast data available" />
      </Card>
    );
  }

  return (
    <Card
      title="Plot 23 — Water Balance"
      description={`Daily precipitation minus ET0 (Hargreaves), ${selectedPanchayat} — positive is a surplus, negative a deficit.`}
    >
      <PlotlyChart
        data={[
          {
            type: "bar",
            x: series.map((p) => formatDateLabel(new Date(p.day))),
            y: series.map((p) => p.waterBalanceMm),
            marker: {
              color: series.map((p) =>
                (p.waterBalanceMm ?? 0) >= 0 ? "#2563eb" : RISK_COLORS.red,
              ),
            },
            hovertemplate: "%{x}: %{y:.1f} mm<extra></extra>",
          },
        ]}
        layout={{
          height: 300,
          margin: { t: 20 },
          yaxis: {
            title: "Water balance (mm)",
            zeroline: true,
            zerolinecolor: "#9ca3af",
          },
        }}
        style={{ width: "100%" }}
        config={{ displayModeBar: false, responsive: true }}
      />
    </Card>
  );
}

function PanchayatComparisonSection({ data }) {
  const summary = selectPanchayatComparisonSummary(data);

  if (summary.length === 0) {
    return (
      <Card title="Plot 24 — Panchayat Comparison Dashboard">
        <EmptyState title="No data available" />
      </Card>
    );
  }

  return (
    <Card
      title="Plot 24 — Panchayat Comparison Dashboard"
      description="Current conditions and derived status, all panchayats at a glance — reuses every calculation built so far, no new logic."
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-foreground/40 ">
              <th className="py-2 pr-4">Panchayat</th>
              <th className="py-2 pr-4">Temp</th>
              <th className="py-2 pr-4">Humidity</th>
              <th className="py-2 pr-4">Rain prob.</th>
              <th className="py-2 pr-4">Soil moisture</th>
              <th className="py-2 pr-4">Spray</th>
              <th className="py-2 pr-4">Irrigate</th>
              <th className="py-2">Vulnerability</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((row) => (
              <tr key={row.panchayat} className="border-b border-border ">
                <td className="py-2 pr-4 font-medium">{row.panchayat}</td>
                <td className="py-2 pr-4">
                  {formatNumber(row.temperatureC, {
                    decimals: 1,
                    suffix: "°C",
                  })}
                </td>
                <td className="py-2 pr-4">
                  {formatNumber(row.humidityPct, { decimals: 0, suffix: "%" })}
                </td>
                <td className="py-2 pr-4">
                  {formatNumber(row.rainProbabilityPct, {
                    decimals: 0,
                    suffix: "%",
                  })}
                </td>
                <td className="py-2 pr-4">
                  {formatNumber(row.soilMoisture, {
                    decimals: 3,
                    suffix: "m³/m³",
                  })}
                </td>
                <td className="py-2 pr-4">
                  {row.sprayFavorable === null
                    ? "—"
                    : row.sprayFavorable
                      ? "Favorable"
                      : "Unfavorable"}
                </td>
                <td className="py-2 pr-4">
                  {row.irrigate === null
                    ? "—"
                    : row.irrigate
                      ? "Recommended"
                      : "Not needed"}
                </td>
                <td className="py-2">
                  {formatNumber(row.vulnerabilityIndex, { decimals: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

const ANIMATION_VARIABLES = [
  { key: "temperature", label: "Temperature" },
  { key: "rainfall", label: "Rainfall" },
  { key: "soilMoisture", label: "Soil Moisture" },
];
const ANIMATION_SPEED_OPTIONS = [
  { label: "Slow", intervalMs: 1200 },
  { label: "Normal", intervalMs: 700 },
  { label: "Fast", intervalMs: 300 },
];

function ModelAnimationSection({ data }) {
  const [variableKey, setVariableKey] = useState(ANIMATION_VARIABLES[0].key);
  const [frameIndex, setFrameIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedLabel, setSpeedLabel] = useState("Normal");
  const intervalRef = useRef(null);

  const { frames, unit, range } = selectAnimationFrames(data, variableKey);

  useEffect(() => {
    if (!playing || frames.length === 0) return undefined;
    const speed =
      ANIMATION_SPEED_OPTIONS.find((s) => s.label === speedLabel) ??
      ANIMATION_SPEED_OPTIONS[1];
    intervalRef.current = setInterval(() => {
      setFrameIndex((i) => (i + 1) % frames.length);
    }, speed.intervalMs);
    return () => clearInterval(intervalRef.current);
  }, [playing, speedLabel, frames.length]);

  if (frames.length === 0 || !range) {
    return (
      <Card title="Model Animation">
        <EmptyState title="No forecast data available" />
      </Card>
    );
  }

  const currentFrame = frames[Math.min(frameIndex, frames.length - 1)];

  return (
    <Card
      title="Model Animation"
      description="Daily downscaled values animated across the forecast week — hover a panchayat for its exact value. Color scale is fixed across all frames so it stays comparable as the animation plays."
    >
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-xs text-foreground/60">
          Variable:
          <select
            value={variableKey}
            onChange={(e) => {
              setVariableKey(e.target.value);
              setFrameIndex(0);
              setPlaying(false);
            }}
            className="rounded-md border border-border bg-surface px-2 py-1 "
          >
            {ANIMATION_VARIABLES.map((v) => (
              <option key={v.key} value={v.key}>
                {v.label}
              </option>
            ))}
          </select>
        </label>
        <ColorLegend range={range} unit={unit} />
      </div>

      <p className="mb-2 text-xs text-foreground/50">
        {formatDateLabel(new Date(`${currentFrame.day}T00:00:00Z`))}
      </p>

      <AnimatedChoroplethMap
        borders={data.borders}
        valuesByPanchayat={currentFrame.byPanchayat}
        range={range}
        unit={unit}
        frameKey={`${variableKey}-${frameIndex}`}
      />

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className="rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground transition hover:opacity-90"
        >
          {playing ? "Pause" : "Play"}
        </button>
        <input
          type="range"
          min={0}
          max={frames.length - 1}
          value={frameIndex}
          onChange={(e) => {
            setPlaying(false);
            setFrameIndex(Number(e.target.value));
          }}
          className="w-full max-w-xs"
        />
        <label className="flex items-center gap-1 text-xs text-foreground/60">
          Speed:
          <select
            value={speedLabel}
            onChange={(e) => setSpeedLabel(e.target.value)}
            className="rounded-md border border-border bg-surface px-1.5 py-1 "
          >
            {ANIMATION_SPEED_OPTIONS.map((s) => (
              <option key={s.label} value={s.label}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </Card>
  );
}
