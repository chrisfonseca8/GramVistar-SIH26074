import { DEFAULT_CROP_THRESHOLDS } from "@/data/cropThresholds";

/**
 * Merges `thresholdStore`'s per-crop overrides onto the defaults —
 * **this is the single function every threshold consumer must use**
 * instead of reading `DEFAULT_CROP_THRESHOLDS` directly, so any override
 * propagates everywhere thresholds are used (Plot 7, GDD Tracker,
 * Advisory Studio) consistently.
 * @param {Record<string, object>} overrides `thresholdStore`'s `overrides` state
 * @returns {typeof DEFAULT_CROP_THRESHOLDS}
 */
export function selectEffectiveCropThresholds(overrides) {
  return DEFAULT_CROP_THRESHOLDS.map((defaults) => ({
    ...defaults,
    ...(overrides[defaults.crop] ?? {}),
  }));
}

/**
 * @param {Record<string, object>} overrides
 * @param {string} crop
 * @returns {object|null}
 */
export function selectEffectiveThresholdForCrop(overrides, crop) {
  const defaults = DEFAULT_CROP_THRESHOLDS.find((c) => c.crop === crop);
  return defaults ? { ...defaults, ...(overrides[crop] ?? {}) } : null;
}
