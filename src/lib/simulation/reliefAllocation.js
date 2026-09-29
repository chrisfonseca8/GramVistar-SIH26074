/**
 * Relief Allocation Optimizer — a simple browser-side
 * demand vs supply calculator. Not a real logistics optimizer (no
 * transport network, storage, or eligibility data exists anywhere in
 * `/data`) — a proportional split of a manually-entered supply total
 * across panchayats, weighted by each panchayat's relative need.
 */

/**
 * Splits `totalSupply` units across panchayats in proportion to their
 * relative need weight. If every weight is 0/unavailable, splits evenly
 * instead of dividing by zero.
 *
 * @param {{ panchayat: string, needWeight: number }[]} demand
 * @param {number} totalSupply
 * @returns {{ panchayat: string, needWeight: number, allocated: number, sharePct: number }[]}
 */
export function computeProportionalAllocation(demand, totalSupply) {
  const weightSum = demand.reduce(
    (sum, d) => sum + Math.max(0, d.needWeight ?? 0),
    0,
  );

  if (weightSum <= 0) {
    const evenShare = demand.length > 0 ? totalSupply / demand.length : 0;
    return demand.map((d) => ({
      panchayat: d.panchayat,
      needWeight: d.needWeight,
      allocated: evenShare,
      sharePct: demand.length > 0 ? 100 / demand.length : 0,
    }));
  }

  return demand.map((d) => {
    const weight = Math.max(0, d.needWeight ?? 0);
    const sharePct = (weight / weightSum) * 100;
    return {
      panchayat: d.panchayat,
      needWeight: d.needWeight,
      allocated: totalSupply * (weight / weightSum),
      sharePct,
    };
  });
}
