"use client";

import { useMemo, useState } from "react";
import { useDataStore } from "@/store/dataStore";
import { useActionTrackerStore, STATUSES } from "@/store/actionTrackerStore";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { selectPanchayatVulnerabilityRanking } from "@/data/selectors/vulnerability";
import { selectBlockAlerts } from "@/data/selectors/alerts";
import { computeProportionalAllocation } from "@/lib/simulation/reliefAllocation";
import { computeSimulatedDeliveryStatus } from "@/lib/simulation/deliveryStatus";
import { formatNumber, formatPercent } from "@/lib/formatters";
import { RISK_COLORS } from "@/lib/riskLevels";

const HAZARD_CATEGORIES = [
  "Drought",
  "Flood",
  "Heatwave",
  "Cold Wave",
  "Pest/Disease",
  "Other",
];
const SEVERITY_TO_COLOR = {
  yellow: RISK_COLORS.yellow,
  orange: RISK_COLORS.orange,
  red: RISK_COLORS.red,
};

export default function GovernmentOperationsPage() {
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
        <h1 className="text-xl font-semibold">Operations Dashboard</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Relief allocation, warning dissemination and action tracking —
          simulation tools for this prototype, not connected to any real
          logistics, telecom or workflow system.
        </p>
      </div>

      <ReliefAllocationSection data={data} />
      <WarningDisseminationSection data={data} />
      <ActionTrackerSection data={data} />
    </main>
  );
}

function ReliefAllocationSection({ data }) {
  const [resourceLabel, setResourceLabel] = useState("Water (litres)");
  const [totalSupply, setTotalSupply] = useState(1000);

  const ranking = selectPanchayatVulnerabilityRanking(data);
  const demand = ranking.map((r) => ({
    panchayat: r.panchayat,
    needWeight: r.available ? r.value : 0,
  }));
  const allocation = useMemo(
    () => computeProportionalAllocation(demand, Number(totalSupply) || 0),
    [demand, totalSupply],
  );

  return (
    <Card
      title="Relief Allocation Optimizer"
      description="A simple browser-side demand-vs-supply split — not a real logistics optimizer (no transport/storage/eligibility data exists in this environment). Demand weight reuses the same climate/soil vulnerability ranking shown elsewhere in the app."
    >
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs uppercase tracking-wide text-foreground/40">
            Resource
          </span>
          <input
            type="text"
            value={resourceLabel}
            onChange={(event) => setResourceLabel(event.target.value)}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm "
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs uppercase tracking-wide text-foreground/40">
            Total supply available
          </span>
          <input
            type="number"
            min={0}
            value={totalSupply}
            onChange={(event) => setTotalSupply(event.target.value)}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm "
          />
        </label>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-foreground/40 ">
              <th className="py-2 pr-4">Panchayat</th>
              <th className="py-2 pr-4">Relative need</th>
              <th className="py-2 pr-4">Share</th>
              <th className="py-2">{resourceLabel || "Allocated"}</th>
            </tr>
          </thead>
          <tbody>
            {allocation.map((row) => (
              <tr key={row.panchayat} className="border-b border-border ">
                <td className="py-2 pr-4">{row.panchayat}</td>
                <td className="py-2 pr-4">
                  {row.needWeight != null
                    ? formatNumber(row.needWeight, { decimals: 2 })
                    : "—"}
                </td>
                <td className="py-2 pr-4">{formatPercent(row.sharePct)}</td>
                <td className="py-2">
                  {formatNumber(row.allocated, { decimals: 0 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function WarningDisseminationSection({ data }) {
  const alerts = selectBlockAlerts(data);

  return (
    <Card
      title="Warning Dissemination Status"
      description="Simulated SMS/IVR delivery status per active warning — no real telecom gateway exists in this environment; the same warning always shows the same simulated split rather than re-rolling randomly."
    >
      {alerts.length === 0 ? (
        <EmptyState title="No warnings currently active" />
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, index) => {
            const seed = `${alert.panchayat}|${alert.type}|${alert.message}`;
            const delivery = computeSimulatedDeliveryStatus(seed);
            return (
              <div key={index} className="rounded-lg border border-border p-4 ">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor:
                        SEVERITY_TO_COLOR[alert.severity] ?? RISK_COLORS.yellow,
                    }}
                    aria-hidden="true"
                  />
                  <p className="text-sm font-semibold">
                    {alert.panchayat} — {alert.type}
                  </p>
                </div>
                <p className="mt-1 text-xs text-foreground/60">
                  {alert.message}
                </p>
                <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-muted ">
                  <div
                    className="bg-green-500"
                    style={{ width: `${delivery.deliveredPct}%` }}
                  />
                  <div
                    className="bg-yellow-500"
                    style={{ width: `${delivery.pendingPct}%` }}
                  />
                  <div
                    className="bg-red-500"
                    style={{ width: `${delivery.failedPct}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-foreground/50">
                  Delivered {delivery.deliveredPct}% · Pending{" "}
                  {delivery.pendingPct}% · Failed {delivery.failedPct}%
                </p>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function ActionTrackerSection({ data }) {
  const actions = useActionTrackerStore((state) => state.actions);
  const addAction = useActionTrackerStore((state) => state.addAction);
  const moveAction = useActionTrackerStore((state) => state.moveAction);

  const [title, setTitle] = useState("");
  const [panchayat, setPanchayat] = useState(data.panchayats[0] ?? "");
  const [category, setCategory] = useState(HAZARD_CATEGORIES[0]);

  function handleAdd(event) {
    event.preventDefault();
    if (!title.trim()) return;
    addAction({ title: title.trim(), panchayat, category });
    setTitle("");
  }

  return (
    <Card
      title="Action Tracker"
      description="Kanban-style tracking of response actions. Persisted locally on this device only."
    >
      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
        <label className="flex flex-1 min-w-[200px] flex-col gap-1 text-sm">
          <span className="text-xs uppercase tracking-wide text-foreground/40">
            New action
          </span>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Dispatch water tanker"
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm "
          />
        </label>
        <Select
          label="Panchayat"
          value={panchayat}
          onChange={(event) => setPanchayat(event.target.value)}
          options={data.panchayats.map((p) => ({ value: p, label: p }))}
        />
        <Select
          label="Category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          options={HAZARD_CATEGORIES.map((c) => ({ value: c, label: c }))}
        />
        <Button type="submit" variant="primary">
          Add
        </Button>
      </form>

      {actions.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="No actions tracked yet" />
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-4">
          {STATUSES.map((status) => (
            <div key={status} className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
                {status} ({actions.filter((a) => a.status === status).length})
              </p>
              <div className="space-y-2">
                {actions
                  .filter((a) => a.status === status)
                  .map((action) => (
                    <div
                      key={action.id}
                      className="rounded-md border border-border p-3 text-sm "
                    >
                      <p className="font-medium">{action.title}</p>
                      <p className="mt-1 text-xs text-foreground/50">
                        {action.panchayat} · {action.category}
                      </p>
                      <select
                        value={action.status}
                        onChange={(event) =>
                          moveAction(action.id, event.target.value)
                        }
                        className="mt-2 w-full rounded-md border border-border bg-surface px-2 py-1 text-xs "
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
