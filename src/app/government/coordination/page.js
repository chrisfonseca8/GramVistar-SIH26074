"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useCoordinationStore } from "@/store/coordinationStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatHourLabel } from "@/lib/formatters";

const DEPARTMENTS = ["DM/DC"];

/**
 * Inter-department coordination view — a shared note
 * board across the Government roles/departments, entirely local.
 */
export default function CoordinationPage() {
  const role = useAuthStore((state) => state.role);
  const notes = useCoordinationStore((state) => state.notes);
  const addNote = useCoordinationStore((state) => state.addNote);

  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [message, setMessage] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    if (!message.trim()) return;
    addNote({ department, message: message.trim(), authorRole: role });
    setMessage("");
  }

  const filteredNotes = filterDepartment
    ? notes.filter((n) => n.department === filterDepartment)
    : notes;

  return (
    <main className="flex-1 space-y-6 px-6 py-8">
      <div>
        <h1 className="text-xl font-semibold">Inter-Department Coordination</h1>
        <p className="mt-1 text-sm text-foreground/60">
          A shared status/note board across Government roles — every role
          reads the same local state, so a note posted by one department is
          immediately visible to every other one.
        </p>
      </div>

      <Card title="Post an update">
        <form
          onSubmit={handleSubmit}
          className="flex flex-wrap items-end gap-3"
        >
          <Select
            label="Department"
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
            options={DEPARTMENTS.map((d) => ({ value: d, label: d }))}
          />
          <label className="flex flex-1 min-w-[240px] flex-col gap-1 text-sm">
            <span className="text-xs uppercase tracking-wide text-foreground/40">
              Message
            </span>
            <input
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="e.g. Water tankers dispatched to Kumhari"
              className="rounded-md border border-border bg-surface px-3 py-2 text-sm "
            />
          </label>
          <Button type="submit" variant="primary">
            Post
          </Button>
        </form>
      </Card>

      <Card title="Updates">
        <div className="mb-3">
          <Select
            label="Filter by department"
            value={filterDepartment}
            onChange={(event) => setFilterDepartment(event.target.value)}
            options={[
              { value: "", label: "All departments" },
              ...DEPARTMENTS.map((d) => ({ value: d, label: d })),
            ]}
          />
        </div>
        {filteredNotes.length === 0 ? (
          <EmptyState title="No updates posted yet" />
        ) : (
          <ul className="space-y-2">
            {filteredNotes.map((note) => (
              <li
                key={note.id}
                className="rounded-md border border-border p-3 text-sm "
              >
                <p className="flex items-center justify-between gap-2">
                  <span className="font-medium">{note.department}</span>
                  <span className="text-xs text-foreground/50">
                    {formatHourLabel(new Date(note.timestamp))}
                  </span>
                </p>
                <p className="mt-1 text-foreground/70">{note.message}</p>
                {note.authorRole ? (
                  <p className="mt-1 text-xs text-foreground/40">
                    — {note.authorRole}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </main>
  );
}
