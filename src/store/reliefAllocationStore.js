import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * @typedef {{
 * id: string,
 * advisoryId: string,
 * panchayat: string,
 * generatedAt: string,
 * source: "mock"|"gemini",
 * promptVersion: string,
 * content: { summary: string, resources: { title: string, description: string, priority: string }[], confidence: string },
 * }} ReliefAllocationEntry
 */

function createEntryId() {
  return `relief-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Every relief/resource allocation ever generated for a published
 * authority advisory, newest first — the Relief & Resource Allocator's
 * running history. Nothing is ever overwritten or discarded; each
 * generation appends a new entry, even re-generating for the same
 * advisory.
 */
export const useReliefAllocationStore = create(
  persist(
    (set, get) => ({
      /** @type {ReliefAllocationEntry[]} */
      entries: [],
      hasHydrated: false,

      /** @param {boolean} value */
      setHasHydrated(value) {
        set({ hasHydrated: value });
      },

      /**
       * @param {{ advisoryId: string, panchayat: string, source: "mock"|"gemini", promptVersion: string, content: object }} params
       * @returns {string} the new entry's id
       */
      addEntry({ advisoryId, panchayat, source, promptVersion, content }) {
        const id = createEntryId();
        /** @type {ReliefAllocationEntry} */
        const entry = {
          id,
          advisoryId,
          panchayat,
          generatedAt: new Date().toISOString(),
          source,
          promptVersion,
          content,
        };
        set({ entries: [entry, ...get().entries] });
        return id;
      },
    }),
    {
      name: "gramvistar-relief-allocation-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ entries: state.entries }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
