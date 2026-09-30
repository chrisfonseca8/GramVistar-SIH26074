"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";

const MAX_SECONDS = 30;

function isRecordingSupported() {
  return (
    typeof window !== "undefined" &&
    "MediaRecorder" in window &&
    Boolean(navigator.mediaDevices?.getUserMedia)
  );
}

/**
 * Optional voice-note recording for farmer feedback, via
 * the browser's native `MediaRecorder` — no server upload, no external
 * transcription service. Recordings are capped at 30 seconds and stored
 * as a base64 data URL (small enough to fit comfortably in
 * `localStorage`'s per-origin quota, unlike an uncapped recording).
 *
 * Feature-detects support rather than assuming it: if `MediaRecorder` or
 * `getUserMedia` isn't available, this renders an explicit "not
 * supported" note instead of a non-functional button — no dead controls,
 * only offering the feature where it's actually supported.
 *
 * @param {{ value: string|null, onChange: (dataUrl: string|null) => void }} props
 */
export function VoiceNoteRecorder({ value, onChange }) {
  const { t } = useTranslation();
  const [supported] = useState(() => isRecordingSupported());
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      mediaRecorderRef.current?.stream
        ?.getTracks()
        .forEach((track) => track.stop());
    };
  }, []);

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        const reader = new FileReader();
        reader.onloadend = () => onChange(reader.result);
        reader.readAsDataURL(blob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev + 1 >= MAX_SECONDS) {
            stopRecording();
            return MAX_SECONDS;
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
      setError(t("farmer.feedback.voiceNote.permissionDenied"));
    }
  }

  function stopRecording() {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  if (!supported) {
    return (
      <p className="text-xs text-foreground/40">
        {t("farmer.feedback.voiceNote.unsupported")}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {recording ? (
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={stopRecording}
          >
            {t("farmer.feedback.voiceNote.stopWithSeconds", { seconds })}
          </Button>
        ) : (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={startRecording}
          >
            {value
              ? t("farmer.feedback.voiceNote.reRecord")
              : t("farmer.feedback.voiceNote.record")}
          </Button>
        )}
        {value && !recording ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(null)}
          >
            {t("farmer.feedback.voiceNote.remove")}
          </Button>
        ) : null}
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      {value && !recording ? (
        <audio controls src={value} className="h-8 w-full max-w-xs" />
      ) : null}
    </div>
  );
}
