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
    (set, get) => ({
      /** @type {string | null} */
      selectedCrop: null,
      /** @type {string | null} */
      selectedCropStage: null,
      /** Advisory action items the farmer has marked done, as `${advisoryId}:${actionIndex}` keys. @type {string[]} */
      completedActionKeys: [],

      /** @param {string | null} crop */
      setSelectedCrop(crop) {
        set({ selectedCrop: crop });
      },

      /** @param {string | null} stage */
      setSelectedCropStage(stage) {
        set({ selectedCropStage: stage });
      },

      /** @param {string} advisoryId @param {number} actionIndex */
      toggleActionCompleted(advisoryId, actionIndex) {
        const key = `${advisoryId}:${actionIndex}`;
        const current = get().completedActionKeys;
        set({
          completedActionKeys: current.includes(key)
            ? current.filter((k) => k !== key)
            : [...current, key],
        });
      },
    }),
    {
      name: "chas-farmer-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
