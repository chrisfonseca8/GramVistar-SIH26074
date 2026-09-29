import { available, unavailable, isFiniteNumber } from "./result";

const SOLAR_CONSTANT_MJ_M2_MIN = 0.082;

/**
 * Extraterrestrial radiation (Ra), FAO-56 Penman-Monteith Ch.3 Eq.21-25.
 * This is the radiation that would reach the top of the atmosphere at a
 * given latitude and day of year — a purely astronomical quantity, not a
 * measurement, so it needs no weather-station input at all.
 *
 * @param {{ latitudeDeg: number, dayOfYear: number }} input dayOfYear is 1-365(6)
 * @returns {import("./result").CalcResult} value in MJ m⁻² day⁻¹
 */
export function computeExtraterrestrialRadiation({ latitudeDeg, dayOfYear }) {
  if (!isFiniteNumber(latitudeDeg))
    return unavailable("MJ/m²/day", "missing latitudeDeg");
  if (!isFiniteNumber(dayOfYear) || dayOfYear < 1 || dayOfYear > 366) {
    return unavailable("MJ/m²/day", "dayOfYear must be between 1 and 366");
  }

  const latRad = (latitudeDeg * Math.PI) / 180;
  const solarDeclination =
    0.409 * Math.sin((2 * Math.PI * dayOfYear) / 365 - 1.39);
  const inverseRelativeDistance =
    1 + 0.033 * Math.cos((2 * Math.PI * dayOfYear) / 365);
  const sunsetHourAngle = Math.acos(
    Math.max(-1, Math.min(1, -Math.tan(latRad) * Math.tan(solarDeclination))),
  );

  const ra =
    ((24 * 60) / Math.PI) *
    SOLAR_CONSTANT_MJ_M2_MIN *
    inverseRelativeDistance *
    (sunsetHourAngle * Math.sin(latRad) * Math.sin(solarDeclination) +
      Math.cos(latRad) *
        Math.cos(solarDeclination) *
        Math.sin(sunsetHourAngle));

  return available(ra, "MJ/m²/day");
}

/**
 * Reference evapotranspiration (ET0) via the Hargreaves-Samani (1985)
 * equation — chosen because, unlike Penman-Monteith, it needs only daily
 * min/max/mean temperature plus latitude/day-of-year, all of which our
 * historical and forecast data actually provide (no humidity, wind or
 * radiation station data required):
 *
 * ET0 = 0.0023 * (Tavg + 17.8) * sqrt(Tmax - Tmin) * 0.408 * Ra
 *
 * @param {{ tempMaxC: number|null, tempMinC: number|null, tempAvgC: number|null, latitudeDeg: number, dayOfYear: number }} input
 * @returns {import("./result").CalcResult} value in mm/day
 */
export function computeEt0Hargreaves({
  tempMaxC,
  tempMinC,
  tempAvgC,
  latitudeDeg,
  dayOfYear,
}) {
  if (
    !isFiniteNumber(tempMaxC) ||
    !isFiniteNumber(tempMinC) ||
    !isFiniteNumber(tempAvgC)
  ) {
    return unavailable("mm/day", "missing tempMaxC/tempMinC/tempAvgC");
  }
  if (tempMaxC < tempMinC) {
    return unavailable("mm/day", "tempMaxC is less than tempMinC");
  }

  const raResult = computeExtraterrestrialRadiation({ latitudeDeg, dayOfYear });
  if (!raResult.available) {
    return unavailable(
      "mm/day",
      `extraterrestrial radiation unavailable: ${raResult.reason}`,
    );
  }

  const raMmPerDay = 0.408 * raResult.value;
  const et0 =
    0.0023 * (tempAvgC + 17.8) * Math.sqrt(tempMaxC - tempMinC) * raMmPerDay;

  return available(Math.max(0, et0), "mm/day");
}
