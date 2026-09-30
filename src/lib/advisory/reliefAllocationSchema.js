import { z } from "zod";

/**
 * The relief/resource-allocation output schema — matches the JSON shape
 * `buildReliefAllocationSystemPrompt` instructs Gemini/mock to produce.
 * Same validation discipline as `advisorySchema.js`: both mock and
 * Gemini output are checked against this uniformly.
 */
export const ReliefResourceSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  priority: z.enum(["Low", "Medium", "High"]),
});

export const ReliefAllocationSchema = z.object({
  summary: z.string().min(1),
  resources: z.array(ReliefResourceSchema).min(1),
  confidence: z.enum(["Low", "Medium", "High"]),
});

/**
 * Parses and validates raw relief-allocation text (from either mock or
 * Gemini) — **never throws**. Strips a ```json ... ``` fence if present,
 * same as `parseAdvisoryOutput`.
 * @param {string|null} rawText
 * @returns {{ success: true, data: object } | { success: false, error: string }}
 */
export function parseReliefAllocationOutput(rawText) {
  if (!rawText)
    return { success: false, error: "No relief allocation text to parse." };

  const stripped = rawText
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  let json;
  try {
    json = JSON.parse(stripped);
  } catch {
    return { success: false, error: "Response is not valid JSON." };
  }

  const result = ReliefAllocationSchema.safeParse(json);
  if (!result.success) {
    const issues = result.error.issues.map(
      (issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`,
    );
    return { success: false, error: issues.join("; ") };
  }

  return { success: true, data: result.data };
}
