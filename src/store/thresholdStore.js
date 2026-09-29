import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * Per-crop threshold overrides — keyed by crop name, each
 * value `{ heatStressC, coldStressC, baseTempC }`. A crop with no entry
 * here falls back to `DEFAULT_CROP_THRESHOLDS` — see
 * `src/data/effectiveThresholds.js` for the merge.
 */
export const useThresholdStore = create(
  persist(
    (set, get) => ({
      /** @type {Record<string, { heatStressC: number, coldStressC: number, baseTempC: number }>} */
      overrides: {},
      hasHydrated: false,

      /** @param {boolean} value */
      setHasHydrated(value) {
        set({ hasHydrated: value });
      },

      /** @param {string} crop @param {{ heatStressC: number, coldStressC: number, baseTempC: number }} thresholds */
      setOverride(crop, thresholds) {
        set({ overrides: { ...get().overrides, [crop]: thresholds } });
      },

      /** @param {string} crop */
      resetOverride(crop) {
        const rest = { ...get().overrides };
        delete rest[crop];
        set({ overrides: rest });
      },

      resetAll() {
        set({ overrides: {} });
      },
    }),
    {
      name: "chas-threshold-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ overrides: state.overrides }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
