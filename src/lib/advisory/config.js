/**
 * Whether the app should use the deterministic mock generator instead of
 * calling Gemini — the app must default to stub mode, and Gemini
 * being optional must never break normal development.
 *
 * Mock mode is used unless the app is explicitly told not to
 * (`NEXT_PUBLIC_USE_STUB_LLM=false`) AND an API key is actually present —
 * setting the flag to live without a key still falls back to mock rather
 * than throwing.
 * @returns {boolean}
 */
export function isMockMode() {
  const explicitlyLive = process.env.NEXT_PUBLIC_USE_STUB_LLM === "false";
  const hasApiKey = Boolean(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
  return !(explicitlyLive && hasApiKey);
}
