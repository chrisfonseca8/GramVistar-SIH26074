import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * @typedef {"Draft"|"Review"|"Approved"|"Rejected"|"Published"} AdvisoryStatus
 * @typedef {{
 * versionNumber: number,
 * timestamp: string,
 * authorRole: string|null,
 * changeSummary: string,
 * content: object,
 * status: AdvisoryStatus,
 * }} AdvisoryVersion
 * @typedef {{
 * id: string,
 * panchayat: string,
 * crop: string|null,
 * cropStage: string|null,
 * dateRange: { start: string, end: string }|null,
 * audience: "farmer"|"authority",
 * status: AdvisoryStatus,
 * versions: AdvisoryVersion[],
 * }} Advisory
 */

function createAdvisoryId() {
  return `adv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Advisory documents with full version history. Every
 * content edit *and* every status transition (Draft→Review→Approved/
 * Rejected→Published) appends a new version — nothing is overwritten, so
 * the full history and diffs stay available.
 */
export const useAdvisoryStore = create(
  persist(
    (set, get) => ({
      /** @type {Advisory[]} */
      advisories: [],
      hasHydrated: false,

      /** @param {boolean} value */
      setHasHydrated(value) {
        set({ hasHydrated: value });
      },

      /**
       * @param {{ panchayat: string, crop: string, cropStage: string, dateRange: { start: string, end: string }, audience: "farmer"|"authority", content: object, authorRole: string|null }} params
       * @returns {string} the new advisory's id
       */
      createDraft({
        panchayat,
        crop,
        cropStage,
        dateRange,
        audience,
        content,
        authorRole,
      }) {
        const id = createAdvisoryId();
        /** @type {AdvisoryVersion} */
        const version = {
          versionNumber: 1,
          timestamp: new Date().toISOString(),
          authorRole,
          changeSummary: "Initial draft",
          content,
          status: "Draft",
        };
        /** @type {Advisory} */
        const advisory = {
          id,
          panchayat,
          crop,
          cropStage,
          dateRange,
          audience,
          status: "Draft",
          versions: [version],
        };
        set({ advisories: [advisory, ...get().advisories] });
        return id;
      },

      /**
       * Appends a content edit as a new version, without changing status.
       * @param {string} advisoryId
       * @param {{ content: object, changeSummary: string, authorRole: string|null }} params
       */
      saveEdit(advisoryId, { content, changeSummary, authorRole }) {
        set({
          advisories: get().advisories.map((advisory) => {
            if (advisory.id !== advisoryId) return advisory;
            /** @type {AdvisoryVersion} */
            const version = {
              versionNumber: advisory.versions.length + 1,
              timestamp: new Date().toISOString(),
              authorRole,
              changeSummary,
              content,
              status: advisory.status,
            };
            return { ...advisory, versions: [...advisory.versions, version] };
          }),
        });
      },

      /**
       * Appends a status transition as a new version (content carried over
       * unchanged from the last version).
       * @param {string} advisoryId
       * @param {{ newStatus: AdvisoryStatus, changeSummary: string, authorRole: string|null }} params
       */
      transitionStatus(advisoryId, { newStatus, changeSummary, authorRole }) {
        set({
          advisories: get().advisories.map((advisory) => {
            if (advisory.id !== advisoryId) return advisory;
            const lastVersion = advisory.versions[advisory.versions.length - 1];
            /** @type {AdvisoryVersion} */
            const version = {
              versionNumber: advisory.versions.length + 1,
              timestamp: new Date().toISOString(),
              authorRole,
              changeSummary,
              content: lastVersion.content,
              status: newStatus,
            };
            return {
              ...advisory,
              status: newStatus,
              versions: [...advisory.versions, version],
            };
          }),
        });
      },

      /** @param {string} advisoryId @returns {Advisory|undefined} */
      getAdvisory(advisoryId) {
        return get().advisories.find((advisory) => advisory.id === advisoryId);
      },
    }),
    {
      name: "chas-advisory-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ advisories: state.advisories }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
