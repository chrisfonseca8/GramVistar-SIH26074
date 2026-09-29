import { callGemini } from "@/lib/advisory/geminiClient";
import {
  REPORT_SYSTEM_PROMPT,
  buildReportUserPrompt,
} from "@/lib/prompts/reportPrompt";

/**
 * Report-specific wrapper around the shared `callGemini()` primitive
 * (reusing the same Gemini abstraction rather than duplicating API
 * logic). Contains no Gemini-SDK/streaming/error-handling logic of
 * its own; all of that lives in `callGemini()`, shared with
 * `callGeminiForAdvisory`.
 *
 * @param {object} reportInput the output of `buildReportInput()`
 * @param {{ onStreamChunk?: (text: string) => void }} [options]
 * @returns {Promise<{ ok: true, rawText: string } | { ok: false, error: string }>}
 */
export async function callGeminiForReport(reportInput, options = {}) {
  return callGemini({
    systemPrompt: REPORT_SYSTEM_PROMPT,
    userPrompt: buildReportUserPrompt(reportInput),
    onStreamChunk: options.onStreamChunk,
  });
}
