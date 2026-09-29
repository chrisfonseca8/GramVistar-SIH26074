/**
 * Deterministically derives a mock Government report from the structured
 * report input (`buildReportInput`'s output), reusing only the values
 * already in it — no randomness, no invented panchayat names or numbers.
 * Same input always produces the same output, exactly like
 * `generateMockAdvisory`.
 *
 * @param {object} reportInput the output of `buildReportInput()`
 * @returns {object} matches the schema in `src/lib/reports/reportSchema.js`
 */
export function generateMockReport(reportInput) {
  const generators = {
    situationReport: buildSituationReport,
    disasterBulletin: buildDisasterBulletin,
    resourcePlan: buildResourcePlan,
    vulnerabilitySummary: buildVulnerabilitySummary,
    actionChecklist: buildActionChecklist,
  };

  const build = generators[reportInput.reportType] ?? buildSituationReport;
  return build(reportInput);
}

function severeOrWatchByHazard(reportInput) {
  return reportInput.hazardSnapshot.map(({ hazard, byPanchayat }) => {
    const affected = Object.entries(byPanchayat)
      .filter(
        ([, result]) =>
          result.available &&
          (result.level === "severe" ||
            result.level === "warning" ||
            result.level === "watch"),
      )
      .map(([panchayat, result]) => `${panchayat} (${result.level})`);
    return { hazard, affected };
  });
}

function buildSituationReport(reportInput) {
  const hazardStatus = severeOrWatchByHazard(reportInput);
  const anyHazardActive = hazardStatus.some((h) => h.affected.length > 0);

  return {
    title: `Situation Report — ${reportInput.scope}`,
    sections: [
      {
        heading: "Current Alerts",
        body:
          reportInput.alerts.length > 0
            ? reportInput.alerts
                .map((a) => `${a.panchayat}: ${a.type} — ${a.message}`)
                .join("; ")
            : "No active alerts at this time.",
      },
      {
        heading: "Hazard Overview",
        body: anyHazardActive
          ? hazardStatus
              .filter((h) => h.affected.length > 0)
              .map((h) => `${h.hazard}: ${h.affected.join(", ")}`)
              .join("; ")
          : "No panchayats currently at watch/severe level for any tracked hazard.",
      },
      {
        heading: "Vulnerability Snapshot",
        body: topVulnerabilityText(reportInput.vulnerabilityRanking),
      },
    ],
    generatedAt: reportInput.generatedAt,
  };
}

function buildDisasterBulletin(reportInput) {
  const hazardStatus = severeOrWatchByHazard(reportInput).filter(
    (h) => h.affected.length > 0,
  );

  return {
    title: `Disaster Bulletin — ${reportInput.scope}`,
    sections:
      hazardStatus.length > 0
        ? hazardStatus.map((h) => ({
            heading: h.hazard,
            body: `Affected: ${h.affected.join(", ")}.`,
          }))
        : [
            {
              heading: "Status",
              body: "No severe or watch-level hazards currently active in this scope.",
            },
          ],
    generatedAt: reportInput.generatedAt,
  };
}

function buildResourcePlan(reportInput) {
  const ranked = reportInput.vulnerabilityRanking
    .filter((r) => r.available)
    .slice(0, 3);

  return {
    title: `Resource Plan — ${reportInput.scope}`,
    sections: [
      {
        heading: "Priority Panchayats",
        body:
          ranked.length > 0
            ? ranked
                .map(
                  (r) => `${r.panchayat} (vulnerability ${r.value.toFixed(2)})`,
                )
                .join(", ")
            : "No vulnerability ranking data available.",
      },
      {
        heading: "Basis",
        body: "Priority ordering reuses the same climate/soil vulnerability ranking shown elsewhere in the app — relative to these 5 panchayats only, not an absolute allocation formula.",
      },
    ],
    generatedAt: reportInput.generatedAt,
  };
}

function buildVulnerabilitySummary(reportInput) {
  const available = reportInput.vulnerabilityRanking.filter((r) => r.available);

  return {
    title: `Vulnerability Summary — ${reportInput.scope}`,
    sections: [
      {
        heading: "Ranking",
        body:
          available.length > 0
            ? available
                .map((r) => `${r.panchayat}: ${r.value.toFixed(2)}`)
                .join(", ")
            : "No vulnerability data available for this scope.",
      },
      {
        heading: "Interpretation",
        body: "This is a climate/soil exposure proxy only (rainfall variability, soil water capacity, elevation range, soil moisture deficit) — it excludes population and livelihoods, which don't exist anywhere in the underlying data, and the ranking is relative to these 5 panchayats only, not an absolute score.",
      },
    ],
    generatedAt: reportInput.generatedAt,
  };
}

function buildActionChecklist(reportInput) {
  const hazardStatus = severeOrWatchByHazard(reportInput).filter(
    (h) => h.affected.length > 0,
  );
  const sections = [];

  for (const { hazard, affected } of hazardStatus) {
    sections.push({
      heading: `${hazard} — action needed`,
      body: `Review response measures for: ${affected.join(", ")}.`,
    });
  }
  for (const alert of reportInput.alerts) {
    sections.push({
      heading: `${alert.panchayat} — ${alert.type}`,
      body: alert.message,
    });
  }

  if (sections.length === 0) {
    sections.push({
      heading: "Status",
      body: "No actions required at this time — no active alerts or watch/severe hazards.",
    });
  }

  return {
    title: `Action Checklist — ${reportInput.scope}`,
    sections,
    generatedAt: reportInput.generatedAt,
  };
}

function topVulnerabilityText(ranking) {
  const top = ranking.find((r) => r.available);
  return top
    ? `${top.panchayat} currently ranks highest for relative climate/soil vulnerability (${top.value.toFixed(2)}).`
    : "No vulnerability ranking data available.";
}
