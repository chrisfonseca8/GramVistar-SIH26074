import { z } from "zod";

/**
 * The advisory output schema. Matches the
 * JSON shape `ADVISORY_SYSTEM_PROMPT` instructs Gemini/mock to produce —
 * both sources are validated against this same schema uniformly.
 */
export const AdvisoryActionSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  priority: z.enum(["Low", "Medium", "High"]),
});

export const AdvisorySchema = z.object({
  language: z.string().min(1),
  summary: z.string().min(1),
  actions: z.array(AdvisoryActionSchema).min(1),
  reasons: z.array(z.string().min(1)).min(1),
  confidence: z.enum(["Low", "Medium", "High"]),
});

/**
 * Parses and validates raw advisory text (from either mock or Gemini) —
 * **never throws**. Strips a `\`\`\`json ... \`\`\`` fence if present,
 * since some models wrap JSON in one despite being told not to;
 * raw LLM output is never trusted directly.
 *
 * @param {string|null} rawText
 * @returns {{ success: true, data: object } | { success: false, error: string }}
 */
export function parseAdvisoryOutput(rawText) {
  if (!rawText) return { success: false, error: "No advisory text to parse." };

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

  const result = AdvisorySchema.safeParse(json);
  if (!result.success) {
    const issues = result.error.issues.map(
      (issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`,
    );
    return { success: false, error: issues.join("; ") };
  }

  return { success: true, data: result.data };
}
