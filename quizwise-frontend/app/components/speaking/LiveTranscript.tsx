"use client";

import React, { useEffect, useState } from "react";

export interface LiveTranscriptProps {
  text: string;
  isSpeaking: boolean;
  activeWordIndex?: number | null;
  isKidsMode?: boolean;
  rate?: number;
  className?: string;
}

export default function LiveTranscript({
  text,
  isSpeaking,
  activeWordIndex = null,
  isKidsMode = false,
  rate = 0.86,
  className = "",
}: LiveTranscriptProps) {
  const cleanText = text
    .replace(/^\[.*?\]:\s*/, "")
    .replace(/^AI Mentor:\s*/i, "")
    .trim();

  const words = cleanText ? cleanText.split(/\s+/) : [];
  const [fallbackWordIdx, setFallbackWordIdx] = useState<number>(0);

  // Eğer tarayıcı nöral sesi onboundary olayı göndermezse kelime hızına göre senkron ilerletici
  useEffect(() => {
    if (!isSpeaking || words.length === 0) {
      setFallbackWordIdx(0);
      return;
    }

    setFallbackWordIdx(0);
    // 0.78x hızda ~385ms/kelime, 0.88x hızda ~340ms/kelime
    const msPerWord = Math.round(300 / Math.max(0.65, rate));

    const timer = setInterval(() => {
      setFallbackWordIdx((prev) => {
        if (prev < words.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, msPerWord);

    return () => {
      clearInterval(timer);
    };
  }, [isSpeaking, cleanText, rate, words.length]);

  const effectiveWordIndex =
    isSpeaking
      ? activeWordIndex !== null && activeWordIndex >= 0
        ? Math.min(activeWordIndex, words.length - 1)
        : fallbackWordIdx
      : -1;

  if (words.length === 0) {
    return null;
  }

  return (
    <p
      data-testid="live-word-transcript"
      className={`w-full flex-1 pr-4 text-xs sm:text-sm leading-relaxed font-medium flex flex-wrap items-baseline gap-x-1.5 gap-y-1 ${className}`}
    >
      {words.map((word, idx) => {
        if (!isSpeaking) {
          return (
            <span key={idx} className="text-slate-100 transition-colors duration-100">
              {word}
            </span>
          );
        }

        const isCurrent = idx === effectiveWordIndex;
        const isSpoken = idx < effectiveWordIndex;

        if (isCurrent) {
          return (
            <span
              key={idx}
              data-testid="live-active-word"
              className="inline-block px-1 py-0.5 rounded-md transition-all duration-150 text-amber-400 font-bold scale-110 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)] bg-amber-500/15"
            >
              {word}
            </span>
          );
        }

        if (isSpoken) {
          return (
            <span
              key={idx}
              className="inline-block text-white transition-all duration-150"
            >
              {word}
            </span>
          );
        }

        return (
          <span
            key={idx}
            className="inline-block text-slate-500 opacity-75 transition-all duration-150"
          >
            {word}
          </span>
        );
      })}
    </p>
  );
}

