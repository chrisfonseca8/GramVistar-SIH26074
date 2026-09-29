"use client";

import { useEffect } from "react";
import { useDataStore } from "@/store/dataStore";

/**
 * Triggers the one-time load of all local data sources into the shared
 * Zustand store as soon as the app mounts. Renders children unconditionally
 * — consumers read `status`/`error` from `useDataStore` themselves so each
 * page can show its own loading/error/empty state.
 */
export function DataProvider({ children }) {
  const loadAll = useDataStore((state) => state.loadAll);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return children;
}
