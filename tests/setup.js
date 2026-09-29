import { createMockLocalStorage } from "./unit/helpers/mockLocalStorage";

// Zustand's `persist` middleware reads `localStorage` synchronously when a
// store is created, so it must exist globally before any store module is
// imported (module imports are hoisted above test code).
if (typeof globalThis.localStorage === "undefined") {
  globalThis.localStorage = createMockLocalStorage();
}
