import { z } from "zod";
import {
  extractJsonObject,
  normalizeLevelCasing,
} from "@/lib/advisory/parseJsonResponse";

/**
 * The relief/resource-allocation output schema — matches the JSON shape
 * `buildReliefAllocationSystemPrompt` instructs the generator/mock to
 * produce. Same validation discipline as `advisorySchema.js`: both mock
 * and live output are checked against this uniformly.
 */
const LevelSchema = z.preprocess(
  normalizeLevelCasing,
  z.enum(["Low", "Medium", "High"]),
);

export const ReliefResourceSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  priority: LevelSchema,
});

export const ReliefAllocationSchema = z.object({
  summary: z.string().min(1),
  resources: z.array(ReliefResourceSchema).min(1),
  confidence: LevelSchema,
});

/**
 * Parses and validates raw relief-allocation text (from either mock or
 * live generation) — **never throws**. Extracts the JSON object from the
 * raw text (see `extractJsonObject()`) before validating, same as
 * `parseAdvisoryOutput`.
 * @param {string|null} rawText
 * @returns {{ success: true, data: object } | { success: false, error: string }}
 */
export function parseReliefAllocationOutput(rawText) {
  if (!rawText)
    return { success: false, error: "No relief allocation text to parse." };

  const json = extractJsonObject(rawText);
  if (!json) {
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
