const SCALAR_FIELDS = ["language", "summary", "confidence"];
const STRUCTURED_FIELDS = ["actions", "reasons", "thresholds"];

/**
 * A field-level diff between two advisory content snapshots (used by the
 * advisory diff view) — not a line-by-line text diff, but a per-field before/after
 * list, which is what actually matters for reviewing an advisory edit.
 * @param {object} before
 * @param {object} after
 * @returns {{ field: string, before: *, after: * }[]}
 */
export function diffAdvisoryContent(before, after) {
  const changes = [];

  for (const field of SCALAR_FIELDS) {
    if (before?.[field] !== after?.[field]) {
      changes.push({ field, before: before?.[field], after: after?.[field] });
    }
  }

  for (const field of STRUCTURED_FIELDS) {
    const beforeJson = JSON.stringify(before?.[field] ?? null);
    const afterJson = JSON.stringify(after?.[field] ?? null);
    if (beforeJson !== afterJson) {
      changes.push({ field, before: before?.[field], after: after?.[field] });
    }
  }

  return changes;
}
