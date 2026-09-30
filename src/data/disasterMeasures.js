/**
 * The named response measures per hazard, fed into the Government/DM-DC
 * advisory input (`buildAuthorityAdvisoryInput`) so the LLM/mock
 * generator knows which response measures exist for a hazard when
 * drafting an action. This is a fixed reference list, not derived from
 * any data source: `/data` has no disaster-response/relief-measure
 * dataset, so these measures are named explicitly per hazard here.
 * Hazard `key`s intentionally match `RISK_LAYERS`'s keys
 * (`src/data/selectors/riskMaps.js`) so each hazard's real computed
 * severity lines up with the measures tracked for it.
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
