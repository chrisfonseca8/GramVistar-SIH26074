import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * Farmer feedback — one of the stores planned from early on but left
 * until it was actually needed. Every entry is one submission of a
 * specific `category` (cropStage/irrigation/pest/damage/yield), with
 * category-specific `fields`, stored entirely in `localStorage` — there
 * is no backend to send this to, so "submitting" feedback means writing
 * it here, where the Scientist feedback inbox reads it from.
 */
export const useFeedbackStore = create(
  persist(
    (set, get) => ({
      /** @type {object[]} */
      entries: [],

      /**
       * @param {{ panchayat: string, crop: string|null, cropStage: string|null, category: string, fields: object, voiceNoteDataUrl?: string|null }} entry
       * @returns {object} the stored entry, with `id`/`timestamp` assigned
       */
      addFeedback(entry) {
        const stored = {
          ...entry,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          timestamp: new Date().toISOString(),
        };
        set({ entries: [stored, ...get().entries] });
        return stored;
      },
    }),
    {
      name: "chas-feedback-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
