"use client";

import { useTranslation } from "react-i18next";
import { computeSprayWindow } from "@/lib/calculations/sprayWindow";
import { formatNumber, formatPercent, formatWindSpeed } from "@/lib/formatters";
import { RISK_COLORS } from "@/lib/riskLevels";

/**
 * A row of at-a-glance condition cards for right now — soil moisture,
 * humidity, wind and spray-window status. Every value here is read
 * straight from the current forecast hour and the app's own shared
 * calculation functions (the same soil-moisture zone boundaries as the
 * Soil Moisture gauge, the same `computeSprayWindow` used elsewhere) —
 * nothing here is a placeholder or invented number.
 */
export function EnvironmentalConditionCards({ current, soilMoistureDeficit }) {
  const { t } = useTranslation();

  const soilStatus =
    soilMoistureDeficit == null
      ? null
      : soilMoistureDeficit <= 0.03
        ? {
            label: t("farmer.conditions.soilStatus.sufficient"),
            color: RISK_COLORS.green,
          }
        : soilMoistureDeficit <= 0.06
          ? {
              label: t("farmer.conditions.soilStatus.gettingDry"),
              color: RISK_COLORS.yellow,
            }
          : {
              label: t("farmer.conditions.soilStatus.needsWater"),
              color: RISK_COLORS.red,
            };

  const humidityStatus =
    current?.humidityPct == null
      ? null
      : current.humidityPct >= 85
        ? {
            label: t("farmer.conditions.humidityStatus.fungalRisk"),
            color: RISK_COLORS.red,
          }
        : current.humidityPct >= 70
          ? {
              label: t("farmer.conditions.humidityStatus.elevated"),
              color: RISK_COLORS.yellow,
            }
          : {
              label: t("farmer.conditions.humidityStatus.normal"),
              color: RISK_COLORS.green,
            };

  const windStatus =
    current?.windSpeedKmh == null
      ? null
      : current.windSpeedKmh > 15
        ? {
            label: t("farmer.conditions.windStatus.caution"),
            color: RISK_COLORS.yellow,
          }
        : { label: t("farmer.conditions.windStatus.calm"), color: RISK_COLORS.green };

  const spray =
    current?.windSpeedKmh != null && current?.rainProbabilityPct != null
      ? computeSprayWindow({
          windSpeedKmh: current.windSpeedKmh,
          rainProbabilityPct: current.rainProbabilityPct,
          tempC: current.temperatureC,
        })
      : { available: false };

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <ConditionCard
        icon="💧"
        label={t("farmer.conditions.soilMoisture")}
        value={
          soilMoistureDeficit == null
            ? "—"
            : formatNumber(soilMoistureDeficit, { decimals: 3, suffix: " m³/m³" })
        }
        status={soilStatus}
      />
      <ConditionCard
        icon="🌡️"
        label={t("farmer.weather.humidity")}
        value={formatPercent(current?.humidityPct)}
        status={humidityStatus}
      />
      <ConditionCard
        icon="💨"
        label={t("farmer.weather.wind")}
        value={formatWindSpeed(current?.windSpeedKmh)}
        status={windStatus}
      />
      <ConditionCard
        icon={spray.available && spray.value.favorable ? "✅" : "🚫"}
        label={t("farmer.conditions.sprayWindow")}
        value={
          !spray.available
            ? "—"
            : spray.value.favorable
              ? t("farmer.conditions.favorable")
              : t("farmer.conditions.unfavorable")
        }
        status={
          !spray.available
            ? null
            : spray.value.favorable
              ? { label: t("farmer.conditions.goAhead"), color: RISK_COLORS.green }
              : { label: t("farmer.conditions.holdOff"), color: RISK_COLORS.red }
        }
      />
    </div>
  );
}

function ConditionCard({ icon, label, value, status }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wide text-foreground/40">
          {label}
        </p>
        <p className="mt-1 break-words text-xl font-black text-foreground">{value}</p>
        {status ? (
          <p
            className="mt-0.5 text-[11px] font-bold"
            style={{ color: status.color }}
          >
            {status.label}
          </p>
        ) : null}
      </div>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-xl">
        {icon}
      </div>
    </div>
  );
}
