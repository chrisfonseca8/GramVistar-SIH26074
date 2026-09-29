import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * Inter-department coordination — a shared local note
 * board visible across every Government role, since all 6 Government
 * roles already read the same client-side state (no per-role data
 * silo exists in this frontend-only prototype). Entirely local/simulated
 * — no real cross-department messaging system exists.
 */
export const useCoordinationStore = create(
  persist(
    (set, get) => ({
      /** @type {object[]} */
      notes: [],

      /**
       * @param {{ department: string, message: string, authorRole: string|null }} note
       * @returns {object} the stored note, with `id`/`timestamp` assigned
       */
      addNote(note) {
        const stored = {
          ...note,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          timestamp: new Date().toISOString(),
        };
        set({ notes: [stored, ...get().notes] });
        return stored;
      },
    }),
    {
      name: "chas-coordination-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
