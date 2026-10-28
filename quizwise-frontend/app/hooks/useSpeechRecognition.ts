"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// Web Speech API TypeScript type declarations
interface SpeechRecognitionEventLike extends Event {
  results: {
    length: number;
    item(index: number): {
      isFinal: boolean;
      length: number;
      item(index: number): {
        transcript: string;
        confidence: number;
      };
      [index: number]: {
        transcript: string;
        confidence: number;
      };
    };
    [index: number]: {
      isFinal: boolean;
      length: number;
      item(index: number): {
        transcript: string;
        confidence: number;
      };
      [index: number]: {
        transcript: string;
        confidence: number;
      };
    };
  };
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
  message?: string;
}

export interface UseSpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

export interface UseSpeechRecognitionReturn {
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  transcript: string;
  interimTranscript: string;
  isListening: boolean;
  error: string | null;
  isSupported: boolean;
}

export function useSpeechRecognition({
  lang = "en-US",
  continuous = false,
  interimResults = true,
  onResult,
  onError,
  onEnd,
}: UseSpeechRecognitionOptions = {}): UseSpeechRecognitionReturn {
  const [transcript, setTranscript] = useState<string>("");
  const [interimTranscript, setInterimTranscript] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);

  // Check browser support on client
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      setIsSupported(Boolean(SpeechRecognition));
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore error on abort
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
    setError(null);
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListeningRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    isListeningRef.current = false;
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    // Stop existing instance if running
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }

    resetTranscript();
    setError(null);

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang || "en-US";
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        isListeningRef.current = true;
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        let finalTranscript = "";
        let currentInterim = "";

        for (let i = 0; i < event.results.length; ++i) {
          const result = event.results[i];
          const text = result[0]?.transcript || "";
          if (result.isFinal) {
            finalTranscript += (finalTranscript ? " " : "") + text;
          } else {
            currentInterim += (currentInterim ? " " : "") + text;
          }
        }

        const fullTranscript = finalTranscript.trim() || currentInterim.trim();

        if (finalTranscript) {
          setTranscript(finalTranscript.trim());
          setInterimTranscript("");
          if (onResult) onResult(finalTranscript.trim());
        } else {
          setInterimTranscript(currentInterim.trim());
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
        // 'no-speech' happens when user stays silent, handle gracefully
        if (event.error === "no-speech") {
          setError("no-speech");
        } else if (event.error === "not-allowed") {
          setError("Microphone permission was denied.");
        } else {
          setError(`Recognition error: ${event.error}`);
        }

        if (onError) onError(event.error);
      };

      recognition.onend = () => {
        isListeningRef.current = false;
        setIsListening(false);
        if (onEnd) onEnd();
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error("Speech recognition start failed:", err);
      setError(err?.message || "Failed to start speech recognition.");
      setIsListening(false);
      isListeningRef.current = false;
    }
  }, [lang, continuous, interimResults, resetTranscript, onResult, onError, onEnd]);

  return {
    startListening,
    stopListening,
    resetTranscript,
    transcript,
    interimTranscript,
    isListening,
    error,
    isSupported,
  };
}

// ---------------------------------------------------------------------
// TELAFFUZ KARŞILAŞTIRMA MANTIĞI & SKORLAMA (Pronunciation Evaluation)
// ---------------------------------------------------------------------

export interface WordMatch {
  raw: string;
  clean: string;
  status: "correct" | "missed";
}

export interface PronunciationResult {
  words: WordMatch[];
  score: number; // 0 - 100
  totalWords: number;
  correctWords: number;
  spokenTranscript: string;
}

/**
 * Normalizes a word by converting to lowercase and stripping punctuation & apostrophes
 */
export function normalizeWord(word: string): string {
  if (!word) return "";
  return word
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[.,!?;:"()\[\]{}—–\-_/\\<>@#$%^&*+=`~|]/g, "")
    .trim();
}

/**
 * Levenshtein distance for fuzzy matching phonetically close words
 */
function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const row = Array.from({ length: a.length + 1 }, (_, i) => i);

  for (let i = 1; i <= b.length; i++) {
    let prev = i;
    for (let j = 1; j <= a.length; j++) {
      const val =
        b[i - 1] === a[j - 1]
          ? row[j - 1]
          : Math.min(row[j - 1], prev, row[j]) + 1;
      row[j - 1] = prev;
      prev = val;
    }
    row[a.length] = prev;
  }

  return row[a.length];
}

/**
 * Compares spoken text against a target sentence word-by-word.
 * Labels matching words as 'correct' (green) and missed/deviated words as 'missed' (red).
 * Returns overall accuracy percentage score (0-100%).
 */
export function comparePronunciation(
  targetSentence: string,
  spokenText: string
): PronunciationResult {
  if (!targetSentence || !targetSentence.trim()) {
    return {
      words: [],
      score: 100,
      totalWords: 0,
      correctWords: 0,
      spokenTranscript: spokenText || "",
    };
  }

  // Tokenize original sentence by whitespace while preserving punctuation for display
  const rawTargetWords = targetSentence.trim().split(/\s+/);
  const targetWords = rawTargetWords
    .map((raw) => ({
      raw,
      clean: normalizeWord(raw),
    }))
    .filter((w) => w.clean.length > 0);

  // Tokenize spoken text
  const spokenWords = (spokenText || "")
    .trim()
    .split(/\s+/)
    .map(normalizeWord)
    .filter((w) => w.length > 0);

  if (targetWords.length === 0) {
    return {
      words: [],
      score: 100,
      totalWords: 0,
      correctWords: 0,
      spokenTranscript: spokenText || "",
    };
  }

  if (spokenWords.length === 0) {
    return {
      words: targetWords.map((item) => ({
        raw: item.raw,
        clean: item.clean,
        status: "missed" as const,
      })),
      score: 0,
      totalWords: targetWords.length,
      correctWords: 0,
      spokenTranscript: "",
    };
  }

  const matchedTargetIndices = new Set<number>();
  let spokenCursor = 0;

  for (let t = 0; t < targetWords.length; t++) {
    const targetClean = targetWords[t].clean;

    // 1. Check exact match in immediate upcoming spoken window (0 to +3 words)
    let matchedSpokenIdx = -1;
    for (
      let s = spokenCursor;
      s < Math.min(spokenCursor + 4, spokenWords.length);
      s++
    ) {
      if (spokenWords[s] === targetClean) {
        matchedSpokenIdx = s;
        break;
      }
    }

    // 2. Fuzzy match (Levenshtein distance <= 1 for close pronunciations, e.g., plural/tense)
    if (matchedSpokenIdx === -1 && spokenCursor < spokenWords.length) {
      for (
        let s = spokenCursor;
        s < Math.min(spokenCursor + 3, spokenWords.length);
        s++
      ) {
        const sw = spokenWords[s];
        if (
          Math.abs(sw.length - targetClean.length) <= 1 &&
          levenshteinDistance(sw, targetClean) <= 1
        ) {
          matchedSpokenIdx = s;
          break;
        }
      }
    }

    // 3. Fallback: Check anywhere in remaining spoken words
    if (matchedSpokenIdx === -1) {
      const anyIndex = spokenWords.indexOf(targetClean, spokenCursor);
      if (anyIndex !== -1) {
        matchedSpokenIdx = anyIndex;
      }
    }

    if (matchedSpokenIdx !== -1) {
      matchedTargetIndices.add(t);
      spokenCursor = matchedSpokenIdx + 1;
    }
  }

  const words: WordMatch[] = targetWords.map((item, idx) => ({
    raw: item.raw,
    clean: item.clean,
    status: matchedTargetIndices.has(idx) ? "correct" : "missed",
  }));

  const correctWords = matchedTargetIndices.size;
  const totalWords = targetWords.length;
  const score = totalWords > 0 ? Math.round((correctWords / totalWords) * 100) : 100;

  return {
    words,
    score,
    totalWords,
    correctWords,
    spokenTranscript: spokenText,
  };
}
