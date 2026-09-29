/**
 * @typedef {{ index: number, timeKey: string|null, date: Date|null }} FrameTiming
 */

/**
 * Precomputes one animation frame per timestamp, given the ordered list of
 * timestamped source records (e.g. `forecastBlock`, hourly) and a function
 * that derives that frame's payload from one record. Used to drive a
 * time-slider/play-button animation without recomputing
 * anything during playback.
 *
 * @template T
 * @param {{ timeKey: string|null, date: Date|null }[]} timestampedRecords
 * @param {(record: object, index: number) => T} buildFramePayload
 * @returns {(FrameTiming & T)[]}
 */
export function buildTemporalFrames(timestampedRecords, buildFramePayload) {
  return timestampedRecords.map((record, index) => ({
    index,
    timeKey: record.timeKey ?? null,
    date: record.date ?? null,
    ...buildFramePayload(record, index),
  }));
}
