import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * Simulated authentication. There is no real login: `login(role)` simply
 * records a chosen role. Persisted to localStorage so the role survives a
 * page reload.
 *
 * `hasHydrated` distinguishes "we don't know the role yet because
 * localStorage hasn't been read" from "the user is logged out" — consumers
 * (RoleGate, login page) must wait for hydration before deciding what to
 * render, or they'll flash an incorrect state / cause a hydration mismatch.
 */
export const useAuthStore = create(
  persist(
    (set) => ({
      /** @type {string | null} */
      role: null,
      hasHydrated: false,

      /** @param {boolean} value */
      setHasHydrated(value) {
        set({ hasHydrated: value });
      },

      /** @param {string} role */
      login(role) {
        set({ role });
      },

      logout() {
        set({ role: null });
      },
    }),
    {
      name: "chas-auth-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ role: state.role }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
