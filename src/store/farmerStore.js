import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * The Farmer portal's own selected crop/crop-stage. Kept
 * separate from `selectionStore` (which only holds the shared panchayat
 * selector every portal uses) because crop/crop-stage is a Farmer-specific
 * concept — Advisory Studio's crop/stage pickers are local component
 * state tied to a specific advisory draft, not a global "current crop".
 */
export const useFarmerStore = create(
  persist(
    (set) => ({
      /** @type {string | null} */
      selectedCrop: null,
      /** @type {string | null} */
      selectedCropStage: null,

      /** @param {string | null} crop */
      setSelectedCrop(crop) {
        set({ selectedCrop: crop });
      },

      /** @param {string | null} stage */
      setSelectedCropStage(stage) {
        set({ selectedCropStage: stage });
      },
    }),
    {
      name: "chas-farmer-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
