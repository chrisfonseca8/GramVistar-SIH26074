"use client";

import { useEffect, useState } from "react";

/**
 * Final offline-first pass — tracks the browser's real
 * `navigator.onLine` state so every portal (not just the Farmer portal,
 * which already had its own offline-cache handling for advisories)
 * can show a consistent "you're offline" signal. Starts `true`
 * (assume online) so server-rendered and first-paint markup never
 * flashes an incorrect offline state before hydration can read the real
 * browser value.
 *
 * @returns {boolean}
 */
export function useOnlineStatus() {
  const [online, setOnline] = useState(
    () => typeof navigator === "undefined" || navigator.onLine,
  );

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return online;
}
