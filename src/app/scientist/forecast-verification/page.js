"use client";

import { useEffect, useRef, useState } from "react";
import { useDataStore } from "@/store/dataStore";
import { useSelectionStore } from "@/store/selectionStore";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { PlotlyChart } from "@/components/charts/PlotlyChart";
import {
  EXPLORER_VARIABLES,
  selectExplorerGridAllPanchayats,
  selectExplorerSeries,
} from "@/data/selectors/explorer";
import { formatHourLabel } from "@/lib/formatters";

const SPEED_OPTIONS = [
  { label: "Slow", intervalMs: 900 },
  { label: "Normal", intervalMs: 400 },
  { label: "Fast", intervalMs: 150 },
];

export default function ForecastVerificationPage() {
  const status = useDataStore((state) => state.status);
  const error = useDataStore((state) => state.error);
  const data = useDataStore((state) => state.data);
  const selectedPanchayat = useSelectionStore(
    (state) => state.selectedPanchayat,
  );

  const [variableLabel, setVariableLabel] = useState(
    EXPLORER_VARIABLES[2].label,
  ); // "Temp Avg"

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
    <main className="flex-1 space-y-8 px-6 py-8">
      <div>
        <h1 className="text-xl font-semibold">
          Historical + Forecast Explorer
        </h1>
        <p className="mt-1 text-sm text-foreground/60">
          Compare recent history against the upcoming forecast for one variable,
          or watch the forecast evolve across all 5 panchayats hour by hour.
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground/70">
        Variable:
        <select
          value={variableLabel}
          onChange={(e) => setVariableLabel(e.target.value)}
          className="rounded-md border border-border bg-surface px-2 py-1 "
        >
          {EXPLORER_VARIABLES.map((v) => (
            <option key={v.label} value={v.label}>
              {v.label}
            </option>
          ))}
        </select>
      </label>

      <SideBySideSection
        data={data}
        selectedPanchayat={selectedPanchayat}
        variableLabel={variableLabel}
      />

      <SpatialAnimationSection
        key={variableLabel}
        data={data}
        variableLabel={variableLabel}
      />
    </main>
  );
}

function VariablePanel({ title, series }) {
  if (!series.available) {
    return (
      <div className="rounded-lg border border-border p-4 ">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/50">
          {title}
        </h3>
        <EmptyState title="Not available" description={series.reason} />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border p-4 ">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/50">
        {title}
      </h3>
      {series.note ? (
        <p className="mb-2 text-xs text-foreground/40">{series.note}</p>
      ) : null}
      <PlotlyChart
        data={[
          {
            type: "scatter",
            mode: "lines",
            x: series.dates,
            y: series.values,
            hovertemplate: `%{x}<br>%{y} ${series.unit}<extra></extra>`,
          },
        ]}
        layout={{
          height: 300,
          margin: { t: 10, b: 60 },
          yaxis: { title: series.unit },
          xaxis: { rangeslider: { visible: true, thickness: 0.1 } },
        }}
        style={{ width: "100%" }}
        config={{ displayModeBar: false, responsive: true }}
      />
    </div>
  );
}

function SideBySideSection({ data, selectedPanchayat, variableLabel }) {
  if (!selectedPanchayat) {
    return (
      <section className="rounded-lg border border-border p-5 ">
        <h2 className="text-sm font-semibold">Historical vs. Forecast</h2>
        <div className="mt-4">
          <EmptyState
            title="Select a panchayat to explore"
            description="Choose one in the header's panchayat selector — the explorer compares that panchayat's history against its forecast."
          />
        </div>
      </section>
    );
  }

  const historicalSeries = selectExplorerSeries(data, {
    source: "historical",
    panchayat: selectedPanchayat,
    variableLabel,
  });
  const forecastSeries = selectExplorerSeries(data, {
    source: "forecast",
    panchayat: selectedPanchayat,
    variableLabel,
  });

  return (
    <section className="rounded-lg border border-border p-5 ">
      <h2 className="text-sm font-semibold">
        Historical vs. Forecast — {selectedPanchayat}
      </h2>
      <p className="mt-1 text-xs text-foreground/50">
        Drag each chart&apos;s bottom range slider to zoom into a period.
        Historical is monthly (10 years); forecast is hourly (7 days).
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <VariablePanel
          title={`Historical (monthly) — ${variableLabel}`}
          series={historicalSeries}
        />
        <VariablePanel
          title={`Forecast (hourly) — ${variableLabel}`}
          series={forecastSeries}
        />
      </div>
    </section>
  );
}

function SpatialAnimationSection({ data, variableLabel }) {
  const [frameIndex, setFrameIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedLabel, setSpeedLabel] = useState("Normal");
  const intervalRef = useRef(null);

  const gridResult = selectExplorerGridAllPanchayats(data, variableLabel);

  useEffect(() => {
    if (!playing || !gridResult.available) return undefined;
    const speed =
      SPEED_OPTIONS.find((s) => s.label === speedLabel) ?? SPEED_OPTIONS[1];
    intervalRef.current = setInterval(() => {
      setFrameIndex((i) => (i + 1) % gridResult.dates.length);
    }, speed.intervalMs);
    return () => clearInterval(intervalRef.current);
  }, [playing, speedLabel, gridResult.available, gridResult.dates.length]);

  if (!gridResult.available) {
    return (
      <section className="rounded-lg border border-border p-5 ">
        <h2 className="text-sm font-semibold">
          Forecast Animation — All Panchayats
        </h2>
        <div className="mt-4">
          <EmptyState title="Not available" description={gridResult.reason} />
        </div>
      </section>
    );
  }

  const currentDate = gridResult.dates[frameIndex];
  const currentValues = gridResult.grid.map((row) => row[frameIndex]);

  return (
    <section className="rounded-lg border border-border p-5 ">
      <h2 className="text-sm font-semibold">
        Forecast Animation — All Panchayats — {variableLabel}
      </h2>
      <p className="mt-1 text-xs text-foreground/50">
        {formatHourLabel(currentDate)}
      </p>

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
          max={gridResult.dates.length - 1}
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
            {SPEED_OPTIONS.map((s) => (
              <option key={s.label} value={s.label}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <PlotlyChart
        data={[
          {
            type: "bar",
            x: gridResult.panchayats,
            y: currentValues,
            hovertemplate: `%{x}: %{y} ${gridResult.unit}<extra></extra>`,
          },
        ]}
        layout={{
          height: 300,
          margin: { t: 20 },
          yaxis: { title: gridResult.unit },
        }}
        style={{ width: "100%" }}
        config={{ displayModeBar: false, responsive: true }}
      />
    </section>
  );
}
