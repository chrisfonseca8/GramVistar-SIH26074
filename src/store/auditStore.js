import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * Local, client-only audit trail. Not a real security
 * log — it exists so the prototype can demonstrate that important actions
 * (role changes now; advisory edits/approvals, threshold changes, scenario
 * runs and report generation added later) are recorded somewhere
 * visible and persistent.
 *
 * @typedef {{ id: string, type: string, role: string | null, timestamp: string, details?: object }} AuditEvent
 */

export const useAuditStore = create(
  persist(
    (set, get) => ({
      /** @type {AuditEvent[]} */
      events: [],
      hasHydrated: false,

      /** @param {boolean} value */
      setHasHydrated(value) {
        set({ hasHydrated: value });
      },

      /**
       * @param {{ type: string, role: string | null, details?: object }} event
       */
      logEvent({ type, role, details }) {
        /** @type {AuditEvent} */
        const event = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          type,
          role,
          timestamp: new Date().toISOString(),
          details,
        };
        set({ events: [event, ...get().events] });
        return event;
      },
    }),
    {
      name: "chas-audit-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ events: state.events }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
