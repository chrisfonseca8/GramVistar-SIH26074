"use client";

import dynamic from "next/dynamic";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

/**
 * Shared Plotly wrapper for every chart in the app — reuse one chart
 * component rather than duplicating the dynamic-import boilerplate per
 * chart. Plotly touches the DOM at import time, so it's loaded
 * client-only via `next/dynamic`.
 */
export const PlotlyChart = dynamic(
  () => import("@/components/charts/PlotlyChartInner"),
  {
    ssr: false,
    loading: () => <LoadingSkeleton className="h-80 w-full" />,
  },
);
