"use client";

import { useDataStore } from "@/store/dataStore";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { Card } from "@/components/ui/Card";
import { ElevationMap } from "@/components/maps/ElevationMap";
import { ElevationTemperatureContours } from "@/components/charts/ElevationTemperatureContours";
import { VulnerabilityRankingChart } from "@/components/charts/VulnerabilityRankingChart";

/**
 * Government portal shell — "Initially include: Plot 1,
 * Plot 3, Plot 11 using reusable chart/map components." All 3 render
 * through the exact same components the Scientist Model Diagnostics page
 * uses (`ElevationMap`, `ElevationTemperatureContours`,
 * `VulnerabilityRankingChart`, extracted from Plots 1/3/11 for this
 * reason) — no chart or map logic is duplicated for this portal.
 */
export default function GovernmentClimateOverviewPage() {
  const status = useDataStore((state) => state.status);
  const error = useDataStore((state) => state.error);
  const data = useDataStore((state) => state.data);

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
    <main className="flex-1 space-y-6 px-6 py-8">
      <div>
        <h1 className="text-xl font-semibold">Climate Overview</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Block-wide elevation, temperature and vulnerability context — the same
          underlying data every portal reads, at the level of detail relevant to
          district/block administration rather than day-to-day scientific
          diagnostics. Risk-specific map layers (drought/flood/heatwave/etc.)
          live on the Risk Maps page.
        </p>
      </div>

      <Card
        title="Elevation & Topography"
        description="Chas Block's elevation, binned from the 56,430-point survey grid."
      >
        <ElevationMap
          elevationPoints={data.elevationPoints}
          borders={data.borders}
        />
      </Card>

      <Card
        title="Elevation vs. Historical Temperature"
        description="Elevation (left) vs. IDW-interpolated historical temperature across the 5 panchayats (right) — the same underlying micro-climate differences that drive downscaling."
      >
        <ElevationTemperatureContours data={data} />
      </Card>

      <Card
        title="Panchayat Vulnerability Ranking"
        description="Climate/soil exposure proxy — rainfall variability, soil water capacity, elevation range and soil moisture deficit. Excludes population/livelihoods, which don't exist anywhere in /data. Ranking is relative to these 5 panchayats only, not an absolute score."
      >
        <VulnerabilityRankingChart data={data} />
      </Card>
    </main>
  );
}
