import { create } from "zustand";
import { loadAllData } from "@/data";

/**
 * @typedef {"idle"| "loading"| "ready"| "error"} DataStatus
 */

export const useDataStore = create((set, get) => ({
  /** @type {DataStatus} */
  status: "idle",
  /** @type {string | null} */
  error: null,
  /** @type {Awaited<ReturnType<typeof loadAllData>> | null} */
  data: null,

  /**
   * Loads and normalizes every local data source. Safe to call multiple
   * times; skips re-fetching while already loading or once ready.
   */
  async loadAll() {
    const { status } = get();
    if (status === "loading" || status === "ready") return;

    set({ status: "loading", error: null });
    try {
      const data = await loadAllData();
      set({ status: "ready", data, error: null });
    } catch (error) {
      set({
        status: "error",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
}));
