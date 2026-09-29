"use client";

import dynamic from "next/dynamic";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

/** Leaflet touches `window` at import time, so it must load client-only. */
export const ElevationMap = dynamic(
  () => import("@/components/maps/ElevationMapInner"),
  {
    ssr: false,
    loading: () => <LoadingSkeleton className="h-96 w-full" />,
  },
);
