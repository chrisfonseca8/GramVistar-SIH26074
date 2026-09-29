import { isMockMode } from "@/lib/advisory/config";
import { generateMockAdvisory } from "@/lib/advisory/mockAdvisory";
import { generateMockAuthorityAdvisory } from "@/lib/advisory/mockAuthorityAdvisory";
import { callGeminiForAdvisory } from "@/lib/advisory/geminiClient";
import { ADVISORY_PROMPT_VERSION } from "@/lib/prompts/advisoryPrompt";

/**
 * The single abstraction every caller uses to draft an advisory —
 * routes to the deterministic mock generator or live
 * Gemini depending on `isMockMode()`. Returns the same shape either way
 * so callers (the parse/validate step) don't need to branch on
 * source, and **never throws** regardless of source.
 *
 * `audience` picks which of the two advisories this call drafts, and
 * which shape `advisoryInput` must already be in:
 * - `"farmer"` — the output of `buildAdvisoryInput()` (crop/timeline),
 *   drafting plain-language field actions.
 * - `"authority"` — the output of `buildAuthorityAdvisoryInput()`
 *   (panchayat-wide hazards), drafting an operational/resource briefing.
 *
 * The Scientist reviews and approves/rejects each independently in
 * Advisory Studio.
 *
 * `rawText` is always a JSON string matching the schema documented in
 * `src/lib/prompts/advisoryPrompt.js` — parsing/schema-validating it is
 * deliberately not done here.
 *
 * @param {object} advisoryInput
 * @param {"farmer"|"authority"} audience
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
export async function generateAdvisory(advisoryInput, audience, options = {}) {
  const generatedAt = new Date().toISOString();

  if (isMockMode()) {
    const advisory =
      audience === "authority"
        ? generateMockAuthorityAdvisory(advisoryInput)
        : generateMockAdvisory(advisoryInput);
    return {
      source: "mock",
      ok: true,
      rawText: JSON.stringify(advisory),
      error: null,
      promptVersion: ADVISORY_PROMPT_VERSION,
      generatedAt,
    };
  }

  const result = await callGeminiForAdvisory(advisoryInput, audience, options);
  return {
    source: "gemini",
    ok: result.ok,
    rawText: result.ok ? result.rawText : null,
    error: result.ok ? null : result.error,
    promptVersion: ADVISORY_PROMPT_VERSION,
    generatedAt,
  };
}
