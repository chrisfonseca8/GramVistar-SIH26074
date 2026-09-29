import { isFiniteNumber } from "@/lib/calculations/result";

function computeQuantile(sortedValues, q) {
  const pos = (sortedValues.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sortedValues[base + 1] !== undefined) {
    return (
      sortedValues[base] + rest * (sortedValues[base + 1] - sortedValues[base])
    );
  }
  return sortedValues[base];
}

/**
 * Detects statistical outliers in a field using Tukey's IQR fence method
 * (deterministic, no distribution assumptions): a value is flagged if it
 * falls outside `[Q1 - k*IQR, Q3 + k*IQR]`, `k` defaulting to the standard
 * 1.5.
 *
 * @param {object[]} records
 * @param {string} field
 * @param {{ iqrMultiplier?: number }} [options]
 * @returns {{ field: string, presentCount: number, outlierCount: number, outlierPct: number, lowerFence: number|null, upperFence: number|null, outlierIndices: number[] }}
 */
export function computeOutlierSummary(
  records,
  field,
  { iqrMultiplier = 1.5 } = {},
) {
  const present = [];
  records.forEach((record, index) => {
    const value = record[field];
    if (isFiniteNumber(value)) present.push({ index, value });
  });

  if (present.length < 4) {
    return {
      field,
      presentCount: present.length,
      outlierCount: 0,
      outlierPct: 0,
      lowerFence: null,
      upperFence: null,
      outlierIndices: [],
    };
  }

  const sorted = [...present]
    .sort((a, b) => a.value - b.value)
    .map((p) => p.value);
  const q1 = computeQuantile(sorted, 0.25);
  const q3 = computeQuantile(sorted, 0.75);
  const iqr = q3 - q1;
  const lowerFence = q1 - iqrMultiplier * iqr;
  const upperFence = q3 + iqrMultiplier * iqr;

  const outlierIndices = present
    .filter((p) => p.value < lowerFence || p.value > upperFence)
    .map((p) => p.index);

  return {
    field,
    presentCount: present.length,
    outlierCount: outlierIndices.length,
    outlierPct: (outlierIndices.length / present.length) * 100,
    lowerFence,
    upperFence,
    outlierIndices,
  };
}
