"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";

function isSpeechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * Voice-first farmer UI — reads the given text aloud via
 * the browser's native Web Speech API (`speechSynthesis`), no external
 * service or new dependency. Feature-detected rather than assumed: if
 * unsupported, renders nothing — no dead controls — rather
 * than a button that silently does nothing when pressed.
 *
 * @param {{ text: string, lang?: string }} props
 */
export function ReadAloudButton({ text, lang = "en-IN" }) {
  const { t } = useTranslation();
  const [supported] = useState(() => isSpeechSupported());
  const [speaking, setSpeaking] = useState(false);

  if (!supported || !text) return null;

  function handleToggle() {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  }

  return (
    <Button type="button" variant="ghost" size="sm" onClick={handleToggle}>
      {speaking ? t("farmer.readAloud.stop") : t("farmer.readAloud.play")}
    </Button>
  );
}
