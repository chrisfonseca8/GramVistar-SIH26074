import { isMockMode } from "@/lib/advisory/config";
import { generateMockReliefAllocation } from "@/lib/advisory/mockReliefAllocation";
import { callReliefAllocationGenerator } from "@/lib/advisory/ollamaClient";
import { RELIEF_ALLOCATION_PROMPT_VERSION } from "@/lib/prompts/reliefAllocationPrompt";

/**
 * The single abstraction every caller uses to draft a relief/resource
 * allocation for one published authority advisory — routes to the
 * deterministic mock generator or the live local generation service
 * depending on `isMockMode()` (the same shared config as
 * `generateAdvisory()`). Never throws regardless of source. The specific
 * model behind the "live" path is never named in the UI.
 *
 * @param {object} reliefAllocationInput the output of `buildReliefAllocationInput()`
 * @param {{ onStreamChunk?: (text: string) => void }} [options]
 * @returns {Promise<{
 * source: "mock"| "ai",
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

  const result = await callReliefAllocationGenerator(
    reliefAllocationInput,
    options,
  );
  return {
    source: "ai",
    ok: result.ok,
    rawText: result.ok ? result.rawText : null,
    error: result.ok ? null : result.error,
    promptVersion: RELIEF_ALLOCATION_PROMPT_VERSION,
    generatedAt,
  };
}
