import { isMockMode } from "@/lib/advisory/config";
import { generateMockReliefAllocation } from "@/lib/advisory/mockReliefAllocation";
import { callGeminiForReliefAllocation } from "@/lib/advisory/geminiClient";
import { RELIEF_ALLOCATION_PROMPT_VERSION } from "@/lib/prompts/reliefAllocationPrompt";

/**
 * The single abstraction every caller uses to draft a relief/resource
 * allocation for one published authority advisory — routes to the
 * deterministic mock generator or live Gemini depending on
 * `isMockMode()` (the same shared config as `generateAdvisory()`).
 * Never throws regardless of source.
 *
 * @param {object} reliefAllocationInput the output of `buildReliefAllocationInput()`
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
export async function generateReliefAllocation(reliefAllocationInput, options = {}) {
  const generatedAt = new Date().toISOString();

  if (isMockMode()) {
    const allocation = generateMockReliefAllocation(reliefAllocationInput);
    return {
      source: "mock",
      ok: true,
      rawText: JSON.stringify(allocation),
      error: null,
      promptVersion: RELIEF_ALLOCATION_PROMPT_VERSION,
      generatedAt,
    };
  }

  const result = await callGeminiForReliefAllocation(
    reliefAllocationInput,
    options,
  );
  return {
    source: "gemini",
    ok: result.ok,
    rawText: result.ok ? result.rawText : null,
    error: result.ok ? null : result.error,
    promptVersion: RELIEF_ALLOCATION_PROMPT_VERSION,
    generatedAt,
  };
}
