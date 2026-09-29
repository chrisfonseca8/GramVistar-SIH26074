import { isFiniteNumber } from "@/lib/calculations/result";

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

/**
 * Linearly interpolates through an ordered list of hex colors.
 * @param {number} t 0-1
 * @param {string[]} colors
 * @returns {string} "rgb(r,g,b)"
 */
export function interpolateColor(t, colors) {
  const clamped = Math.min(1, Math.max(0, t));
  const scaled = clamped * (colors.length - 1);
  const index = Math.floor(scaled);
  const frac = scaled - index;
  const c1 = hexToRgb(colors[index]);
  const c2 = hexToRgb(colors[Math.min(colors.length - 1, index + 1)]);
  const r = Math.round(c1.r + (c2.r - c1.r) * frac);
  const g = Math.round(c1.g + (c2.g - c1.g) * frac);
  const b = Math.round(c1.b + (c2.b - c1.b) * frac);
  return `rgb(${r},${g},${b})`;
}

/** A terrain-like scale: low (green) -> mid (tan) -> high (brown), for elevation. */
export const TERRAIN_SCALE = ["#2b6a3d", "#c9d66a", "#d9a441", "#8b5a2b"];

/**
 * Maps a value within `[min, max]` to a color along `colors`, or a neutral
 * gray when the value/range is missing or degenerate.
 * @param {number|null} value
 * @param {{ min: number, max: number, colors?: string[] }} range
 * @returns {string}
 */
export function valueToColor(value, { min, max, colors = TERRAIN_SCALE }) {
  if (
    !isFiniteNumber(value) ||
    !isFiniteNumber(min) ||
    !isFiniteNumber(max) ||
    max === min
  ) {
    return "#cccccc";
  }
  return interpolateColor((value - min) / (max - min), colors);
}
