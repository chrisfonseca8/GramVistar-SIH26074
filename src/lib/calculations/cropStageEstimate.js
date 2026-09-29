/**
 * A generic, calendar-based estimate of which growth stage a crop is in
 * for a given date — used so Advisory Studio can auto-detect crop stage
 * from the crop and the selected timeline instead of asking the
 * scientist to pick it manually.
 *
 * This is an illustrative estimate, not a real per-panchayat planting
 * record: no planting-date dataset exists anywhere in `/data`, so this
 * uses typical regional sowing/growth months for each crop instead.
 * Treat it the same way as the app's other illustrative calculations
 * (pest/disease risk, vulnerability index) — a reasonable default the
 * scientist should still sanity-check, not ground truth.
 *
 * Months are calendar months (1–12); each crop's stages are listed in
 * the order they occur through its growing season, wrapping across the
 * new year for Rabi (winter-sown) crops like Mustard.
 */
const CROP_CALENDARS = {
  Rice: [
    { stage: "Sowing", startMonth: 6 },
    { stage: "Vegetative", startMonth: 7 },
    { stage: "Flowering", startMonth: 9 },
    { stage: "Maturity", startMonth: 10 },
    { stage: "Harvest", startMonth: 11 },
  ],
  Maize: [
    { stage: "Sowing", startMonth: 6 },
    { stage: "Vegetative", startMonth: 7 },
    { stage: "Flowering", startMonth: 8 },
    { stage: "Maturity", startMonth: 9 },
    { stage: "Harvest", startMonth: 10 },
  ],
  Mustard: [
    { stage: "Sowing", startMonth: 10 },
    { stage: "Vegetative", startMonth: 11 },
    { stage: "Flowering", startMonth: 12 },
    { stage: "Maturity", startMonth: 2 },
    { stage: "Harvest", startMonth: 3 },
  ],
};

/** Cyclic forward distance (in months) from `fromMonth` to `toMonth`. */
function monthsForward(fromMonth, toMonth) {
  return (toMonth - fromMonth + 12) % 12;
}

/**
 * @param {string} crop one of `DEFAULT_CROP_THRESHOLDS`'s crop names
 * @param {Date} date the timeline's start date
 * @returns {string|null} one of `CROP_STAGE_OPTIONS`, or null if the crop
 * isn't in the calendar
 */
export function estimateCropStage(crop, date) {
  const calendar = CROP_CALENDARS[crop];
  if (!calendar || !(date instanceof Date) || Number.isNaN(date.getTime())) {
    return null;
  }

  const targetMonth = date.getUTCMonth() + 1;
  let best = calendar[0];
  let bestOffset = monthsForward(calendar[0].startMonth, targetMonth);

  for (const entry of calendar) {
    const offset = monthsForward(entry.startMonth, targetMonth);
    if (offset < bestOffset) {
      best = entry;
      bestOffset = offset;
    }
  }

  return best.stage;
}
