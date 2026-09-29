import { isFiniteNumber } from "@/lib/calculations/result";

/**
 * Coefficient of variation (sample stdDev / mean) — a scale-independent
 * measure of how variable a series is, used as a climate-exposure factor
 * (e.g. rainfall variability) in the panchayat vulnerability index.
 * @param {(number|null)[]} values
 * @returns {number|null} `null` for <2 values or a zero mean (never fabricated)
 */
export function computeCoefficientOfVariation(values) {
  const clean = values.filter(isFiniteNumber);
  if (clean.length < 2) return null;

  const mean = clean.reduce((sum, v) => sum + v, 0) / clean.length;
  if (mean === 0) return null;

  const variance =
    clean.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (clean.length - 1);
  return Math.sqrt(variance) / mean;
}
