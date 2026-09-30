"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import { useAuditStore } from "@/store/auditStore";
import { useSelectionStore } from "@/store/selectionStore";
import { useFarmerStore } from "@/store/farmerStore";
import { useFeedbackStore } from "@/store/feedbackStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { VoiceNoteRecorder } from "@/components/farmer/VoiceNoteRecorder";
import { CROP_STAGE_OPTIONS } from "@/data/cropStages";
import { FEEDBACK_CATEGORIES } from "@/data/feedbackCategories";
import {
  formatFeedbackSmsPreview,
  formatFeedbackIvrScript,
} from "@/lib/feedback/feedbackPreviews";
import { formatHourLabel } from "@/lib/formatters";

function defaultFieldsForCategory(category) {
  switch (category) {
    case "cropStage":
      return { currentStage: CROP_STAGE_OPTIONS[0] };
    case "irrigation":
      return { irrigated: "yes", method: "" };
    case "pest":
      return { observed: "yes", pestType: "", severity: "low" };
    case "damage":
      return { type: "flood", areaAffectedPct: "" };
    case "yield":
      return { expectedYieldQuintalsPerAcre: "" };
    default:
      return {};
  }
}

export default function FarmerFeedbackPage() {
  const { t } = useTranslation();
  const role = useAuthStore((state) => state.role);
  const logEvent = useAuditStore((state) => state.logEvent);
  const selectedPanchayat = useSelectionStore(
    (state) => state.selectedPanchayat,
  );
  const selectedCrop = useFarmerStore((state) => state.selectedCrop);
  const selectedCropStage = useFarmerStore((state) => state.selectedCropStage);
  const entries = useFeedbackStore((state) => state.entries);
  const addFeedback = useFeedbackStore((state) => state.addFeedback);

  const [category, setCategory] = useState(FEEDBACK_CATEGORIES[0]);
  const [fields, setFields] = useState(
    defaultFieldsForCategory(FEEDBACK_CATEGORIES[0]),
  );
  const [notes, setNotes] = useState("");
  const [voiceNoteDataUrl, setVoiceNoteDataUrl] = useState(null);
  const [submittedEntry, setSubmittedEntry] = useState(null);
  const [previewTab, setPreviewTab] = useState("sms");

  function handleCategoryChange(nextCategory) {
    setCategory(nextCategory);
    setFields(defaultFieldsForCategory(nextCategory));
  }

  function updateField(key, value) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const stored = addFeedback({
      panchayat: selectedPanchayat ?? t("common.unknown"),
      crop: selectedCrop,
      cropStage: selectedCropStage,
      category,
      fields,
      notes: notes || null,
      voiceNoteDataUrl,
    });
    logEvent({
      type: "feedback_submitted",
      role,
      details: { category, panchayat: stored.panchayat, id: stored.id },
    });
    setSubmittedEntry(stored);
  }

  function handleSubmitAnother() {
    setSubmittedEntry(null);
    setFields(defaultFieldsForCategory(category));
    setNotes("");
    setVoiceNoteDataUrl(null);
  }

  if (submittedEntry) {
    return (
      <main className="flex-1 space-y-6 px-6 py-8">
        <h1 className="text-xl font-semibold">
          {t("farmer.feedback.confirmationTitle")}
        </h1>
        <Card>
          <Tabs
            tabs={[
              { key: "sms", label: t("farmer.feedback.smsTab") },
              { key: "ivr", label: t("farmer.feedback.ivrTab") },
            ]}
            active={previewTab}
            onChange={setPreviewTab}
          />
          <pre className="mt-4 whitespace-pre-wrap font-sans text-sm text-foreground/80">
            {previewTab === "ivr"
              ? formatFeedbackIvrScript(submittedEntry)
              : formatFeedbackSmsPreview(submittedEntry)}
          </pre>
        </Card>
        <Button variant="primary" onClick={handleSubmitAnother}>
          {t("farmer.feedback.submitAnother")}
        </Button>
      </main>
    );
  }

  return (
    <main className="flex-1 space-y-6 px-6 py-8">
      <h1 className="text-xl font-semibold">{t("farmer.feedback.title")}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <Select
            label={t("farmer.feedback.category")}
            value={category}
            onChange={(event) => handleCategoryChange(event.target.value)}
            options={FEEDBACK_CATEGORIES.map((c) => ({
              value: c,
              label: t(`farmer.feedback.categories.${c}`),
            }))}
          />

          <div className="mt-4 space-y-4">
            <CategoryFields
              category={category}
              fields={fields}
              onChange={updateField}
              t={t}
            />

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs uppercase tracking-wide text-foreground/40">
                {t("farmer.feedback.notes")}
              </span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm "
              />
            </label>

            <div>
              <span className="mb-1 block text-xs uppercase tracking-wide text-foreground/40">
                {t("farmer.feedback.voiceNote.label")}
              </span>
              <VoiceNoteRecorder
                value={voiceNoteDataUrl}
                onChange={setVoiceNoteDataUrl}
              />
            </div>
          </div>
        </Card>

        <Button type="submit" variant="primary">
          {t("farmer.feedback.submit")}
        </Button>
      </form>

      <Card title={t("farmer.feedback.recentTitle")}>
        {entries.length === 0 ? (
          <EmptyState title={t("farmer.feedback.recentNone")} />
        ) : (
          <ul className="space-y-2">
            {entries.slice(0, 5).map((entry) => (
              <li
                key={entry.id}
                className="rounded-md border border-border px-3 py-2 text-sm "
              >
                <p className="font-medium">
                  {t(`farmer.feedback.categories.${entry.category}`)} —{" "}
                  {entry.panchayat}
                </p>
                <p className="text-xs text-foreground/50">
                  {formatHourLabel(new Date(entry.timestamp))}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </main>
  );
}

function CategoryFields({ category, fields, onChange, t }) {
  if (category === "cropStage") {
    return (
      <Select
        label={t("farmer.feedback.cropStage.currentStage")}
        value={fields.currentStage}
        onChange={(event) => onChange("currentStage", event.target.value)}
        options={CROP_STAGE_OPTIONS.map((stage) => ({
          value: stage,
          label: t(`farmer.cropStages.${stage}`, stage),
        }))}
      />
    );
  }

  if (category === "irrigation") {
    return (
      <>
        <Select
          label={t("farmer.feedback.irrigation.irrigated")}
          value={fields.irrigated}
          onChange={(event) => onChange("irrigated", event.target.value)}
          options={[
            { value: "yes", label: t("farmer.feedback.irrigation.yes") },
            { value: "no", label: t("farmer.feedback.irrigation.no") },
          ]}
        />
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs uppercase tracking-wide text-foreground/40">
            {t("farmer.feedback.irrigation.method")}
          </span>
          <input
            type="text"
            value={fields.method}
            onChange={(event) => onChange("method", event.target.value)}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm "
          />
        </label>
      </>
    );
  }

  if (category === "pest") {
    return (
      <>
        <Select
          label={t("farmer.feedback.pest.observed")}
          value={fields.observed}
          onChange={(event) => onChange("observed", event.target.value)}
          options={[
            { value: "yes", label: t("farmer.feedback.irrigation.yes") },
            { value: "no", label: t("farmer.feedback.irrigation.no") },
          ]}
        />
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs uppercase tracking-wide text-foreground/40">
            {t("farmer.feedback.pest.pestType")}
          </span>
          <input
            type="text"
            value={fields.pestType}
            onChange={(event) => onChange("pestType", event.target.value)}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm "
          />
        </label>
        <Select
          label={t("farmer.feedback.pest.severity")}
          value={fields.severity}
          onChange={(event) => onChange("severity", event.target.value)}
          options={[
            { value: "low", label: t("farmer.feedback.pest.severityLow") },
            {
              value: "moderate",
              label: t("farmer.feedback.pest.severityModerate"),
            },
            { value: "high", label: t("farmer.feedback.pest.severityHigh") },
          ]}
        />
      </>
    );
  }

  if (category === "damage") {
    return (
      <>
        <Select
          label={t("farmer.feedback.damage.type")}
          value={fields.type}
          onChange={(event) => onChange("type", event.target.value)}
          options={[
            { value: "flood", label: t("farmer.feedback.damage.flood") },
            { value: "drought", label: t("farmer.feedback.damage.drought") },
            { value: "hail", label: t("farmer.feedback.damage.hail") },
            { value: "pest", label: t("farmer.feedback.damage.pestDamage") },
            { value: "other", label: t("farmer.feedback.damage.other") },
          ]}
        />
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs uppercase tracking-wide text-foreground/40">
            {t("farmer.feedback.damage.areaAffected")}
          </span>
          <input
            type="number"
            min={0}
            max={100}
            value={fields.areaAffectedPct}
            onChange={(event) =>
              onChange("areaAffectedPct", event.target.value)
            }
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm "
          />
        </label>
      </>
    );
  }

  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-xs uppercase tracking-wide text-foreground/40">
        {t("farmer.feedback.yield.expected")}
      </span>
      <input
        type="number"
        min={0}
        step="0.1"
        value={fields.expectedYieldQuintalsPerAcre}
        onChange={(event) =>
          onChange("expectedYieldQuintalsPerAcre", event.target.value)
        }
        className="rounded-md border border-border bg-surface px-3 py-2 text-sm "
      />
    </label>
  );
}
