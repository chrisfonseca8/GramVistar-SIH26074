import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * The district/block a Scientist or Government-portal user selected
 * right after logging in. Purely a UI gate — every dataset this app
 * loads is already scoped to Chas Block, Bokaro District, so this never
 * changes what data loads, it just confirms the user picked the one
 * district/block that has data before letting them into the portal.
 */
export const useRegionStore = create(
  persist(
    (set) => ({
      /** @type {string | null} */
      selectedDistrict: null,
      /** @type {string | null} */
      selectedBlock: null,
      confirmed: false,
      hasHydrated: false,

      /** @param {boolean} value */
      setHasHydrated(value) {
        set({ hasHydrated: value });
      },

      /** @param {string} district */
      setDistrict(district) {
        set({
          selectedDistrict: district,
          selectedBlock: null,
          confirmed: false,
        });
      },
      /** @param {string} block */
      setBlock(block) {
        set({ selectedBlock: block, confirmed: false });
      },
      confirmRegion() {
        set({ confirmed: true });
      },
      resetRegion() {
        set({ selectedDistrict: null, selectedBlock: null, confirmed: false });
      },
    }),
    {
      name: "gramvistar-region-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedDistrict: state.selectedDistrict,
        selectedBlock: state.selectedBlock,
        confirmed: state.confirmed,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
