"use client";

import { useState, useRef, useCallback } from "react";

// How many milliseconds of silence before we consider the answer complete.
// 4000ms (4s) gives users comfortable time to think between sentences.
const SILENCE_TIMEOUT_MS = 4000;

// Absolute maximum recording time per answer (90 seconds).
const MAX_RECORD_MS = 90_000;

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  // Counts down silence seconds so the UI can show "Submitting in 3…"
  const [silenceCountdown, setSilenceCountdown] = useState<number | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const shouldListenRef = useRef(false);
  const finalTranscriptRef = useRef("");
  const resolveRef = useRef<((val: string) => void) | null>(null);

  // Timers
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ─────────── helpers ─────────── */

  const clearAllTimers = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (maxTimerRef.current) clearTimeout(maxTimerRef.current);
    silenceTimerRef.current = null;
    countdownIntervalRef.current = null;
    maxTimerRef.current = null;
    setSilenceCountdown(null);
  }, []);

  /** Called whenever speech is detected — resets the silence timer. */
  const resetSilenceTimer = useCallback(() => {
    clearAllTimers();

    // Start visual countdown (shows 4 → 3 → 2 → 1 in UI)
    let remaining = Math.round(SILENCE_TIMEOUT_MS / 1000);
    setSilenceCountdown(null); // hide until there is actually a transcript

    // The real silence timeout
    silenceTimerRef.current = setTimeout(() => {
      // Auto-submit whatever has been said
      shouldListenRef.current = false;
      const final = finalTranscriptRef.current.trim();
      try { recognitionRef.current?.stop(); } catch {}
      clearAllTimers();
      setIsListening(false);
      if (resolveRef.current) {
        resolveRef.current(final);
        resolveRef.current = null;
      }
    }, SILENCE_TIMEOUT_MS);

    // Visual countdown — only show once we have some speech
    if (finalTranscriptRef.current.trim()) {
      countdownIntervalRef.current = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          clearInterval(countdownIntervalRef.current!);
          setSilenceCountdown(null);
        } else {
          setSilenceCountdown(remaining);
        }
      }, 1000);
    }
  }, [clearAllTimers]);

  /* ─────────── speak ─────────── */

  const speak = useCallback((text: string, onEnd?: () => void): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);

      // Prefer a Google English voice for clarity
      const voices = window.speechSynthesis.getVoices();
      const preferred =
        voices.find((v) => v.name.toLowerCase().includes("google") && v.lang.startsWith("en")) ||
        voices.find((v) => v.lang.startsWith("en"));
      if (preferred) utterance.voice = preferred;

      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 0.9;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        onEnd?.();
        resolve();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  /* ─────────── startListening ─────────── */

  const startListening = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined") { reject("No window"); return; }

      const SpeechRecognitionAPI =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognitionAPI) { reject("Speech recognition not supported"); return; }

      shouldListenRef.current = true;
      finalTranscriptRef.current = "";
      resolveRef.current = resolve;
      setTranscript("");
      setSilenceCountdown(null);
      setIsListening(true);

      const recognition = new SpeechRecognitionAPI() as SpeechRecognition;
      recognitionRef.current = recognition;

      // continuous + interimResults so we always get partial results quickly
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscriptRef.current += t + " ";
          } else {
            interim = t;
          }
        }
        const display = (finalTranscriptRef.current + interim).trim();
        setTranscript(display);

        // Every time we get ANY speech result, reset the silence countdown
        resetSilenceTimer();
      };

      recognition.onend = () => {
        if (shouldListenRef.current) {
          // Browser ended the session (happens after ~60s or on no-speech).
          // Restart seamlessly so the user isn't cut off.
          try {
            recognition.start();
          } catch {
            // If we can't restart (e.g. already stopped), resolve with what we have
            shouldListenRef.current = false;
            clearAllTimers();
            setIsListening(false);
            if (resolveRef.current) {
              resolveRef.current(finalTranscriptRef.current.trim());
              resolveRef.current = null;
            }
          }
        } else {
          clearAllTimers();
          setIsListening(false);
          if (resolveRef.current) {
            resolveRef.current(finalTranscriptRef.current.trim());
            resolveRef.current = null;
          }
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        // no-speech / audio-capture are transient — let onend handle restart
        if (
          event.error === "no-speech" ||
          event.error === "audio-capture" ||
          event.error === "network"
        ) {
          return;
        }
        console.error("Speech recognition error:", event.error);
        shouldListenRef.current = false;
        clearAllTimers();
        setIsListening(false);
        reject(event.error);
      };

      recognition.start();

      // Absolute max recording time — safety net so an interview never hangs
      maxTimerRef.current = setTimeout(() => {
        shouldListenRef.current = false;
        try { recognition.stop(); } catch {}
        clearAllTimers();
        setIsListening(false);
        if (resolveRef.current) {
          resolveRef.current(finalTranscriptRef.current.trim());
          resolveRef.current = null;
        }
      }, MAX_RECORD_MS);

      // Start the silence timer immediately — if user never speaks within
      // the first SILENCE_TIMEOUT_MS, we'll move on with empty answer.
      resetSilenceTimer();
    });
  }, [resetSilenceTimer, clearAllTimers]);

  /* ─────────── stopListening (manual — "Finish Answer" button) ─────────── */

  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    clearAllTimers();
    try { recognitionRef.current?.stop(); } catch {}
    // onend will fire and call resolveRef
  }, [clearAllTimers]);

  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  return {
    speak,
    stopSpeaking,
    startListening,
    stopListening,
    isSpeaking,
    isListening,
    transcript,
    silenceCountdown,
    isSupported,
  };
}
