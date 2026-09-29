/**
 * Simulated warning-delivery status, shown as the Warning Dissemination
 * Status. There is no real SMS/IVR
 * gateway in this frontend-only prototype, so nothing is
 * actually sent or delivered — this deterministically derives a plausible
 * delivered/pending/failed split from the warning's own identifying text,
 * so the same warning always shows the same simulated status on every
 * render/reload instead of re-rolling randomly (which would misleadingly
 * look like a live, changing delivery pipeline).
 */

function hashString(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * @param {string} seed a stable identifier for the warning (e.g. panchayat + type + message)
 * @returns {{ deliveredPct: number, pendingPct: number, failedPct: number }} sums to 100
 */
export function computeSimulatedDeliveryStatus(seed) {
  const hash = hashString(seed);
  // Delivered is always the majority outcome (85-97%), consistent with a
  // functioning-but-imperfect dissemination channel, not a coin flip.
  const deliveredPct = 85 + (hash % 13);
  const remaining = 100 - deliveredPct;
  const failedPct = remaining > 0 ? (hash >> 4) % (remaining + 1) : 0;
  const pendingPct = remaining - failedPct;

  return { deliveredPct, pendingPct, failedPct };
}
