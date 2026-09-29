import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * The panchayat currently selected in the shared header, available
 * globally to every portal. `null` means "Chas Block"
 * (the block-level aggregate view), not "no selection made yet".
 */
export const useSelectionStore = create(
  persist(
    (set) => ({
      /** @type {string | null} */
      selectedPanchayat: null,

      /** @param {string | null} panchayat */
      setSelectedPanchayat(panchayat) {
        set({ selectedPanchayat: panchayat });
      },
    }),
    {
      name: "chas-selection-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
