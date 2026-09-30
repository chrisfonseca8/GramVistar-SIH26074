"use client";

import { useTranslation } from "react-i18next";

/** Generic error placeholder for a failed data-dependent feature. */
export function ErrorState({ title, description }) {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t("common.somethingWrong");

  return (
    <div
      className="flex flex-col items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-6 py-10 text-center"
      role="alert"
    >
      <p className="text-sm font-medium text-red-700">{resolvedTitle}</p>
      {description ? (
        <p className="text-sm text-red-600/80">{description}</p>
      ) : null}
    </div>
  );
}
