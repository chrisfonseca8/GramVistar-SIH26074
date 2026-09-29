/**
 * The named response measures per hazard for the Disaster Management
 * modules (all modules are UI/simulation only). This is
 * a fixed reference list, not derived from any data source: `/data` has
 * no disaster-response/relief-measure dataset, so these
 * measures are named explicitly per hazard here. Hazard `key`s intentionally match
 * `RISK_LAYERS`' keys (`src/data/selectors/riskMaps.js`) for
 * the 5 overlapping hazards, so this module's checklist can show each
 * panchayat's real computed severity for that hazard alongside the
 * (simulated) measures being tracked for it.
 */
export const DISASTER_MODULES = [
  {
    key: "drought",
    label: "Drought",
    measures: [
      "Grains",
      "Water tankers",
      "Fodder",
      "MGNREGA works",
      "Insurance",
      "Delay-sowing advisories",
    ],
  },
  {
    key: "flood",
    label: "Flood",
    measures: ["Shelters", "Evacuation", "Embankments", "Pumps", "Relief"],
  },
  {
    key: "heatwave",
    label: "Heatwave",
    measures: ["Cooling centers", "Water tankers", "Work hours", "Livestock"],
  },
  {
    key: "coldWave",
    label: "Cold Wave / Frost",
    measures: ["Warnings", "Smoke/fog", "Crop covers", "Livestock"],
  },
  {
    key: "pestDisease",
    label: "Pest / Disease",
    measures: ["Quarantine", "Pesticide", "Mass advisories"],
  },
];
