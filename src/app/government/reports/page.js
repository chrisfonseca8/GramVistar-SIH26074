"use client";

import { useState } from "react";
import { useDataStore } from "@/store/dataStore";
import { useAuthStore } from "@/store/authStore";
import { useAuditStore } from "@/store/auditStore";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { buildReportInput } from "@/data/selectors/reportInput";
import { generateReport } from "@/lib/reports/generateReport";
import { parseReportOutput } from "@/lib/reports/reportSchema";
import { REPORT_TYPES } from "@/lib/prompts/reportPrompt";
import { formatHourLabel } from "@/lib/formatters";

export default function GovernmentReportsPage() {
  const status = useDataStore((state) => state.status);
  const error = useDataStore((state) => state.error);
  const data = useDataStore((state) => state.data);
  const role = useAuthStore((state) => state.role);
  const logEvent = useAuditStore((state) => state.logEvent);

  const [reportTypeKey, setReportTypeKey] = useState(REPORT_TYPES[0].key);
  const [scopePanchayat, setScopePanchayat] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [genError, setGenError] = useState(null);

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

  async function handleGenerate() {
    setGenerating(true);
    setGenError(null);
    setResult(null);

    const reportInput = buildReportInput({
      data,
      reportType: reportTypeKey,
      panchayat: scopePanchayat || null,
    });
    const generation = await generateReport(reportInput);

    if (!generation.ok) {
      setGenError(generation.error);
      setGenerating(false);
      return;
    }

    const parsed = parseReportOutput(generation.rawText);
    if (!parsed.success) {
      setGenError(`Generated content failed validation: ${parsed.error}`);
      setGenerating(false);
      return;
    }

    setResult({
      report: parsed.data,
      source: generation.source,
      promptVersion: generation.promptVersion,
    });
    logEvent({
      type: "report_generated",
      role,
      details: {
        report: "government-llm-report",
        reportType: reportTypeKey,
        scope: reportInput.scope,
        source: generation.source,
      },
    });
    setGenerating(false);
  }

  return (
    <main className="flex-1 space-y-6 px-6 py-8">
      <div>
        <h1 className="text-xl font-semibold">Reports</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Gemini/mock-generated Government reports, reusing the exact same
          Gemini abstraction and mock mode as the Scientist Advisory Studio —
          no separate API logic. Never trust generated content as-is: review
          it the same way you would an advisory draft.
        </p>
      </div>

      <Card title="Generate">
        <div className="flex flex-wrap items-end gap-4">
          <Select
            label="Report type"
            value={reportTypeKey}
            onChange={(event) => setReportTypeKey(event.target.value)}
            options={REPORT_TYPES.map((t) => ({
              value: t.key,
              label: t.label,
            }))}
          />
          <Select
            label="Scope"
            value={scopePanchayat}
            onChange={(event) => setScopePanchayat(event.target.value)}
            options={[
              { value: "", label: "Chas Block (all panchayats)" },
              ...data.panchayats.map((p) => ({ value: p, label: p })),
            ]}
          />
          <Button
            variant="primary"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? "Generating…" : result ? "Regenerate" : "Generate"}
          </Button>
        </div>
      </Card>

      {genError ? <Alert tone="danger">{genError}</Alert> : null}

      {result ? (
        <Card
          title={result.report.title}
          description={`Source: ${result.source === "mock" ? "deterministic mock" : "Gemini"} · Prompt ${result.promptVersion} · Generated ${formatHourLabel(new Date(result.report.generatedAt))}`}
        >
          <div className="space-y-4">
            {result.report.sections.map((section, index) => (
              <div key={index}>
                <p className="text-sm font-semibold">{section.heading}</p>
                <p className="mt-1 text-sm text-foreground/70">
                  {section.body}
                </p>
              </div>
            ))}
          </div>
        </Card>
      ) : !genError ? (
        <EmptyState
          title="No report generated yet"
          description="Pick a type and scope, then click Generate."
        />
      ) : null}
    </main>
  );
}
