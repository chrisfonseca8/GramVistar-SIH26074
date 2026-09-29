import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * Disaster Management module toggle state — all modules are
 * UI/simulation only. Tracks which response measures are currently
 * marked active, per hazard/panchayat/measure, persisted to
 * `localStorage` the same way every other store is. There is no backend
 * this actually dispatches to — toggling a measure here
 * only records that a government user marked it active in this
 * simulation.
 */
function toggleKey(hazardKey, panchayat, measure) {
  return `${hazardKey}::${panchayat}::${measure}`;
}

export const useDisasterModulesStore = create(
  persist(
    (set, get) => ({
      /** @type {Record<string, boolean>} */
      activeMeasures: {},

      /** @param {string} hazardKey @param {string} panchayat @param {string} measure */
      toggleMeasure(hazardKey, panchayat, measure) {
        const key = toggleKey(hazardKey, panchayat, measure);
        set({
          activeMeasures: {
            ...get().activeMeasures,
            [key]: !get().activeMeasures[key],
          },
        });
      },

      /** @param {string} hazardKey @param {string} panchayat @param {string} measure @returns {boolean} */
      isMeasureActive(hazardKey, panchayat, measure) {
        return Boolean(
          get().activeMeasures[toggleKey(hazardKey, panchayat, measure)],
        );
      },
    }),
    {
      name: "chas-disaster-modules-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
