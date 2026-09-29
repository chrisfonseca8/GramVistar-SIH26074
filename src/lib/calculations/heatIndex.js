import { available, unavailable, isFiniteNumber } from "./result";

function celsiusToFahrenheit(c) {
  return (c * 9) / 5 + 32;
}

function fahrenheitToCelsius(f) {
  return ((f - 32) * 5) / 9;
}

/**
 * Apparent "feels like" temperature from air temperature and relative
 * humidity, per the US National Weather Service method: a simple linear
 * estimate first, refined with the full Rothfusz (1990) regression once
 * that simple estimate indicates hot conditions (average of itself and the
 * actual temperature ≥ 80°F), which is the regression's valid domain.
 *
 * @param {{ tempC: number|null, humidityPct: number|null }} input
 * @returns {import("./result").CalcResult} value in °C
 */
export function computeHeatIndex({ tempC, humidityPct }) {
  if (!isFiniteNumber(tempC)) return unavailable("°C", "missing tempC");
  if (!isFiniteNumber(humidityPct))
    return unavailable("°C", "missing humidityPct");
  if (humidityPct < 0 || humidityPct > 100)
    return unavailable("°C", "humidityPct out of 0-100 range");

  const T = celsiusToFahrenheit(tempC);
  const RH = humidityPct;

  const simpleEstimateF = 0.5 * (T + 61 + (T - 68) * 1.2 + RH * 0.094);

  if ((simpleEstimateF + T) / 2 < 80) {
    return available(fahrenheitToCelsius(simpleEstimateF), "°C");
  }

  const fullRegressionF =
    -42.379 +
    2.04901523 * T +
    10.14333127 * RH -
    0.22475541 * T * RH -
    0.00683783 * T * T -
    0.05481717 * RH * RH +
    0.00122874 * T * T * RH +
    0.00085282 * T * RH * RH -
    0.00000199788 * T * T * RH * RH;

  return available(fahrenheitToCelsius(fullRegressionF), "°C");
}
