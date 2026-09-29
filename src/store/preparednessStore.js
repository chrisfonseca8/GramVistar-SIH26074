import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const POINTS_PER_ACTION = 10;

/**
 * Gamified early warning — a farmer earns points for
 * acknowledging/preparing for an active alert. Purely a local engagement
 * mechanic (no real reward, no backend) — the "gamification" is the
 * points/level shown back to the farmer, nothing more.
 */
export const usePreparednessStore = create(
  persist(
    (set, get) => ({
      /** @type {number} */
      points: 0,
      /** @type {string[]} alert keys already marked prepared-for, so the same alert instance can't be double-counted */
      acknowledgedAlertKeys: [],

      /** @param {string} alertKey */
      markPrepared(alertKey) {
        if (get().acknowledgedAlertKeys.includes(alertKey)) return;
        set({
          points: get().points + POINTS_PER_ACTION,
          acknowledgedAlertKeys: [...get().acknowledgedAlertKeys, alertKey],
        });
      },
    }),
    {
      name: "chas-preparedness-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

/** @param {number} points @returns {string} */
export function levelForPoints(points) {
  if (points >= 100) return "Gold";
  if (points >= 40) return "Silver";
  if (points > 0) return "Bronze";
  return "Unranked";
}
