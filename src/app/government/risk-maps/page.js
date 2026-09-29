"use client";

import { useState } from "react";
import { useDataStore } from "@/store/dataStore";
import { useSelectionStore } from "@/store/selectionStore";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Legend } from "@/components/ui/Legend";
import { MetricTile } from "@/components/ui/MetricTile";
import { RiskLayerMap } from "@/components/maps/RiskLayerMap";
import {
  RISK_LAYERS,
  selectRiskLayerForAllPanchayats,
} from "@/data/selectors/riskMaps";
import { selectForecastPanchayat } from "@/data/selectors";
import { formatHourLabel } from "@/lib/formatters";
import { RISK_COLORS } from "@/lib/riskLevels";

const THREE_STEP_LEGEND = [
  { color: RISK_COLORS.green, label: "Low / none" },
  { color: RISK_COLORS.yellow, label: "Watch / caution" },
  { color: RISK_COLORS.red, label: "Severe / danger" },
];

const FOUR_STEP_LEGEND = [
  { color: RISK_COLORS.green, label: "None" },
  { color: RISK_COLORS.yellow, label: "Watch" },
  { color: RISK_COLORS.orange, label: "Moderate" },
  { color: RISK_COLORS.red, label: "Severe" },
];

const LEGEND_BY_LAYER = {
  drought: THREE_STEP_LEGEND,
  water: [
    { color: RISK_COLORS.red, label: "Scarce" },
    { color: RISK_COLORS.yellow, label: "Watch" },
    { color: RISK_COLORS.green, label: "Plentiful" },
  ],
  flood: FOUR_STEP_LEGEND,
  heatwave: THREE_STEP_LEGEND,
  coldWave: THREE_STEP_LEGEND,
  pestDisease: THREE_STEP_LEGEND,
  cropHealth: FOUR_STEP_LEGEND,
};

export default function GovernmentRiskMapsPage() {
  const status = useDataStore((state) => state.status);
  const error = useDataStore((state) => state.error);
  const data = useDataStore((state) => state.data);
  const selectedPanchayat = useSelectionStore(
    (state) => state.selectedPanchayat,
  );
  const setSelectedPanchayat = useSelectionStore(
    (state) => state.setSelectedPanchayat,
  );

  const [activeLayerKey, setActiveLayerKey] = useState(RISK_LAYERS[0].key);

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

  const activeLayer = RISK_LAYERS.find((l) => l.key === activeLayerKey);
  const layerValues = selectRiskLayerForAllPanchayats(data, activeLayerKey);
  const anyAvailable = Object.values(layerValues).some((v) => v.available);
  const currentTimestamp = data.panchayats
    .map((p) => selectForecastPanchayat(data, p)[0]?.date)
    .find((d) => d instanceof Date);
  const selectedResult = selectedPanchayat
    ? layerValues[selectedPanchayat]
    : null;

  return (
    <main className="flex-1 space-y-6 px-6 py-8">
      <div>
        <h1 className="text-xl font-semibold">Risk Maps</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Risk layers over the 5 panchayats. Every layer&apos;s source/method is
          described below the map.
        </p>
      </div>

      <Card title="Layer">
        <div className="flex flex-wrap gap-2">
          {RISK_LAYERS.map((layer) => (
            <Button
              key={layer.key}
              variant={layer.key === activeLayerKey ? "primary" : "secondary"}
              size="sm"
              onClick={() => setActiveLayerKey(layer.key)}
            >
              {layer.label}
            </Button>
          ))}
        </div>
      </Card>

      <Card title={activeLayer.label} description={activeLayer.description}>
        {!anyAvailable ? (
          <EmptyState
            title="No data available for this layer"
            description={
              Object.values(layerValues)[0]?.reason ??
              "No supporting dataset exists in this environment."
            }
          />
        ) : (
          <>
            <RiskLayerMap
              borders={data.borders}
              selectedPanchayat={selectedPanchayat}
              onSelectPanchayat={setSelectedPanchayat}
              getFillColor={(name) => layerValues[name]?.color ?? "#cccccc"}
              getTooltip={(name) => {
                const result = layerValues[name];
                if (!result?.available) return `${name} — unavailable`;
                return `${name} — ${result.level ?? ""} ${result.label ? `(${result.label})` : ""}`.trim();
              }}
            />
            <div className="mt-4">
              <Legend
                items={LEGEND_BY_LAYER[activeLayerKey] ?? THREE_STEP_LEGEND}
              />
            </div>
            <p className="mt-3 text-xs text-foreground/40">
              {currentTimestamp
                ? `As of ${formatHourLabel(currentTimestamp)}. `
                : ""}
              Source: {activeLayer.description}
            </p>
          </>
        )}
      </Card>

      {selectedPanchayat ? (
        <Card title={`Selected: ${selectedPanchayat}`}>
          {selectedResult?.available ? (
            <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <MetricTile
                label={activeLayer.label}
                value={selectedResult.level ?? selectedResult.label}
              />
              <MetricTile label="Detail" value={selectedResult.label ?? "—"} />
            </dl>
          ) : (
            <EmptyState
              title="No data for this panchayat/layer"
              description={selectedResult?.reason}
            />
          )}
        </Card>
      ) : null}
    </main>
  );
}
