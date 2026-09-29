import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { RISK_LEVELS } from "@/lib/riskLevels";

/**
 * Manual alert escalation state — a government user can
 * escalate/de-escalate an alert's level (Green/Yellow/Orange/Red,
 * the shared 4-level scheme) independently of the level the
 * platform's own calculations computed for it. Follows the same
 * persisted-Zustand pattern as every other store — "escalation" is
 * inherently a human decision layered on top of a computed severity,
 * not something that can be derived, so it needs its own overridable
 * state.
 */
function alertKey(alert) {
  return `${alert.panchayat}::${alert.type}`;
}

export const useAlertEscalationStore = create(
  persist(
    (set, get) => ({
      /** @type {Record<string, string>} alert key -> RISK_LEVELS entry */
      overrides: {},

      /**
       * @param {{ panchayat: string, type: string }} alert
       * @param {string} computedLevel one of `RISK_LEVELS`, the level to escalate/de-escalate from if no override exists yet
       * @param {1 | -1} direction +1 escalates, -1 de-escalates
       */
      shiftEscalation(alert, computedLevel, direction) {
        const key = alertKey(alert);
        const current = get().overrides[key] ?? computedLevel;
        const currentIndex = RISK_LEVELS.indexOf(current);
        const nextIndex = Math.min(
          RISK_LEVELS.length - 1,
          Math.max(0, currentIndex + direction),
        );
        set({
          overrides: { ...get().overrides, [key]: RISK_LEVELS[nextIndex] },
        });
      },

      /**
       * @param {{ panchayat: string, type: string }} alert
       * @param {string} computedLevel fallback if this alert has never been manually escalated
       * @returns {string} one of `RISK_LEVELS`
       */
      getEscalationLevel(alert, computedLevel) {
        return get().overrides[alertKey(alert)] ?? computedLevel;
      },
    }),
    {
      name: "chas-alert-escalation-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
