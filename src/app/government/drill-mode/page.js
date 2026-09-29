"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useAuditStore } from "@/store/auditStore";
import { useDrillModeStore } from "@/store/drillModeStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatHourLabel } from "@/lib/formatters";

function formatElapsed(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

/**
 * Government drill mode — a timed practice session for
 * rehearsing disaster response, entirely local/simulated. Never touches
 * real alert/advisory/publication state.
 */
export default function DrillModePage() {
  const role = useAuthStore((state) => state.role);
  const logEvent = useAuditStore((state) => state.logEvent);
  const active = useDrillModeStore((state) => state.active);
  const startedAt = useDrillModeStore((state) => state.startedAt);
  const history = useDrillModeStore((state) => state.history);
  const startDrill = useDrillModeStore((state) => state.startDrill);
  const endDrill = useDrillModeStore((state) => state.endDrill);

  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (!active || !startedAt) return undefined;
    const tick = () => setElapsedMs(Date.now() - new Date(startedAt).getTime());
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [active, startedAt]);

  function handleStart() {
    startDrill();
    logEvent({ type: "drill_started", role, details: {} });
  }

  function handleEnd() {
    logEvent({ type: "drill_ended", role, details: { durationMs: elapsedMs } });
    endDrill();
  }

  return (
    <main className="flex-1 space-y-6 px-6 py-8">
      <div>
        <h1 className="text-xl font-semibold">Drill Mode</h1>
        <p className="mt-1 text-sm text-foreground/60">
          A timed practice session for rehearsing disaster response. Starting or
          ending a drill never changes any real alert, advisory, or published
          data — it only records that a drill ran and for how long.
        </p>
      </div>

      {active ? (
        <Alert tone="warning">
          DRILL MODE ACTIVE — this is a rehearsal, not a real event.
        </Alert>
      ) : null}

      <Card title="Session">
        {active ? (
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-2xl font-bold tabular-nums">
              {formatElapsed(elapsedMs)}
            </p>
            <Button variant="danger" onClick={handleEnd}>
              End drill
            </Button>
            <Link
              href="/government/operations"
              className="text-xs font-medium underline underline-offset-4"
            >
              Log response actions in the Action Tracker →
            </Link>
          </div>
        ) : (
          <Button variant="primary" onClick={handleStart}>
            Start drill
          </Button>
        )}
      </Card>

      <Card title={`Past drills (${history.length})`}>
        {history.length === 0 ? (
          <EmptyState title="No drills run yet" />
        ) : (
          <ul className="space-y-2 text-sm">
            {history.map((session, index) => (
              <li
                key={index}
                className="rounded-md border border-border px-3 py-2 "
              >
                {formatHourLabel(new Date(session.startedAt))} —{" "}
                {formatHourLabel(new Date(session.endedAt))} (
                {formatElapsed(
                  new Date(session.endedAt).getTime() -
                    new Date(session.startedAt).getTime(),
                )}
                )
              </li>
            ))}
          </ul>
        )}
      </Card>
    </main>
  );
}
