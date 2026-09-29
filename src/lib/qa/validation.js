import {
  available,
  unavailable,
  isFiniteNumber,
} from "@/lib/calculations/result";

/**
 * @typedef {{ observed: number, predicted: number }} ValidationPair
 */

function cleanPairs(pairs) {
  return pairs.filter(
    (p) => isFiniteNumber(p.observed) && isFiniteNumber(p.predicted),
  );
}

/**
 * Coefficient of determination (R²) between paired observed/predicted
 * values. Only computed when at least 2 valid pairs exist — never
 * fabricated or silently skipped without saying why.
 * @param {ValidationPair[]} pairs
 * @returns {import("@/lib/calculations/result").CalcResult} dimensionless, 0-1 (can be negative for a very poor fit)
 */
export function computeRSquared(pairs) {
  const clean = cleanPairs(pairs);
  if (clean.length < 2)
    return unavailable("R²", "fewer than 2 valid observed/predicted pairs");

  const meanObserved =
    clean.reduce((sum, p) => sum + p.observed, 0) / clean.length;
  const totalSumSquares = clean.reduce(
    (sum, p) => sum + (p.observed - meanObserved) ** 2,
    0,
  );
  if (totalSumSquares === 0)
    return unavailable("R²", "zero variance in observed values");

  const residualSumSquares = clean.reduce(
    (sum, p) => sum + (p.observed - p.predicted) ** 2,
    0,
  );
  return available(1 - residualSumSquares / totalSumSquares, "R²");
}

/**
 * Root Mean Square Error between paired observed/predicted values.
 * @param {ValidationPair[]} pairs
 * @returns {import("@/lib/calculations/result").CalcResult} same unit as the compared values
 */
export function computeRmse(pairs) {
  const clean = cleanPairs(pairs);
  if (clean.length === 0)
    return unavailable(
      "same unit as compared values",
      "no valid observed/predicted pairs",
    );

  const meanSquaredError =
    clean.reduce((sum, p) => sum + (p.observed - p.predicted) ** 2, 0) /
    clean.length;
  return available(Math.sqrt(meanSquaredError), "same unit as compared values");
}
