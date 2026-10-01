"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";

/**
 * Simulated phone + OTP login for the Farmer role. This is
 * the only role that logs in this way — Scientist/Government roles use
 * the plain role picker on this same page, since they represent staff
 * logging into an admin-style tool rather than a farmer's own phone.
 *
 * Entirely mock: no OTP is actually generated or
 * sent, and any 6-digit code is accepted. `onVerified()` is called once
 * a 6-digit code is submitted.
 */
export function FarmerOtpLogin({ onVerified, onCancel }) {
  const { t } = useTranslation();
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);

  function handleSendCode(event) {
    event.preventDefault();
    if (!phone.trim()) {
      setError(t("farmer.otp.invalidPhone"));
      return;
    }
    setError(null);
    setStep("code");
  }

  function handleVerify(event) {
    event.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setError(t("farmer.otp.invalidCode"));
      return;
    }
    setError(null);
    onVerified();
  }

  if (step === "phone") {
    return (
      <form onSubmit={handleSendCode} className="mt-6 flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs uppercase tracking-wide text-foreground/40">
            {t("farmer.otp.phoneLabel")}
          </span>
          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder={t("farmer.otp.phonePlaceholder")}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm "
          />
        </label>
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
        <Button
          type="submit"
          variant="primary"
          className="rounded-full bg-linear-to-r! from-[#34d399]! to-[#15803d]! px-4 py-2 text-white!"
        >
          {t("farmer.otp.sendCode")}
        </Button>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-medium text-foreground/60 underline underline-offset-4 hover:text-foreground"
        >
          {t("farmer.otp.backToRoles")}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleVerify} className="mt-6 flex flex-col gap-3">
      <p className="text-xs text-foreground/50">
        {t("farmer.otp.codeSentTo", { phone })}
      </p>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs uppercase tracking-wide text-foreground/40">
          {t("farmer.otp.codeLabel")}
        </span>
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
          className="rounded-md border border-border bg-surface px-3 py-2 text-center text-lg tracking-[0.5em] "
        />
      </label>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      <Button
        type="submit"
        variant="primary"
        className="rounded-full bg-linear-to-r! from-[#34d399]! to-[#15803d]! px-4 py-2 text-white!"
      >
        {t("farmer.otp.verify")}
      </Button>
      <button
        type="button"
        onClick={() => setStep("phone")}
        className="text-xs font-medium text-foreground/60 underline underline-offset-4 hover:text-foreground"
      >
        {t("farmer.otp.changeNumber")}
      </button>
    </form>
  );
}
