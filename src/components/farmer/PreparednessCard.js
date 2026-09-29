"use client";

import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  usePreparednessStore,
  levelForPoints,
} from "@/store/preparednessStore";

/**
 * Gamified early warning. Marking an active alert as
 * "prepared for" earns points and a level (Bronze/Silver/Gold) — an
 * engagement mechanic to encourage acting on alerts, not a real reward.
 */
export function PreparednessCard({ alerts }) {
  const { t } = useTranslation();
  const points = usePreparednessStore((state) => state.points);
  const acknowledgedAlertKeys = usePreparednessStore(
    (state) => state.acknowledgedAlertKeys,
  );
  const markPrepared = usePreparednessStore((state) => state.markPrepared);

  return (
    <Card title={t("farmer.preparedness.title")}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold">{points}</p>
          <p className="text-xs text-foreground/50">
            {t("farmer.preparedness.level", { level: levelForPoints(points) })}
          </p>
        </div>
      </div>

      {alerts.length > 0 ? (
        <div className="mt-3 space-y-2">
          {alerts.map((alert) => {
            const key = `${alert.panchayat}::${alert.type}`;
            const done = acknowledgedAlertKeys.includes(key);
            return (
              <div
                key={key}
                className="flex items-center justify-between gap-2 rounded-md border border-border p-2 text-sm "
              >
                <span className="text-foreground/70">{alert.type}</span>
                <Button
                  size="sm"
                  variant={done ? "ghost" : "primary"}
                  disabled={done}
                  onClick={() => markPrepared(key)}
                >
                  {done
                    ? t("farmer.preparedness.done")
                    : t("farmer.preparedness.markPrepared")}
                </Button>
              </div>
            );
          })}
        </div>
      ) : null}
    </Card>
  );
}
