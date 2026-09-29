"use client";

import { useState } from "react";
import { useDataStore } from "@/store/dataStore";
import { useSelectionStore } from "@/store/selectionStore";
import { useAuthStore } from "@/store/authStore";
import { useAuditStore } from "@/store/auditStore";
import { useAdvisoryStore } from "@/store/advisoryStore";
import { useThresholdStore } from "@/store/thresholdStore";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { selectForecastPanchayat } from "@/data/selectors";
import { buildAdvisoryInput } from "@/lib/advisory/buildAdvisoryInput";
import { buildAuthorityAdvisoryInput } from "@/lib/advisory/buildAuthorityAdvisoryInput";
import { generateAdvisory } from "@/lib/advisory/generateAdvisory";
import { parseAdvisoryOutput } from "@/lib/advisory/advisorySchema";
import { diffAdvisoryContent } from "@/lib/advisory/diffVersions";
import {
  formatBulletin,
  formatIvrScript,
  formatSmsPreview,
  formatWhatsAppPreview,
} from "@/lib/advisory/deliveryPreviews";
import { getLatestVersionTimestamp } from "@/data/selectors/publishedAdvisories";
import { isMockMode } from "@/lib/advisory/config";
import { DEFAULT_CROP_THRESHOLDS } from "@/data/cropThresholds";
import { selectEffectiveCropThresholds } from "@/data/effectiveThresholds";
import { estimateCropStage } from "@/lib/calculations/cropStageEstimate";
import { formatHourLabel } from "@/lib/formatters";

const PRIORITY_OPTIONS = ["Low", "Medium", "High"];
const CONFIDENCE_OPTIONS = ["Low", "Medium", "High"];
const LANGUAGE_OPTIONS = ["en", "hi"];
const DELIVERY_CHANNELS = ["SMS", "WhatsApp", "IVR", "Bulletin"];

const AUDIENCES = [
  {
    key: "farmer",
    label: "Farmer Advisory",
    description:
      "Plain-language field actions, published to the Farmer portal for this panchayat.",
  },
  {
    key: "authority",
    label: "Authority Advisory (DM/DC)",
    description:
      "Operational/resource briefing over the same conditions, published to the Government portal.",
  },
];

function toDateInputValue(date) {
  return date.toISOString().slice(0, 10);
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

export default function AdvisoryStudioPage() {
  const status = useDataStore((state) => state.status);
  const error = useDataStore((state) => state.error);
  const data = useDataStore((state) => state.data);
  const selectedPanchayat = useSelectionStore(
    (state) => state.selectedPanchayat,
  );
  const setSelectedPanchayat = useSelectionStore(
    (state) => state.setSelectedPanchayat,
  );
  const currentRole = useAuthStore((state) => state.role);
  const logEvent = useAuditStore((state) => state.logEvent);
  const thresholdOverrides = useThresholdStore((state) => state.overrides);
  const effectiveThresholds = selectEffectiveCropThresholds(thresholdOverrides);

  const [selectedAudience, setSelectedAudience] = useState(null);
  const [crop, setCrop] = useState(DEFAULT_CROP_THRESHOLDS[0].crop);
  const [startDateStr, setStartDateStr] = useState(null);
  const [endDateStr, setEndDateStr] = useState(null);
  const [previewInput, setPreviewInput] = useState(null);

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

  if (!selectedPanchayat) {
    return (
      <main className="flex-1 px-6 py-8">
        <EmptyState
          title="Select a panchayat"
          description="Advisory input is built per panchayat — pick one below or in the header."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              {data.panchayats.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSelectedPanchayat(p)}
                  className="rounded-full border border-border px-4 py-1.5 text-sm transition hover:border-border-hover "
                >
                  {p}
                </button>
              ))}
            </div>
          }
        />
      </main>
    );
  }

  const forecast = selectForecastPanchayat(data, selectedPanchayat);
  if (forecast.length === 0) {
    return (
      <main className="flex-1 px-6 py-8">
        <EmptyState title="No forecast data available for this panchayat" />
      </main>
    );
  }

  const forecastMinDate = forecast[0].date;
  const forecastMaxDate = forecast[forecast.length - 1].date;
  const startDate = startDateStr
    ? new Date(`${startDateStr}T00:00:00Z`)
    : forecastMinDate;
  const endDate = endDateStr
    ? new Date(`${endDateStr}T23:59:59Z`)
    : forecastMaxDate;
  const cropStage = estimateCropStage(crop, startDate);

  function buildCurrentInput() {
    if (selectedAudience === "authority") {
      return buildAuthorityAdvisoryInput({
        data,
        panchayat: selectedPanchayat,
      });
    }
    return buildAdvisoryInput({
      data,
      panchayat: selectedPanchayat,
      crop,
      cropStage,
      dateRange: { start: startDate, end: endDate },
      cropThresholdsList: effectiveThresholds,
    });
  }

  function handlePreviewInput() {
    setPreviewInput(buildCurrentInput());
  }

  const activeAudience = AUDIENCES.find((a) => a.key === selectedAudience);

  return (
    <main className="flex-1 space-y-6 px-6 py-8">
      <div>
        <h1 className="text-xl font-semibold">Advisory Studio</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Build the structured input for {selectedPanchayat}, then generate,
          review and approve or reject an advisory. Farmer and Government
          (DM/DC) advisories are drafted and reviewed separately.
        </p>
        <p className="mt-2 inline-block rounded-full border border-border px-3 py-1 text-xs text-foreground/60 ">
          {isMockMode()
            ? "Mock mode (deterministic, no API key)"
            : "Live Gemini mode"}
        </p>
      </div>

      <section className="rounded-lg border border-border p-5 ">
        <h2 className="text-sm font-semibold">Send this advisory to</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {AUDIENCES.map((audience) => (
            <button
              key={audience.key}
              type="button"
              onClick={() => setSelectedAudience(audience.key)}
              aria-pressed={selectedAudience === audience.key}
              className={`flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition ${
                selectedAudience === audience.key
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-border-hover "
              }`}
            >
              <span className="text-sm font-semibold">{audience.label}</span>
              <span className="text-xs text-foreground/60">
                {audience.description}
              </span>
            </button>
          ))}
        </div>
      </section>

      {activeAudience?.key === "farmer" ? (
        <section className="rounded-lg border border-border p-5 ">
          <h2 className="text-sm font-semibold">Advisory Input</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              Crop
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="rounded-md border border-border bg-surface px-2 py-1.5 "
              >
                {DEFAULT_CROP_THRESHOLDS.map((c) => (
                  <option key={c.crop} value={c.crop}>
                    {c.crop}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm">
              From
              <input
                type="date"
                value={startDateStr ?? toDateInputValue(forecastMinDate)}
                min={toDateInputValue(forecastMinDate)}
                max={toDateInputValue(forecastMaxDate)}
                onChange={(e) => setStartDateStr(e.target.value)}
                className="rounded-md border border-border bg-surface px-2 py-1.5 "
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              To
              <input
                type="date"
                value={endDateStr ?? toDateInputValue(forecastMaxDate)}
                min={toDateInputValue(forecastMinDate)}
                max={toDateInputValue(forecastMaxDate)}
                onChange={(e) => setEndDateStr(e.target.value)}
                className="rounded-md border border-border bg-surface px-2 py-1.5 "
              />
            </label>
          </div>

          <div className="mt-5">
            <button
              type="button"
              onClick={handlePreviewInput}
              className="rounded-full border border-border px-5 py-2 text-sm font-medium transition hover:border-border-hover "
            >
              Preview advisory input (JSON)
            </button>
          </div>
        </section>
      ) : null}

      {activeAudience?.key === "authority" ? (
        <section className="rounded-lg border border-border p-5 ">
          <h2 className="text-sm font-semibold">Advisory Input</h2>
          <p className="mt-2 text-sm text-foreground/60">
            Drafted for {selectedPanchayat} as a whole — irrigation/drinking
            water, every tracked hazard, active alerts and the
            panchayat&apos;s vulnerability ranking. No crop, stage or
            timeline is needed.
          </p>
          <div className="mt-4">
            <button
              type="button"
              onClick={handlePreviewInput}
              className="rounded-full border border-border px-5 py-2 text-sm font-medium transition hover:border-border-hover "
            >
              Preview advisory input (JSON)
            </button>
          </div>
        </section>
      ) : null}

      {activeAudience ? (
        <AdvisoryAudiencePanel
          key={activeAudience.key}
          audience={activeAudience.key}
          audienceLabel={activeAudience.label}
          audienceDescription={activeAudience.description}
          selectedPanchayat={selectedPanchayat}
          crop={crop}
          cropStage={cropStage}
          startDate={startDate}
          endDate={endDate}
          buildCurrentInput={buildCurrentInput}
          currentRole={currentRole}
          logEvent={logEvent}
        />
      ) : null}

      <Modal
        open={previewInput !== null}
        onClose={() => setPreviewInput(null)}
        title="Structured advisory input"
      >
        <p className="mb-3 text-xs text-foreground/50">
          This is the exact payload sent to Gemini/mock — no
          farmer-identifying data, panchayat-level data only.
        </p>
        <pre className="max-h-[60vh] overflow-auto rounded-md bg-muted p-3 text-xs ">
          {JSON.stringify(previewInput, null, 2)}
        </pre>
      </Modal>
    </main>
  );
}

function AdvisoryAudiencePanel({
  audience,
  audienceLabel,
  audienceDescription,
  selectedPanchayat,
  crop,
  cropStage,
  startDate,
  endDate,
  buildCurrentInput,
  currentRole,
  logEvent,
}) {
  const advisories = useAdvisoryStore((state) => state.advisories);
  const createDraft = useAdvisoryStore((state) => state.createDraft);
  const saveEditToStore = useAdvisoryStore((state) => state.saveEdit);
  const transitionStatus = useAdvisoryStore((state) => state.transitionStatus);

  const [generating, setGenerating] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [generationResult, setGenerationResult] = useState(null);
  const [parseResult, setParseResult] = useState(null);
  const [editedAdvisory, setEditedAdvisory] = useState(null);
  const [originalAdvisory, setOriginalAdvisory] = useState(null);
  const [showAdvisoryPreview, setShowAdvisoryPreview] = useState(false);
  const [currentAdvisoryId, setCurrentAdvisoryId] = useState(null);
  const [diffTarget, setDiffTarget] = useState(null);

  const currentAdvisory =
    advisories.find((a) => a.id === currentAdvisoryId) ?? null;

  async function handleGenerate() {
    const input = buildCurrentInput();
    setGenerating(true);
    setStreamedText("");
    setGenerationResult(null);
    setParseResult(null);
    setEditedAdvisory(null);
    setOriginalAdvisory(null);
    setCurrentAdvisoryId(null);

    const result = await generateAdvisory(input, audience, {
      onStreamChunk: (chunk) => setStreamedText((prev) => prev + chunk),
    });
    setGenerationResult(result);

    if (result.ok) {
      const parsed = parseAdvisoryOutput(result.rawText);
      setParseResult(parsed);
      if (parsed.success) {
        const full = { ...parsed.data, thresholds: input.thresholds };
        setEditedAdvisory(full);
        setOriginalAdvisory(full);
      }
    }

    setGenerating(false);
  }

  function handleReset() {
    if (originalAdvisory) setEditedAdvisory(deepClone(originalAdvisory));
  }

  function handleSaveDraft() {
    const id = createDraft({
      panchayat: selectedPanchayat,
      crop: audience === "authority" ? null : crop,
      cropStage: audience === "authority" ? null : cropStage,
      dateRange:
        audience === "authority"
          ? null
          : { start: startDate.toISOString(), end: endDate.toISOString() },
      audience,
      content: editedAdvisory,
      authorRole: currentRole,
    });
    setCurrentAdvisoryId(id);
    logEvent({
      type: "advisory_edited",
      role: currentRole,
      details: { advisoryId: id, audience, action: "created_draft" },
    });
  }

  function handleSaveEdit() {
    saveEditToStore(currentAdvisoryId, {
      content: editedAdvisory,
      changeSummary: "Manual edit",
      authorRole: currentRole,
    });
    logEvent({
      type: "advisory_edited",
      role: currentRole,
      details: { advisoryId: currentAdvisoryId, audience },
    });
  }

  function handleMoveToReview() {
    transitionStatus(currentAdvisoryId, {
      newStatus: "Review",
      changeSummary: "Moved to review",
      authorRole: currentRole,
    });
    logEvent({
      type: "advisory_reviewed",
      role: currentRole,
      details: { advisoryId: currentAdvisoryId, audience },
    });
  }

  function handleApprove() {
    transitionStatus(currentAdvisoryId, {
      newStatus: "Approved",
      changeSummary: "Approved",
      authorRole: currentRole,
    });
    logEvent({
      type: "advisory_approved",
      role: currentRole,
      details: { advisoryId: currentAdvisoryId, audience },
    });
  }

  function handleReject() {
    transitionStatus(currentAdvisoryId, {
      newStatus: "Rejected",
      changeSummary: "Rejected",
      authorRole: currentRole,
    });
    logEvent({
      type: "advisory_rejected",
      role: currentRole,
      details: { advisoryId: currentAdvisoryId, audience },
    });
  }

  function handlePublish() {
    transitionStatus(currentAdvisoryId, {
      newStatus: "Published",
      changeSummary: "Published",
      authorRole: currentRole,
    });
    logEvent({
      type: "advisory_published",
      role: currentRole,
      details: { advisoryId: currentAdvisoryId, audience },
    });
  }

  function updateField(field, value) {
    setEditedAdvisory((prev) => ({ ...prev, [field]: value }));
  }

  function updateThreshold(field, value) {
    setEditedAdvisory((prev) => ({
      ...prev,
      thresholds: {
        ...prev.thresholds,
        [field]: value === "" ? null : Number(value),
      },
    }));
  }

  function updateAction(index, field, value) {
    setEditedAdvisory((prev) => ({
      ...prev,
      actions: prev.actions.map((action, i) =>
        i === index ? { ...action, [field]: value } : action,
      ),
    }));
  }

  function removeAction(index) {
    setEditedAdvisory((prev) => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index),
    }));
  }

  function addAction() {
    setEditedAdvisory((prev) => ({
      ...prev,
      actions: [
        ...prev.actions,
        { title: "", description: "", priority: "Medium" },
      ],
    }));
  }

  function updateReason(index, value) {
    setEditedAdvisory((prev) => ({
      ...prev,
      reasons: prev.reasons.map((r, i) => (i === index ? value : r)),
    }));
  }

  function removeReason(index) {
    setEditedAdvisory((prev) => ({
      ...prev,
      reasons: prev.reasons.filter((_, i) => i !== index),
    }));
  }

  function addReason() {
    setEditedAdvisory((prev) => ({ ...prev, reasons: [...prev.reasons, ""] }));
  }

  return (
    <section className="space-y-4 rounded-xl border border-border p-5">
      <div>
        <h2 className="text-base font-semibold">{audienceLabel}</h2>
        <p className="mt-1 text-xs text-foreground/50">
          {audienceDescription}
        </p>
      </div>

      <div className="rounded-lg border border-border p-5 ">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">
            {generationResult
              ? `Generated draft — ${generationResult.source}`
              : "Generate draft"}
          </h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              {generating
                ? "Generating…"
                : generationResult
                  ? "Regenerate"
                  : "Generate advisory draft"}
            </button>
            {!generating && editedAdvisory ? (
              <>
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-full border border-border px-3 py-1 text-xs font-medium "
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdvisoryPreview(true)}
                  className="rounded-full border border-border px-3 py-1 text-xs font-medium "
                >
                  Preview
                </button>
              </>
            ) : null}
          </div>
        </div>

        {generating ? (
          <p className="mt-3 text-sm text-foreground/60">
            {streamedText || "Waiting for response…"}
          </p>
        ) : !generationResult ? null : !generationResult.ok ? (
          <p className="mt-3 text-sm text-red-600" role="alert">
            Generation failed: {generationResult.error}
          </p>
        ) : !parseResult?.success ? (
          <div
            className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
            role="alert"
          >
            <p className="font-medium">
              Validation failed — this draft cannot proceed to review.
            </p>
            <p className="mt-1 text-xs">{parseResult?.error}</p>
          </div>
        ) : (
          <>
            <AdvisoryEditForm
              advisory={editedAdvisory}
              onUpdateField={updateField}
              onUpdateThreshold={updateThreshold}
              onUpdateAction={updateAction}
              onRemoveAction={removeAction}
              onAddAction={addAction}
              onUpdateReason={updateReason}
              onRemoveReason={removeReason}
              onAddReason={addReason}
            />
            <button
              type="button"
              onClick={currentAdvisory ? handleSaveEdit : handleSaveDraft}
              className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              {currentAdvisory ? "Save edit as new version" : "Save as draft"}
            </button>
          </>
        )}
      </div>

      {currentAdvisory ? (
        <WorkflowSection
          advisory={currentAdvisory}
          audienceLabel={audienceLabel}
          onMoveToReview={handleMoveToReview}
          onApprove={handleApprove}
          onReject={handleReject}
          onPublish={handlePublish}
          onViewDiff={setDiffTarget}
        />
      ) : null}

      {currentAdvisory?.status === "Published" ? (
        <DeliveryPreviewSection advisory={currentAdvisory} />
      ) : null}

      <Modal
        open={showAdvisoryPreview}
        onClose={() => setShowAdvisoryPreview(false)}
        title={`${audienceLabel} preview`}
      >
        {editedAdvisory ? <AdvisoryPreview advisory={editedAdvisory} /> : null}
      </Modal>

      <Modal
        open={diffTarget !== null}
        onClose={() => setDiffTarget(null)}
        title={
          diffTarget
            ? `Diff: v${diffTarget.previous.versionNumber} → v${diffTarget.current.versionNumber}`
            : ""
        }
      >
        {diffTarget ? (
          <DiffView
            previous={diffTarget.previous}
            current={diffTarget.current}
          />
        ) : null}
      </Modal>
    </section>
  );
}

function FieldLabel({ children }) {
  return <label className="flex flex-col gap-1 text-sm">{children}</label>;
}

function AdvisoryEditForm({
  advisory,
  onUpdateField,
  onUpdateThreshold,
  onUpdateAction,
  onRemoveAction,
  onAddAction,
  onUpdateReason,
  onRemoveReason,
  onAddReason,
}) {
  const inputClass =
    "rounded-md border border-border bg-surface px-2 py-1.5 ";

  return (
    <div className="mt-4 space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldLabel>
          Language
          <select
            value={advisory.language}
            onChange={(e) => onUpdateField("language", e.target.value)}
            className={inputClass}
          >
            {LANGUAGE_OPTIONS.map((lang) => (
              <option key={lang} value={lang}>
                {lang.toUpperCase()}
              </option>
            ))}
          </select>
        </FieldLabel>
        <FieldLabel>
          Confidence
          <select
            value={advisory.confidence}
            onChange={(e) => onUpdateField("confidence", e.target.value)}
            className={inputClass}
          >
            {CONFIDENCE_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </FieldLabel>
      </div>

      <FieldLabel>
        Summary
        <textarea
          value={advisory.summary}
          onChange={(e) => onUpdateField("summary", e.target.value)}
          rows={2}
          className={inputClass}
        />
      </FieldLabel>

      {advisory.thresholds ? (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/50">
            Thresholds used
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <FieldLabel>
              Heat stress (°C)
              <input
                type="number"
                value={advisory.thresholds.heatStressC ?? ""}
                onChange={(e) =>
                  onUpdateThreshold("heatStressC", e.target.value)
                }
                className={inputClass}
              />
            </FieldLabel>
            <FieldLabel>
              Cold stress (°C)
              <input
                type="number"
                value={advisory.thresholds.coldStressC ?? ""}
                onChange={(e) =>
                  onUpdateThreshold("coldStressC", e.target.value)
                }
                className={inputClass}
              />
            </FieldLabel>
            <FieldLabel>
              GDD base (°C)
              <input
                type="number"
                value={advisory.thresholds.baseTempC ?? ""}
                onChange={(e) => onUpdateThreshold("baseTempC", e.target.value)}
                className={inputClass}
              />
            </FieldLabel>
          </div>
        </div>
      ) : null}

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
            Actions
          </p>
          <button
            type="button"
            onClick={onAddAction}
            className="text-xs font-medium underline underline-offset-4"
          >
            + Add action
          </button>
        </div>
        <div className="space-y-3">
          {advisory.actions.map((action, index) => (
            <div key={index} className="rounded-md border border-border p-3 ">
              <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <input
                  value={action.title}
                  onChange={(e) =>
                    onUpdateAction(index, "title", e.target.value)
                  }
                  placeholder="Title"
                  className={inputClass}
                />
                <select
                  value={action.priority}
                  onChange={(e) =>
                    onUpdateAction(index, "priority", e.target.value)
                  }
                  className={inputClass}
                >
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => onRemoveAction(index)}
                  className="rounded-md border border-border px-2 text-xs "
                >
                  Remove
                </button>
              </div>
              <textarea
                value={action.description}
                onChange={(e) =>
                  onUpdateAction(index, "description", e.target.value)
                }
                rows={2}
                placeholder="Description"
                className={`mt-2 w-full ${inputClass}`}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
            Reasons
          </p>
          <button
            type="button"
            onClick={onAddReason}
            className="text-xs font-medium underline underline-offset-4"
          >
            + Add reason
          </button>
        </div>
        <div className="space-y-2">
          {advisory.reasons.map((reason, index) => (
            <div key={index} className="flex gap-2">
              <input
                value={reason}
                onChange={(e) => onUpdateReason(index, e.target.value)}
                className={`flex-1 ${inputClass}`}
              />
              <button
                type="button"
                onClick={() => onRemoveReason(index)}
                className="rounded-md border border-border px-2 text-xs "
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdvisoryPreview({ advisory }) {
  return (
    <div className="space-y-4 text-sm">
      <p>
        <span className="font-medium">Language:</span>{" "}
        {advisory.language.toUpperCase()}
      </p>
      <p>{advisory.summary}</p>
      <div>
        <p className="mb-1 font-medium">Actions</p>
        <ul className="list-disc space-y-1 pl-5">
          {advisory.actions.map((action, index) => (
            <li key={index}>
              <span className="font-medium">{action.title}</span> (
              {action.priority}) — {action.description}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="mb-1 font-medium">Reasons</p>
        <ul className="list-disc space-y-1 pl-5">
          {advisory.reasons.map((reason, index) => (
            <li key={index}>{reason}</li>
          ))}
        </ul>
      </div>
      <p>
        <span className="font-medium">Confidence:</span> {advisory.confidence}
      </p>
      {advisory.thresholds ? (
        <p className="text-xs text-foreground/50">
          Thresholds: heat {advisory.thresholds.heatStressC}°C, cold{" "}
          {advisory.thresholds.coldStressC}°C, GDD base{" "}
          {advisory.thresholds.baseTempC}°C
        </p>
      ) : null}
    </div>
  );
}

function WorkflowSection({
  advisory,
  audienceLabel,
  onMoveToReview,
  onApprove,
  onReject,
  onPublish,
  onViewDiff,
}) {
  const actions =
    advisory.status === "Draft"
      ? [{ label: "Move to review", onClick: onMoveToReview, variant: "primary" }]
      : advisory.status === "Review"
        ? [
            { label: "Approve", onClick: onApprove, variant: "primary" },
            { label: "Reject", onClick: onReject, variant: "danger" },
          ]
        : advisory.status === "Approved"
          ? [{ label: "Publish", onClick: onPublish, variant: "primary" }]
          : advisory.status === "Rejected"
            ? [
                {
                  label: "Move back to review",
                  onClick: onMoveToReview,
                  variant: "primary",
                },
              ]
            : [];

  return (
    <section className="rounded-lg border border-border p-5 ">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold">
            {audienceLabel} Workflow
          </h3>
          <p className="mt-1 text-xs text-foreground/50">
            {advisory.panchayat}
            {advisory.crop ? ` · ${advisory.crop} (${advisory.cropStage})` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-border px-3 py-1 text-xs font-medium ">
            {advisory.status}
          </span>
          {actions.length > 0 ? (
            <div className="flex gap-2">
              {actions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={action.onClick}
                  className={
                    action.variant === "danger"
                      ? "rounded-full border border-red-300 px-4 py-1.5 text-xs font-medium text-red-700 transition hover:border-red-500 dark:border-red-900/60 dark:text-red-400"
                      : "rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground transition hover:opacity-90"
                  }
                >
                  {action.label}
                </button>
              ))}
            </div>
          ) : (
            <span className="text-xs text-foreground/50">
              Published — visible to{" "}
              {advisory.audience === "authority"
                ? "Government (DM/DC)"
                : "Farmer"}
              .
            </span>
          )}
        </div>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/50">
          Version history
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-foreground/40 ">
                <th className="py-2 pr-4">Version</th>
                <th className="py-2 pr-4">Timestamp</th>
                <th className="py-2 pr-4">Author</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Change</th>
                <th className="py-2">Diff</th>
              </tr>
            </thead>
            <tbody>
              {advisory.versions.map((version, index) => (
                <tr
                  key={version.versionNumber}
                  className="border-b border-border "
                >
                  <td className="py-2 pr-4">v{version.versionNumber}</td>
                  <td className="py-2 pr-4">
                    {formatHourLabel(new Date(version.timestamp))}
                  </td>
                  <td className="py-2 pr-4">{version.authorRole ?? "—"}</td>
                  <td className="py-2 pr-4">{version.status}</td>
                  <td className="py-2 pr-4">{version.changeSummary}</td>
                  <td className="py-2">
                    {index === 0 ? (
                      "—"
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          onViewDiff({
                            previous: advisory.versions[index - 1],
                            current: version,
                          })
                        }
                        className="text-xs font-medium underline underline-offset-4"
                      >
                        View
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function DiffView({ previous, current }) {
  const changes = diffAdvisoryContent(previous.content, current.content);

  if (changes.length === 0) {
    return (
      <p className="text-sm text-foreground/60">
        No content changes — this version only changed status ({previous.status}{" "}
        → {current.status}).
      </p>
    );
  }

  return (
    <div className="space-y-3 text-sm">
      {changes.map((change) => (
        <div
          key={change.field}
          className="rounded-md border border-border p-3 "
        >
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-foreground/50">
            {change.field}
          </p>
          <p className="text-red-600 line-through">
            {typeof change.before === "object"
              ? JSON.stringify(change.before)
              : String(change.before ?? "—")}
          </p>
          <p className="text-green-700 dark:text-green-500">
            {typeof change.after === "object"
              ? JSON.stringify(change.after)
              : String(change.after ?? "—")}
          </p>
        </div>
      ))}
    </div>
  );
}

const CHANNEL_FORMATTERS = {
  SMS: formatSmsPreview,
  WhatsApp: formatWhatsAppPreview,
  IVR: formatIvrScript,
  Bulletin: formatBulletin,
};

function DeliveryPreviewSection({ advisory }) {
  const [channel, setChannel] = useState(DELIVERY_CHANNELS[0]);
  const content = advisory.versions[advisory.versions.length - 1].content;
  const meta = {
    panchayat: advisory.panchayat,
    crop: advisory.crop ?? undefined,
    cropStage: advisory.cropStage ?? undefined,
    audience: advisory.audience,
    publishedAt: formatHourLabel(new Date(getLatestVersionTimestamp(advisory))),
  };
  const text = CHANNEL_FORMATTERS[channel](content, meta);

  return (
    <section className="rounded-lg border border-border p-5 ">
      <h3 className="text-sm font-semibold">Delivery Previews</h3>
      <p className="mt-1 text-xs text-foreground/50">
        Simulations only — no message is actually sent over any channel;
        there is no real SMS/IVR/WhatsApp integration in this prototype.
      </p>

      <div className="mt-4 flex gap-1 border-b border-border ">
        {DELIVERY_CHANNELS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setChannel(c)}
            className={`px-4 py-2 text-sm font-medium transition ${
              channel === c
                ? "border-b-2 border-primary text-primary"
                : "text-foreground/50 hover:text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-md border border-dashed border-border p-4 ">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-foreground/40">
          Preview — not sent
        </p>
        <pre className="whitespace-pre-wrap font-sans text-sm">{text}</pre>
        {channel === "SMS" ? (
          <p className="mt-2 text-xs text-foreground/40">
            {text.length}/160 characters
          </p>
        ) : null}
      </div>
    </section>
  );
}
