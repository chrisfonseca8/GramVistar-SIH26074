import {
  buildAdvisorySystemPrompt,
  buildAdvisoryUserPrompt,
  buildAuthorityAdvisoryUserPrompt,
} from "@/lib/prompts/advisoryPrompt";
import {
  RELIEF_ALLOCATION_SYSTEM_PROMPT,
  buildReliefAllocationUserPrompt,
} from "@/lib/prompts/reliefAllocationPrompt";

const OLLAMA_BASE_URL =
  process.env.NEXT_PUBLIC_OLLAMA_URL ?? "http://localhost:11434";
const MODEL = process.env.NEXT_PUBLIC_OLLAMA_MODEL ?? "llama3.2";
// Local generation on consumer hardware is slower than a hosted API,
// especially CPU-only — generous timeout so a normal response isn't
// mistaken for a hang.
const TIMEOUT_MS = 120000;

/**
 * The generic "call the local generator with a system + user prompt"
 * primitive — **never throws**. Every failure mode (service unreachable,
 * timeout, empty response) resolves to `{ ok: false, error }` so an outage
 * of the local service can never break the rest of the app. Deliberately
 * generic error/user-facing text — the app does not name which model or
 * provider is behind this call anywhere in the UI.
 *
 * Talks directly to a local inference server's OpenAI/Ollama-style
 * streaming chat endpoint (newline-delimited JSON chunks) — no SDK, no API
 * key, nothing leaves the machine. `callAdvisoryGenerator` and
 * `callReliefAllocationGenerator` (below) are both thin wrappers around
 * this, reusing the same abstraction rather than duplicating
 * request/streaming/abort/error logic.
 *
 * @param {{ systemPrompt: string, userPrompt: string, onStreamChunk?: (text: string) => void }} params
 * @returns {Promise<{ ok: true, rawText: string } | { ok: false, error: string }>}
 */
export async function callLocalGenerator({
  systemPrompt,
  userPrompt,
  onStreamChunk,
}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: MODEL,
        stream: true,
        // Grammar-constrained decoding — the model physically cannot emit
        // a token that would break JSON syntax. Every prompt this client
        // is used for asks for a JSON object back, so this is unconditional
        // rather than a per-call option. It guarantees valid *syntax*, not
        // our exact schema — `advisorySchema.js`/`reliefAllocationSchema.js`
        // still validate the shape on top of this.
        format: "json",
        // Ollama defaults new conversations to a 2048-token context
        // window regardless of what the model itself supports — a prompt
        // only slightly larger than that gets silently truncated rather
        // than rejected. Prompts are already kept small (see
        // `advisoryPrompt.js`'s forecast summarizing), this is a safety
        // net on top of that, not a license to send large payloads.
        options: { num_ctx: 8192 },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok || !response.body) {
      return {
        ok: false,
        error: `The generator could not be reached (HTTP ${response.status}).`,
      };
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let rawText = "";
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.trim()) continue;
        const parsed = parseStreamLine(line);
        if (!parsed) continue;
        const chunkText = parsed.message?.content ?? "";
        if (chunkText) {
          rawText += chunkText;
          onStreamChunk?.(chunkText);
        }
      }
    }

    if (!rawText) {
      return { ok: false, error: "The generator returned an empty response." };
    }

    return { ok: true, rawText };
  } catch (error) {
    if (error?.name === "AbortError") {
      return {
        ok: false,
        error: `Generation timed out after ${Math.round(TIMEOUT_MS / 1000)}s.`,
      };
    }
    return {
      ok: false,
      error:
        "Could not reach the local generation service. Make sure it's running, then try again.",
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

function parseStreamLine(line) {
  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
}

/**
 * Advisory-specific wrapper around `callLocalGenerator()`. `advisoryInput`
 * is the output of `buildAdvisoryInput()` for `audience: "farmer"`, or of
 * `buildAuthorityAdvisoryInput()` for `audience: "authority"` — the two
 * shapes are different (crop/timeline vs panchayat-wide hazards), so the
 * matching user-prompt builder is picked by `audience`.
 * @param {object} advisoryInput
 * @param {"farmer"|"authority"} audience
 * @param {{ onStreamChunk?: (text: string) => void }} [options]
 * @returns {Promise<{ ok: true, rawText: string } | { ok: false, error: string }>}
 */
export async function callAdvisoryGenerator(
  advisoryInput,
  audience,
  options = {},
) {
  return callLocalGenerator({
    systemPrompt: buildAdvisorySystemPrompt(audience),
    userPrompt:
      audience === "authority"
        ? buildAuthorityAdvisoryUserPrompt(advisoryInput)
        : buildAdvisoryUserPrompt(advisoryInput),
    onStreamChunk: options.onStreamChunk,
  });
}

/**
 * Relief/resource-allocation-specific wrapper around `callLocalGenerator()`.
 * @param {object} reliefAllocationInput the output of `buildReliefAllocationInput()`
 * @param {{ onStreamChunk?: (text: string) => void }} [options]
 * @returns {Promise<{ ok: true, rawText: string } | { ok: false, error: string }>}
 */
export async function callReliefAllocationGenerator(
  reliefAllocationInput,
  options = {},
) {
  return callLocalGenerator({
    systemPrompt: RELIEF_ALLOCATION_SYSTEM_PROMPT,
    userPrompt: buildReliefAllocationUserPrompt(reliefAllocationInput),
    onStreamChunk: options.onStreamChunk,
  });
}
