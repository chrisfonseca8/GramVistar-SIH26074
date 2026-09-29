import { z } from "zod";

/**
 * The Government report output schema.
 * Matches the JSON shape `REPORT_SYSTEM_PROMPT` instructs Gemini/mock to
 * produce — one shared schema for all 5 report types, since they all
 * reduce to "a title plus a list of headed sections." Mirrors
 * `advisorySchema.js`'s exact validate-both-sources-uniformly pattern.
 */
export const ReportSectionSchema = z.object({
  heading: z.string().min(1),
  body: z.string().min(1),
});

export const ReportSchema = z.object({
  title: z.string().min(1),
  sections: z.array(ReportSectionSchema).min(1),
  generatedAt: z.string().min(1),
});

/**
 * Parses and validates raw report text (from either mock or Gemini) —
 * **never throws**. Strips a ```json... ``` fence if present, same as
 * `parseAdvisoryOutput`.
 *
 * @param {string|null} rawText
 * @returns {{ success: true, data: object } | { success: false, error: string }}
 */
export function parseReportOutput(rawText) {
  if (!rawText) return { success: false, error: "No report text to parse." };

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

  const result = ReportSchema.safeParse(json);
  if (!result.success) {
    const issues = result.error.issues.map(
      (issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`,
    );
    return { success: false, error: issues.join("; ") };
  }

  return { success: true, data: result.data };
}
