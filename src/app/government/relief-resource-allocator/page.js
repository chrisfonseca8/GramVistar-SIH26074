"use client";

import { useState } from "react";
import { useDataStore } from "@/store/dataStore";
import { useAdvisoryStore } from "@/store/advisoryStore";
import { useReliefAllocationStore } from "@/store/reliefAllocationStore";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import {
  selectAllPublishedAdvisories,
  getLatestVersionContent,
  getLatestVersionTimestamp,
} from "@/data/selectors/publishedAdvisories";
import { buildReliefAllocationInput } from "@/lib/advisory/buildReliefAllocationInput";
import { generateReliefAllocation } from "@/lib/advisory/generateReliefAllocation";
import { parseReliefAllocationOutput } from "@/lib/advisory/reliefAllocationSchema";
import { isMockMode } from "@/lib/advisory/config";
import { formatHourLabel } from "@/lib/formatters";
import { RISK_COLORS } from "@/lib/riskLevels";

const PRIORITY_TO_RISK_COLOR = {
  Low: RISK_COLORS.green,
  Medium: RISK_COLORS.yellow,
  High: RISK_COLORS.red,
};

export default function ReliefResourceAllocatorPage() {
  const status = useDataStore((state) => state.status);
  const error = useDataStore((state) => state.error);
  const data = useDataStore((state) => state.data);
  const advisories = useAdvisoryStore((state) => state.advisories);
  const entries = useReliefAllocationStore((state) => state.entries);
  const addEntry = useReliefAllocationStore((state) => state.addEntry);

  const [selectedAdvisoryId, setSelectedAdvisoryId] = useState("");
  const [generating, setGenerating] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [generationResult, setGenerationResult] = useState(null);
  const [parseResult, setParseResult] = useState(null);

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

  const publishedAdvisories = selectAllPublishedAdvisories(advisories);
  const selectedAdvisory =
    publishedAdvisories.find((a) => a.id === selectedAdvisoryId) ?? null;
  const selectedContent = selectedAdvisory
    ? getLatestVersionContent(selectedAdvisory)
    : null;

  async function handleGenerate() {
    if (!selectedAdvisory) return;
    const input = buildReliefAllocationInput({
      data,
      advisory: selectedAdvisory,
    });
    setGenerating(true);
    setStreamedText("");
    setGenerationResult(null);
    setParseResult(null);

    const result = await generateReliefAllocation(input, {
      onStreamChunk: (chunk) => setStreamedText((prev) => prev + chunk),
    });
    setGenerationResult(result);

    if (result.ok) {
      const parsed = parseReliefAllocationOutput(result.rawText);
      setParseResult(parsed);
      if (parsed.success) {
        addEntry({
          advisoryId: selectedAdvisory.id,
          panchayat: selectedAdvisory.panchayat,
          source: result.source,
          promptVersion: result.promptVersion,
          content: parsed.data,
        });
      }
    }

    setGenerating(false);
  }

  return (
    <main className="flex-1 space-y-6 px-6 py-8">
      <div>
        <h1 className="text-xl font-semibold">
          Relief &amp; Resource Allocator
        </h1>
        <p className="mt-1 text-sm text-foreground/60">
          Pick a published, DM/DC-approved advisory and generate a relief/
          resource allocation for that panchayat — built from the
          advisory&apos;s own content plus the panchayat&apos;s current hazard
          data. Every generation is kept below, not just the latest one.
        </p>
        <p className="mt-2 inline-block rounded-full border border-border px-3 py-1 text-xs text-foreground/60 ">
          {isMockMode()
            ? "Mock mode (deterministic, no API key)"
            : "Live Gemini mode"}
        </p>
      </div>

      <Card title="Select a published advisory">
        {publishedAdvisories.length === 0 ? (
          <EmptyState
            title="No published Government advisories yet"
            description="Once a Scientist publishes an authority advisory in Advisory Studio, it will appear here to generate a relief/resource allocation for."
          />
        ) : (
          <div className="space-y-4">
            <Select
              label="Published advisory"
              value={selectedAdvisoryId}
              onChange={(event) => {
                setSelectedAdvisoryId(event.target.value);
                setGenerationResult(null);
                setParseResult(null);
                setStreamedText("");
              }}
              options={[
                { value: "", label: "Select an advisory" },
                ...publishedAdvisories.map((advisory) => ({
                  value: advisory.id,
                  label: `${advisory.panchayat} — published ${formatHourLabel(new Date(getLatestVersionTimestamp(advisory)))}`,
                })),
              ]}
            />

            {selectedAdvisory && selectedContent ? (
              <div className="rounded-md border border-dashed border-border p-4">
                <p className="text-sm font-medium">{selectedContent.summary}</p>
                <p className="mt-1 text-xs text-foreground/50">
                  Confidence: {selectedContent.confidence} ·{" "}
                  {selectedContent.actions.length} approved action(s)
                </p>
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleGenerate}
              disabled={!selectedAdvisory || generating}
              className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              {generating
                ? "Generating…"
                : "Generate relief & resource allocation"}
            </button>
          </div>
        )}
      </Card>

      {generating || generationResult ? (
        <Card title="Generated allocation">
          {generating ? (
            <p className="text-sm text-foreground/60">
              {streamedText || "Waiting for response…"}
            </p>
          ) : !generationResult.ok ? (
            <p className="text-sm text-red-600" role="alert">
              Generation failed: {generationResult.error}
            </p>
          ) : !parseResult?.success ? (
            <div
              className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              role="alert"
            >
              <p className="font-medium">Validation failed.</p>
              <p className="mt-1 text-xs">{parseResult?.error}</p>
            </div>
          ) : (
            <p className="text-sm text-foreground/60">
              Saved to the allocation history below — source:{" "}
              {generationResult.source}.
            </p>
          )}
        </Card>
      ) : null}

      <div>
        <h2 className="text-sm font-semibold">Allocation History</h2>
        {entries.length === 0 ? (
          <div className="mt-3">
            <EmptyState title="No allocations generated yet" />
          </div>
        ) : (
          <div className="mt-3 space-y-4">
            {entries.map((entry) => (
              <AllocationEntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function AllocationEntryCard({ entry }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold">{entry.panchayat}</p>
        <div className="flex items-center gap-2 text-xs text-foreground/50">
          <span className="rounded-full border border-border px-2 py-0.5 ">
            {entry.source}
          </span>
          <span>{formatHourLabel(new Date(entry.generatedAt))}</span>
        </div>
      </div>
      <p className="mt-2 text-sm text-foreground/70">{entry.content.summary}</p>
      <div className="mt-3 space-y-2">
        {entry.content.resources.map((resource, index) => (
          <div key={index} className="rounded-md border border-border p-3 ">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{
                  backgroundColor:
                    PRIORITY_TO_RISK_COLOR[resource.priority] ??
                    RISK_COLORS.green,
                }}
                aria-hidden="true"
              />
              <p className="text-sm font-medium">{resource.title}</p>
            </div>
            <p className="mt-1 text-xs text-foreground/60">
              {resource.description}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-foreground/40">
        Confidence: {entry.content.confidence}
      </p>
    </div>
  );
}
