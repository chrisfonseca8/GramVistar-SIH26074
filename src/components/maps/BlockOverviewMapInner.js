"use client";

import RiskLayerMapInner from "@/components/maps/RiskLayerMapInner";
import { valueToColor } from "@/lib/colorScale";
import { RISK_COLORS } from "@/lib/riskLevels";

const VULNERABILITY_SCALE = [
  RISK_COLORS.green,
  RISK_COLORS.yellow,
  RISK_COLORS.orange,
  RISK_COLORS.red,
];

/**
 * Chas Block map — the 5 panchayat boundaries colored by vulnerability
 * index, click a panchayat to select it globally. Thin wrapper around the
 * generic `RiskLayerMapInner` supplying vulnerability-specific
 * color/tooltip callbacks.
 */
export default function BlockOverviewMapInner({
  borders,
  vulnerabilityByPanchayat,
  selectedPanchayat,
  onSelectPanchayat,
}) {
  return (
    <RiskLayerMapInner
      borders={borders}
      selectedPanchayat={selectedPanchayat}
      onSelectPanchayat={onSelectPanchayat}
      getFillColor={(name) => {
        const vulnerability = vulnerabilityByPanchayat[name];
        return vulnerability != null
          ? valueToColor(vulnerability, {
              min: 0,
              max: 1,
              colors: VULNERABILITY_SCALE,
            })
          : "#cccccc";
      }}
      getTooltip={(name) => {
        const vulnerability = vulnerabilityByPanchayat[name];
        return `${name}${vulnerability != null ? ` — vulnerability ${vulnerability.toFixed(2)}` : ""}`;
      }}
    />
  );
}
