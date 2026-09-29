import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  buildAdvisorySystemPrompt,
  buildAdvisoryUserPrompt,
  buildAuthorityAdvisoryUserPrompt,
} from "@/lib/prompts/advisoryPrompt";

const MODEL = "gemini-2.5-flash";
const TIMEOUT_MS = 30000;

/**
 * The generic "call Gemini with a system + user prompt" primitive —
 * **never throws** — every failure mode (missing key, network error,
 * timeout, API error) resolves to `{ ok: false, error }` so a Gemini
 * outage can never break the rest of the app.
 *
 * This is the one piece of actual Gemini-SDK/streaming/abort/error
 * logic in the app. `callGeminiForAdvisory` (below) and
 * `callGeminiForReport` (`src/lib/reports/`) are both thin wrappers
 * around this, reusing the same Gemini abstraction rather than
 * duplicating API logic.
 *
 * This is the "live" path — untested against a real API key in this
 * development environment (none is configured here); mock generators are
 * what every other check in this app actually exercised. Review this
 * file carefully before relying on it in production.
 *
 * @param {{ systemPrompt: string, userPrompt: string, onStreamChunk?: (text: string) => void }} params
 * @returns {Promise<{ ok: true, rawText: string } | { ok: false, error: string }>}
 */
export async function callGemini({ systemPrompt, userPrompt, onStreamChunk }) {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      error: "No API key configured (NEXT_PUBLIC_GEMINI_API_KEY).",
    };
  }

  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({
    model: MODEL,
    systemInstruction: systemPrompt,
  });
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const result = await model.generateContentStream(userPrompt, {
      signal: controller.signal,
    });

    let rawText = "";
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      rawText += chunkText;
      onStreamChunk?.(chunkText);
    }

    if (!rawText) {
      return { ok: false, error: "Gemini returned an empty response." };
    }

    return { ok: true, rawText };
  } catch (error) {
    if (error?.name === "AbortError") {
      return {
        ok: false,
        error: `Gemini request timed out after ${TIMEOUT_MS}ms.`,
      };
    }
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Advisory-specific wrapper around `callGemini()`. `advisoryInput` is the
 * output of `buildAdvisoryInput()` for `audience: "farmer"`, or of
 * `buildAuthorityAdvisoryInput()` for `audience: "authority"` — the two
 * shapes are different (crop/timeline vs panchayat-wide hazards), so the
 * matching user-prompt builder is picked by `audience`.
 * @param {object} advisoryInput
 * @param {"farmer"|"authority"} audience
 * @param {{ onStreamChunk?: (text: string) => void }} [options]
 * @returns {Promise<{ ok: true, rawText: string } | { ok: false, error: string }>}
 */
export async function callGeminiForAdvisory(
  advisoryInput,
  audience,
  options = {},
) {
  return callGemini({
    systemPrompt: buildAdvisorySystemPrompt(audience),
    userPrompt:
      audience === "authority"
        ? buildAuthorityAdvisoryUserPrompt(advisoryInput)
        : buildAdvisoryUserPrompt(advisoryInput),
    onStreamChunk: options.onStreamChunk,
  });
}
