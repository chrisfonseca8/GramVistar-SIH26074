"use client";

import { useMemo, useState } from "react";
import { useDataStore } from "@/store/dataStore";
import { useFeedbackStore } from "@/store/feedbackStore";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { MetricTile } from "@/components/ui/MetricTile";
import { Modal } from "@/components/ui/Modal";
import {
  Table,
  TableHeadRow,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import { FEEDBACK_CATEGORIES } from "@/data/feedbackCategories";
import {
  selectFilteredFeedback,
  selectFeedbackTrendSummary,
} from "@/data/selectors/feedbackInbox";
import { formatHourLabel } from "@/lib/formatters";

const CATEGORY_LABELS = {
  cropStage: "Crop Stage",
  irrigation: "Irrigation",
  pest: "Pest",
  damage: "Damage",
  yield: "Yield",
};

export default function FeedbackInboxPage() {
  const status = useDataStore((state) => state.status);
  const error = useDataStore((state) => state.error);
  const data = useDataStore((state) => state.data);
  const entries = useFeedbackStore((state) => state.entries);

  const [panchayatFilter, setPanchayatFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [selectedEntry, setSelectedEntry] = useState(null);

  const filtered = useMemo(
    () =>
      selectFilteredFeedback(entries, {
        panchayat: panchayatFilter || undefined,
        category: categoryFilter || undefined,
        dateFrom: dateRange.from
          ? new Date(dateRange.from).toISOString()
          : undefined,
        dateTo: dateRange.to || undefined,
      }),
    [entries, panchayatFilter, categoryFilter, dateRange],
  );

  const trends = useMemo(
    () => selectFeedbackTrendSummary(filtered),
    [filtered],
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

  return (
    <main className="flex-1 space-y-6 px-6 py-8">
      <div>
        <h1 className="text-xl font-semibold">Feedback Inbox</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Every farmer feedback submission, read directly from the shared
          client-side store — there is no backend or notification system, this
          page just filters/displays what farmers have already submitted on this
          device.
        </p>
      </div>

      <Card title="Filters">
        <div className="flex flex-wrap items-end gap-4">
          <Select
            label="Panchayat"
            value={panchayatFilter}
            onChange={(event) => setPanchayatFilter(event.target.value)}
            options={[
              { value: "", label: "All panchayats" },
              ...data.panchayats.map((p) => ({ value: p, label: p })),
            ]}
          />
          <Select
            label="Category"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            options={[
              { value: "", label: "All categories" },
              ...FEEDBACK_CATEGORIES.map((c) => ({
                value: c,
                label: CATEGORY_LABELS[c],
              })),
            ]}
          />
          <DateRangePicker
            label="Submitted between"
            from={dateRange.from}
            to={dateRange.to}
            onChange={setDateRange}
          />
        </div>
      </Card>

      <Card title="Trend Summary">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <MetricTile
            bordered
            label="Total (filtered)"
            value={String(trends.total)}
          />
          {trends.byCategory.map((row) => (
            <MetricTile
              bordered
              key={row.category}
              label={CATEGORY_LABELS[row.category] ?? row.category}
              value={String(row.count)}
            />
          ))}
        </div>
        {trends.byPanchayat.length > 0 ? (
          <div className="mt-4">
            <p className="mb-2 text-xs uppercase tracking-wide text-foreground/40">
              By panchayat
            </p>
            <ul className="flex flex-wrap gap-2 text-sm">
              {trends.byPanchayat.map((row) => (
                <li
                  key={row.panchayat}
                  className="rounded-full border border-border px-3 py-1 "
                >
                  {row.panchayat}: {row.count}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Card>

      <Card title={`Submissions (${filtered.length})`}>
        {filtered.length === 0 ? (
          <EmptyState title="No feedback matches these filters" />
        ) : (
          <Table>
            <thead>
              <TableHeadRow>
                <TableCell as="th">Date</TableCell>
                <TableCell as="th">Panchayat</TableCell>
                <TableCell as="th">Category</TableCell>
                <TableCell as="th">Crop</TableCell>
                <TableCell as="th" />
              </TableHeadRow>
            </thead>
            <tbody>
              {filtered.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    {formatHourLabel(new Date(entry.timestamp))}
                  </TableCell>
                  <TableCell>{entry.panchayat}</TableCell>
                  <TableCell>
                    {CATEGORY_LABELS[entry.category] ?? entry.category}
                  </TableCell>
                  <TableCell>{entry.crop ?? "—"}</TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => setSelectedEntry(entry)}
                      className="text-xs font-medium underline underline-offset-4 hover:text-foreground"
                    >
                      View
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal
        open={Boolean(selectedEntry)}
        onClose={() => setSelectedEntry(null)}
        title="Feedback detail"
      >
        {selectedEntry ? <FeedbackDetail entry={selectedEntry} /> : null}
      </Modal>
    </main>
  );
}

function FeedbackDetail({ entry }) {
  return (
    <div className="space-y-4 text-sm">
      <dl className="grid grid-cols-2 gap-3">
        <MetricTile label="Panchayat" value={entry.panchayat} />
        <MetricTile
          label="Category"
          value={CATEGORY_LABELS[entry.category] ?? entry.category}
        />
        <MetricTile label="Crop" value={entry.crop ?? "—"} />
        <MetricTile label="Crop stage" value={entry.cropStage ?? "—"} />
        <MetricTile
          label="Submitted"
          value={formatHourLabel(new Date(entry.timestamp))}
        />
      </dl>

      <div>
        <p className="mb-1 text-xs uppercase tracking-wide text-foreground/40">
          Fields
        </p>
        <dl className="grid grid-cols-2 gap-2">
          {Object.entries(entry.fields ?? {}).map(([key, value]) => (
            <MetricTile key={key} label={key} value={String(value)} />
          ))}
        </dl>
      </div>

      {entry.notes ? (
        <div>
          <p className="mb-1 text-xs uppercase tracking-wide text-foreground/40">
            Notes
          </p>
          <p>{entry.notes}</p>
        </div>
      ) : null}

      {entry.voiceNoteDataUrl ? (
        <div>
          <p className="mb-1 text-xs uppercase tracking-wide text-foreground/40">
            Voice note
          </p>
          <audio controls src={entry.voiceNoteDataUrl} className="w-full" />
        </div>
      ) : null}
    </div>
  );
}
