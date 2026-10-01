/**
 * Whether the app should use the deterministic mock generator instead of
 * calling the local generation service — the app must default to stub
 * mode, and that service being unavailable must never break normal
 * development.
 *
 * Mock mode is used unless the app is explicitly told not to
 * (`NEXT_PUBLIC_USE_STUB_LLM=false`). Unlike a hosted API, the local
 * generator has no API key to gate on — if it isn't actually running,
 * `callLocalGenerator()` still fails safely to `{ ok: false, error }`
 * rather than throwing.
 * @returns {boolean}
 */
export function isMockMode() {
  return process.env.NEXT_PUBLIC_USE_STUB_LLM !== "false";
}
