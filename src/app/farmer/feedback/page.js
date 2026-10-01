"use client";

import { useTranslation } from "react-i18next";
import { FeedbackPanel } from "@/components/farmer/FeedbackPanel";

export default function FarmerFeedbackPage() {
  const { t } = useTranslation();

  return (
    <main className="flex-1 space-y-6 px-6 py-8">
      <h1 className="text-xl font-semibold">{t("farmer.feedback.title")}</h1>
      <FeedbackPanel />
    </main>
  );
}
