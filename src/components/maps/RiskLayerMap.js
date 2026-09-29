"use client";

import dynamic from "next/dynamic";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

/** Leaflet touches `window` at import time, so it must load client-only. */
export const RiskLayerMap = dynamic(
  () => import("@/components/maps/RiskLayerMapInner"),
  {
    ssr: false,
    loading: () => <LoadingSkeleton className="h-80 w-full" />,
  },
);
