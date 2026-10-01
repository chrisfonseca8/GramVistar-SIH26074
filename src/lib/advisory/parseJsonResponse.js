/**
 * Shared "best-effort extract a JSON object out of raw LLM text" step used
 * by both `advisorySchema.js` and `reliefAllocationSchema.js` — never
 * throws, returns `null` on total failure. Handles the two shapes a model
 * might return instead of a bare JSON object:
 * - fenced in a ```json ... ``` code block (stripped first),
 * - a JSON object with stray prose before/after it (falls back to the
 *   substring between the first `{` and the last `}`).
 *
 * `format: "json"` is already requested on every local-generation call
 * (see `ollamaClient.js`), which constrains the model to valid JSON
 * syntax — this extra tolerance is defense-in-depth for a weaker local
 * model that may still wrap the object in commentary, not a replacement
 * for that constraint.
 *
 * @param {string} text
 * @returns {object|null}
 */
export function extractJsonObject(text) {
  const stripped = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  try {
    return JSON.parse(stripped);
  } catch {
    // fall through to brace extraction
  }

  const start = stripped.indexOf("{");
  const end = stripped.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;

  try {
    return JSON.parse(stripped.slice(start, end + 1));
  } catch {
    return null;
  }
}

/**
 * Normalizes casing on a "Low"/"Medium"/"High"-style level value before
 * schema validation — a local model has been observed returning these in
 * the wrong case (e.g. "medium" or "HIGH") despite the prompt's exact
 * casing, which otherwise fails a strict `z.enum()` match even though the
 * value is semantically correct. Only touches casing; a value that isn't
 * one of the three at all (after normalizing) is left as-is so the enum
 * check still rejects it.
 *
 * @param {unknown} value
 * @returns {unknown} the title-cased string if `value` is a string, otherwise `value` unchanged
 */
export function normalizeLevelCasing(value) {
  if (typeof value !== "string") return value;
  const lower = value.trim().toLowerCase();
  if (lower === "low" || lower === "medium" || lower === "high") {
    return lower[0].toUpperCase() + lower.slice(1);
  }
  return value;
}
