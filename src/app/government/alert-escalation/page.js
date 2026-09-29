"use client";

import { useState } from "react";
import { useDataStore } from "@/store/dataStore";
import { useAuthStore } from "@/store/authStore";
import { useAuditStore } from "@/store/auditStore";
import { useAlertEscalationStore } from "@/store/alertEscalationStore";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { Alert } from "@/components/ui/Alert";
import { selectBlockAlerts } from "@/data/selectors/alerts";
import {
  formatAlertSmsPreview,
  formatAlertWhatsAppPreview,
  formatAlertIvrScript,
  formatAlertPushPreview,
} from "@/lib/alerts/alertEscalationPreviews";

function alertIdentity(alert) {
  return `${alert.panchayat}::${alert.type}`;
}

export default function AlertEscalationPage() {
  const status = useDataStore((state) => state.status);
  const error = useDataStore((state) => state.error);
  const data = useDataStore((state) => state.data);
  const role = useAuthStore((state) => state.role);
  const logEvent = useAuditStore((state) => state.logEvent);
  const shiftEscalation = useAlertEscalationStore(
    (state) => state.shiftEscalation,
  );
  const getEscalationLevel = useAlertEscalationStore(
    (state) => state.getEscalationLevel,
  );

  const [selectedKey, setSelectedKey] = useState(null);
  const [previewTab, setPreviewTab] = useState("sms");

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

  const alerts = selectBlockAlerts(data);
  const selectedAlert =
    alerts.find((a) => alertIdentity(a) === selectedKey) ?? null;

  function handleShift(alert, direction) {
    shiftEscalation(alert, alert.severity, direction);
    const newLevel = getEscalationLevel(alert, alert.severity);
    logEvent({
      type: "alert_escalated",
      role,
      details: {
        panchayat: alert.panchayat,
        alertType: alert.type,
        direction: direction > 0 ? "up" : "down",
        level: newLevel,
      },
    });
  }

  return (
    <main className="flex-1 space-y-6 px-6 py-8">
      <div>
        <h1 className="text-xl font-semibold">Alert Escalation</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Escalate/de-escalate active alerts across the shared
          Green/Yellow/Orange/Red scale and preview how each would be
          disseminated. Every delivery channel below is simulated — nothing is
          actually sent.
        </p>
      </div>

      <Alert tone="info">
        SIMULATED — escalation and delivery previews here do not dispatch
        anything real.
      </Alert>

      <Card title={`Active Alerts (${alerts.length})`}>
        {alerts.length === 0 ? (
          <EmptyState title="No active alerts" />
        ) : (
          <div className="space-y-2">
            {alerts.map((alert) => {
              const level = getEscalationLevel(alert, alert.severity);
              const key = alertIdentity(alert);
              return (
                <div
                  key={key}
                  className={`rounded-md border p-3 text-sm ${key === selectedKey ? "border-foreground" : "border-border "}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedKey(key)}
                      className="text-left"
                    >
                      <p className="font-medium">
                        {alert.panchayat} — {alert.type}
                      </p>
                      <p className="text-xs text-foreground/60">
                        {alert.message}
                      </p>
                    </button>
                    <div className="flex items-center gap-2">
                      <Badge riskLevel={level} />
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleShift(alert, -1)}
                      >
                        De-escalate
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleShift(alert, 1)}
                      >
                        Escalate
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {selectedAlert ? (
        <Card
          title={`Delivery Preview — ${selectedAlert.panchayat}: ${selectedAlert.type}`}
        >
          <Tabs
            tabs={[
              { key: "sms", label: "SMS" },
              { key: "ivr", label: "IVR" },
              { key: "whatsapp", label: "WhatsApp" },
              { key: "push", label: "Push" },
            ]}
            active={previewTab}
            onChange={setPreviewTab}
          />
          <div className="mt-4">
            <DeliveryPreviewBody
              tab={previewTab}
              alert={selectedAlert}
              level={getEscalationLevel(selectedAlert, selectedAlert.severity)}
            />
          </div>
        </Card>
      ) : null}
    </main>
  );
}

function DeliveryPreviewBody({ tab, alert, level }) {
  if (tab === "push") {
    const push = formatAlertPushPreview(alert, level);
    return (
      <div className="max-w-xs rounded-lg border border-border p-3 shadow-sm ">
        <p className="text-sm font-semibold">{push.title}</p>
        <p className="mt-1 text-xs text-foreground/70">{push.body}</p>
      </div>
    );
  }

  const text =
    tab === "ivr"
      ? formatAlertIvrScript(alert, level)
      : tab === "whatsapp"
        ? formatAlertWhatsAppPreview(alert, level)
        : formatAlertSmsPreview(alert, level);

  return (
    <pre className="whitespace-pre-wrap font-sans text-sm text-foreground/80">
      {text}
    </pre>
  );
}
