"use client";

import { useState } from "react";
import { useDataStore } from "@/store/dataStore";
import { useDisasterModulesStore } from "@/store/disasterModulesStore";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Tabs } from "@/components/ui/Tabs";
import {
  Table,
  TableHeadRow,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import { DISASTER_MODULES } from "@/data/disasterMeasures";
import { selectRiskLayerForAllPanchayats } from "@/data/selectors/riskMaps";

export default function DisasterModulesPage() {
  const status = useDataStore((state) => state.status);
  const error = useDataStore((state) => state.error);
  const data = useDataStore((state) => state.data);
  const activeMeasures = useDisasterModulesStore(
    (state) => state.activeMeasures,
  );
  const toggleMeasure = useDisasterModulesStore((state) => state.toggleMeasure);

  const [activeHazardKey, setActiveHazardKey] = useState(
    DISASTER_MODULES[0].key,
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

  const hazard = DISASTER_MODULES.find((h) => h.key === activeHazardKey);
  const severityByPanchayat = selectRiskLayerForAllPanchayats(
    data,
    activeHazardKey,
  );

  return (
    <main className="flex-1 space-y-6 px-6 py-8">
      <div>
        <h1 className="text-xl font-semibold">Disaster Management</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Response-measure tracking per hazard. Current severity per panchayat
          reuses the same Risk Maps data; which measures are marked active is a
          local simulation only — nothing here dispatches to any real agency or
          system.
        </p>
      </div>

      <Alert tone="info">
        SIMULATED — toggling a measure only records it in this browser; no real
        action is dispatched.
      </Alert>

      <Tabs
        tabs={DISASTER_MODULES.map((h) => ({ key: h.key, label: h.label }))}
        active={activeHazardKey}
        onChange={setActiveHazardKey}
      />

      <Card title={hazard.label}>
        <Table>
          <thead>
            <TableHeadRow>
              <TableCell as="th">Panchayat</TableCell>
              <TableCell as="th">Current severity</TableCell>
              {hazard.measures.map((measure) => (
                <TableCell as="th" key={measure}>
                  {measure}
                </TableCell>
              ))}
            </TableHeadRow>
          </thead>
          <tbody>
            {data.panchayats.map((panchayat) => {
              const severity = severityByPanchayat[panchayat];
              return (
                <TableRow key={panchayat}>
                  <TableCell>{panchayat}</TableCell>
                  <TableCell>
                    {severity?.available
                      ? (severity.level ?? severity.label)
                      : "—"}
                  </TableCell>
                  {hazard.measures.map((measure) => (
                    <TableCell key={measure}>
                      <input
                        type="checkbox"
                        checked={Boolean(
                          activeMeasures[
                            `${hazard.key}::${panchayat}::${measure}`
                          ],
                        )}
                        onChange={() =>
                          toggleMeasure(hazard.key, panchayat, measure)
                        }
                        aria-label={`${measure} for ${panchayat}`}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </tbody>
        </Table>
      </Card>
    </main>
  );
}
