import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * Government drill mode — a timed, clearly-labeled
 * practice session, entirely local. Starting/ending a drill never
 * touches real alert/advisory/publication state — it only records that a
 * drill was running and for how long, so it genuinely must not break
 * the core application.
 */
export const useDrillModeStore = create(
  persist(
    (set, get) => ({
      /** @type {boolean} */
      active: false,
      /** @type {string|null} */
      startedAt: null,
      /** @type {{ startedAt: string, endedAt: string }[]} */
      history: [],

      startDrill() {
        set({ active: true, startedAt: new Date().toISOString() });
      },

      endDrill() {
        const { startedAt, history } = get();
        if (!startedAt) return;
        set({
          active: false,
          startedAt: null,
          history: [
            { startedAt, endedAt: new Date().toISOString() },
            ...history,
          ],
        });
      },
    }),
    {
      name: "chas-drill-mode-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
