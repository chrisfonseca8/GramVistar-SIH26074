import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * Government Action Tracker — a Kanban-style board
 * (New → In Progress → Escalated → Completed). Follows the same
 * pattern (Zustand + explicit `localStorage` `storage`) as every other
 * store in the app, since demo state is persisted locally where useful.
 */
export const STATUSES = ["New", "In Progress", "Escalated", "Completed"];

export const useActionTrackerStore = create(
  persist(
    (set, get) => ({
      /** @type {object[]} */
      actions: [],

      /**
       * @param {{ title: string, panchayat: string, category: string }} action
       * @returns {object} the stored action, with `id`/`createdAt`/`status` assigned
       */
      addAction(action) {
        const stored = {
          ...action,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          status: STATUSES[0],
          createdAt: new Date().toISOString(),
        };
        set({ actions: [stored, ...get().actions] });
        return stored;
      },

      /**
       * @param {string} id
       * @param {string} status one of `STATUSES`
       */
      moveAction(id, status) {
        set({
          actions: get().actions.map((a) =>
            a.id === id ? { ...a, status } : a,
          ),
        });
      },
    }),
    {
      name: "chas-action-tracker-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
