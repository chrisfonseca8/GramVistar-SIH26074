"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import { useAuditStore } from "@/store/auditStore";
import { defaultPathForRole, REGION_GATED_ROLES } from "@/lib/auth/permissions";
import { useRegionStore } from "@/store/regionStore";
import { FarmerOtpLogin } from "@/components/auth/FarmerOtpLogin";

const ICONS = {
  scientist: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-6 w-6"
    >
      <path
        d="M9 3h6M10 3v5.5L4.8 18a1.5 1.5 0 0 0 1.3 2.2h11.8a1.5 1.5 0 0 0 1.3-2.2L14 8.5V3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M7.5 14.5h9" strokeLinecap="round" />
    </svg>
  ),
  authorities: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-6 w-6"
    >
      <path
        d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6l7-3z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  farmer: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-6 w-6"
    >
      <path
        d="M12 21c4-1 6-4.5 6-9 0-2-.7-4-2-5.5C14.5 8 13 10 12 13c-1-3-2.5-5-4-6.5C6.7 8 6 10 6 12c0 4.5 2 8 6 9z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 13v8" strokeLinecap="round" />
    </svg>
  ),
  bolt: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-4 w-4"
    >
      <path
        d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

const CATEGORIES = [
  { key: "scientist", role: "Scientist / KVK" },
  { key: "authorities", role: "DM/DC" },
  { key: "farmer", role: "Farmer" },
];

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const role = useAuthStore((state) => state.role);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const logEvent = useAuditStore((state) => state.logEvent);
  const resetRegion = useRegionStore((state) => state.resetRegion);
  const regionConfirmed = useRegionStore((state) => state.confirmed);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showFarmerOtp, setShowFarmerOtp] = useState(false);

  function completeLogin(selectedRole) {
    login(selectedRole);
    logEvent({ type: "login", role: selectedRole });
    if (REGION_GATED_ROLES.includes(selectedRole)) {
      resetRegion();
      router.push("/select-region");
      return;
    }
    router.push(defaultPathForRole(selectedRole));
  }

  function handleSelectCategory(categoryKey) {
    setSelectedCategory(categoryKey);
    setShowFarmerOtp(false);
  }

  function resolvedRole() {
    return (
      CATEGORIES.find((category) => category.key === selectedCategory)?.role ??
      null
    );
  }

  function handleProceed() {
    const resolved = resolvedRole();
    if (!resolved) return;
    if (resolved === "Farmer") {
      setShowFarmerOtp(true);
      return;
    }
    completeLogin(resolved);
  }

  function handleLogout() {
    logEvent({ type: "logout", role });
    logout();
  }

  const canProceed = Boolean(resolvedRole());

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-background p-8 ">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="rounded-full border border-border px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-foreground/50 ">
            {t("login.gatewayBadge")}
          </span>
          <h1 className="mt-2 text-xl font-semibold">{t("login.heading")}</h1>
          <p className="max-w-md text-sm text-foreground/60">
            {t("login.subtitle")}
          </p>
        </div>

        {!hasHydrated ? (
          <p
            className="mt-8 text-center text-sm text-foreground/50"
            role="status"
          >
            {t("common.loading")}
          </p>
        ) : role ? (
          <div className="mx-auto mt-8 flex max-w-sm flex-col gap-3">
            <p className="text-sm">{t("login.currentlyLoggedIn", { role })}</p>
            <Link
              href={
                REGION_GATED_ROLES.includes(role) && !regionConfirmed
                  ? "/select-region"
                  : defaultPathForRole(role)
              }
              className="rounded-full bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              {t("login.continue")}
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-border px-4 py-2 text-sm font-medium transition hover:border-border-hover "
            >
              {t("common.logout")}
            </button>
          </div>
        ) : showFarmerOtp ? (
          <div className="mx-auto mt-8 max-w-sm">
            <FarmerOtpLogin
              onVerified={() => completeLogin("Farmer")}
              onCancel={() => setShowFarmerOtp(false)}
            />
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {CATEGORIES.map((category) => {
                const isActive = selectedCategory === category.key;
                return (
                  <button
                    key={category.key}
                    type="button"
                    onClick={() => handleSelectCategory(category.key)}
                    aria-pressed={isActive}
                    className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition ${
                      isActive
                        ? "border-foreground bg-primary/5"
                        : "border-border hover:border-border-hover "
                    }`}
                  >
                    <span className="text-foreground/70">
                      {ICONS[category.key]}
                    </span>
                    <span className="text-sm font-semibold">
                      {t(`login.roles.${category.key}.title`)}
                    </span>
                    <span className="text-xs font-medium uppercase tracking-wide text-foreground/40">
                      {t(`login.roles.${category.key}.subtitle`)}
                    </span>
                    <span className="text-xs text-foreground/60">
                      {t(`login.roles.${category.key}.description`)}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleProceed}
              disabled={!canProceed}
              className="mt-6 w-full rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("login.proceed")}
            </button>

            <div className="mt-4 flex items-center justify-center gap-2 border-t border-border pt-4 ">
              <span className="text-foreground/40">{ICONS.bolt}</span>
              <button
                type="button"
                onClick={() => completeLogin("Super Admin")}
                className="text-xs font-medium text-foreground/60 underline underline-offset-4 hover:text-foreground"
              >
                {t("login.instantEntry")}
              </button>
            </div>
          </>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-block text-sm font-medium underline underline-offset-4"
          >
            {t("login.backHome")}
          </Link>
        </div>
      </div>
    </main>
  );
}
