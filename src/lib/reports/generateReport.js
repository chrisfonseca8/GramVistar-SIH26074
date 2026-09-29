import { isMockMode } from "@/lib/advisory/config";
import { generateMockReport } from "@/lib/reports/mockReportGenerator";
import { callGeminiForReport } from "@/lib/reports/callGeminiForReport";
import { REPORT_PROMPT_VERSION } from "@/lib/prompts/reportPrompt";

/**
 * The single abstraction every caller uses to draft a Government report —
 * routes to the deterministic mock generator or live
 * Gemini depending on `isMockMode()` (the shared config, reused
 * unchanged). Same shape as `generateAdvisory()` so callers don't need
 * to branch on source, and **never throws** regardless of source.
 *
 * @param {object} reportInput the output of `buildReportInput()`
 * @param {{ onStreamChunk?: (text: string) => void }} [options]
 * @returns {Promise<{
 * source: "mock"| "gemini",
 * ok: boolean,
 * rawText: string | null,
 * error: string | null,
 * promptVersion: string,
 * generatedAt: string,
 * }>}
 */
export async function generateReport(reportInput, options = {}) {
  const generatedAt = new Date().toISOString();

  if (isMockMode()) {
    const report = generateMockReport(reportInput);
    return {
      source: "mock",
      ok: true,
      rawText: JSON.stringify(report),
      error: null,
      promptVersion: REPORT_PROMPT_VERSION,
      generatedAt,
    };
  }

  const result = await callGeminiForReport(reportInput, options);
  return {
    source: "gemini",
    ok: result.ok,
    rawText: result.ok ? result.rawText : null,
    error: result.ok ? null : result.error,
    promptVersion: REPORT_PROMPT_VERSION,
    generatedAt,
  };
}
