import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * Participatory sensing — farmer-submitted rainfall
 * reports, independent of the official forecast. Persisted the same way
 * every other store is; there is no real crowd-sourcing backend, so
 * "submitting a report" means writing it here, where the Scientist-side
 * Participatory Sensing page reads it from.
 */
export const useRainfallReportsStore = create(
  persist(
    (set, get) => ({
      /** @type {object[]} */
      reports: [],

      /**
       * @param {{ panchayat: string, estimatedMm: number, notes: string|null }} report
       * @returns {object} the stored report, with `id`/`timestamp` assigned
       */
      addReport(report) {
        const stored = {
          ...report,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          timestamp: new Date().toISOString(),
        };
        set({ reports: [stored, ...get().reports] });
        return stored;
      },
    }),
    {
      name: "chas-rainfall-reports-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
