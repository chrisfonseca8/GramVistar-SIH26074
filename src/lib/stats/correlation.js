import { isFiniteNumber } from "@/lib/calculations/result";

/**
 * Pearson correlation coefficient between two equal-length arrays,
 * ignoring pairs where either value is missing. Returns `null` (never a
 * fabricated number) with fewer than 2 valid pairs or zero variance in
 * either series.
 * @param {(number|null)[]} xs
 * @param {(number|null)[]} ys
 * @returns {number|null}
 */
export function computePearsonCorrelation(xs, ys) {
  const pairs = [];
  for (let i = 0; i < Math.min(xs.length, ys.length); i += 1) {
    if (isFiniteNumber(xs[i]) && isFiniteNumber(ys[i]))
      pairs.push([xs[i], ys[i]]);
  }
  if (pairs.length < 2) return null;

  const meanX = pairs.reduce((sum, [x]) => sum + x, 0) / pairs.length;
  const meanY = pairs.reduce((sum, [, y]) => sum + y, 0) / pairs.length;

  let covariance = 0;
  let varianceX = 0;
  let varianceY = 0;
  for (const [x, y] of pairs) {
    covariance += (x - meanX) * (y - meanY);
    varianceX += (x - meanX) ** 2;
    varianceY += (y - meanY) ** 2;
  }
  if (varianceX === 0 || varianceY === 0) return null;

  return covariance / Math.sqrt(varianceX * varianceY);
}

/**
 * Pairwise correlation matrix across several fields of a record set.
 * @param {object[]} records
 * @param {string[]} fields
 * @returns {{ fields: string[], matrix: (number|null)[][] }}
 */
export function computeCorrelationMatrix(records, fields) {
  const series = fields.map((field) => records.map((r) => r[field]));
  const matrix = fields.map((_, i) =>
    fields.map((_, j) =>
      i === j ? 1 : computePearsonCorrelation(series[i], series[j]),
    ),
  );
  return { fields, matrix };
}
