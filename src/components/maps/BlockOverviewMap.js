"use client";

import dynamic from "next/dynamic";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

/** Leaflet touches `window` at import time, so it must load client-only. */
export const BlockOverviewMap = dynamic(
  () => import("@/components/maps/BlockOverviewMapInner"),
  {
    ssr: false,
    loading: () => <LoadingSkeleton className="h-80 w-full" />,
  },
);
