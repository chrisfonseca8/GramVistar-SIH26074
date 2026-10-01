import { z } from "zod";
import {
  extractJsonObject,
  normalizeLevelCasing,
} from "@/lib/advisory/parseJsonResponse";

/**
 * The advisory output schema. Matches the
 * JSON shape `ADVISORY_SYSTEM_PROMPT` instructs the generator/mock to
 * produce — both sources are validated against this same schema uniformly.
 */
const LevelSchema = z.preprocess(
  normalizeLevelCasing,
  z.enum(["Low", "Medium", "High"]),
);

export const AdvisoryActionSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  priority: LevelSchema,
});

// A single local model reply has been observed returning `reasons` as one
// string instead of an array of strings, despite the prompt's schema —
// tolerated here (normalized to a one-element array) rather than rejecting
// an otherwise-usable draft over a shape a smaller model gets wrong.
const ReasonsSchema = z.preprocess(
  (value) => (typeof value === "string" ? [value] : value),
  z.array(z.string().min(1)).min(1),
);

export const AdvisorySchema = z.object({
  language: z.string().min(1),
  summary: z.string().min(1),
  actions: z.array(AdvisoryActionSchema).min(1),
  reasons: ReasonsSchema,
  confidence: LevelSchema,
});

/**
 * Parses and validates raw advisory text (from either mock or live
 * generation) — **never throws**. Extracts the JSON object from the raw
 * text (see `extractJsonObject()`) before validating; raw LLM output is
 * never trusted directly.
 *
 * @param {string|null} rawText
 * @returns {{ success: true, data: object } | { success: false, error: string }}
 */
export function parseAdvisoryOutput(rawText) {
  if (!rawText) return { success: false, error: "No advisory text to parse." };

  const json = extractJsonObject(rawText);
  if (!json) {
    return { success: false, error: "Response is not valid JSON." };
  }

  const result = AdvisorySchema.safeParse(json);
  if (!result.success) {
    const issues = result.error.issues.map(
      (issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`,
    );
    return { success: false, error: issues.join("; ") };
  }

  return { success: true, data: result.data };
}
