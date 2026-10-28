"use client";

import React, { useState, useEffect } from "react";
import {
  Mic,
  MicOff,
  Square,
  RotateCcw,
  Volume2,
  CheckCircle2,
  XCircle,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import {
  useSpeechRecognition,
  comparePronunciation,
  PronunciationResult,
} from "../hooks/useSpeechRecognition";
import { useLanguage } from "../context/LanguageContext";

interface PronunciationCoachProps {
  targetSentence: string;
  lang?: string;
  className?: string;
  compact?: boolean;
  onScoreCalculated?: (score: number) => void;
}

export default function PronunciationCoach({
  targetSentence,
  lang = "en-US",
  className = "",
  compact = false,
  onScoreCalculated,
}: PronunciationCoachProps) {
  const { t } = useLanguage();
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  const {
    startListening,
    stopListening,
    resetTranscript,
    transcript,
    interimTranscript,
    isListening,
    error,
    isSupported,
  } = useSpeechRecognition({
    lang,
    continuous: false,
    interimResults: true,
    onResult: (spokenText) => {
      if (spokenText) {
        const evalResult = comparePronunciation(targetSentence, spokenText);
        setResult(evalResult);
        if (onScoreCalculated) {
          onScoreCalculated(evalResult.score);
        }
      }
    },
    onEnd: () => {
      // If user stopped or speech ended, evaluate with what we have
      setHasStarted(false);
    },
  });

  // Evaluate whenever transcript changes and listening stops
  useEffect(() => {
    if (!isListening && (transcript || interimTranscript)) {
      const textToEval = transcript || interimTranscript;
      if (textToEval) {
        const evalResult = comparePronunciation(targetSentence, textToEval);
        setResult(evalResult);
        if (onScoreCalculated) {
          onScoreCalculated(evalResult.score);
        }
      }
    }
  }, [isListening, transcript, interimTranscript, targetSentence, onScoreCalculated]);

  const handleStart = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setResult(null);
    setHasStarted(true);
    startListening();
  };

  const handleStop = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    stopListening();
    setHasStarted(false);
  };

  const handleReset = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    resetTranscript();
    setResult(null);
    setHasStarted(false);
  };

  const handleListenOriginal = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(targetSentence);
      utterance.lang = lang;
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!isSupported) {
    return (
      <div
        className={`flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>{t("pronunciation_unsupported", "Tarayıcınız ses tanımayı desteklemiyor")}</span>
      </div>
    );
  }

  // Active Listening Mode
  if (isListening || hasStarted) {
    const liveText = transcript || interimTranscript;

    return (
      <div
        className={`w-full p-4 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900/90 to-purple-950/50 border-2 border-indigo-500/60 shadow-xl shadow-indigo-950/40 animate-in fade-in zoom-in-95 duration-200 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Pulsing Microphone Wave Icon */}
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 shadow-inner">
              <span className="absolute -inset-1 rounded-xl bg-rose-500/30 animate-ping opacity-75" />
              <Mic className="w-5 h-5 relative z-10 animate-pulse text-rose-400" />
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                {t("listening_prompt", "Dinleniyor, şimdi konuşun...")}
              </span>
              <span className="text-[11px] text-indigo-300 font-medium">
                {liveText ? `"${liveText}"` : "Cümleyi mikrofona doğru seslendirin"}
              </span>
            </div>
          </div>

          {/* Equalizer Sound Bars */}
          <div className="flex items-center gap-1">
            <div className="w-1 h-5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-1 h-7 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-1 h-4 bg-pink-400 rounded-full animate-bounce" />
            <div className="w-1 h-6 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.2s]" />
          </div>

          {/* Stop / Finish Button */}
          <button
            type="button"
            onClick={handleStop}
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-md shadow-rose-600/30 cursor-pointer active:scale-95"
            title="Konuşmayı Bitir"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>{t("pronunciation_stop", "Bitir")}</span>
          </button>
        </div>

        {error && error !== "no-speech" && (
          <div className="mt-2 text-[11px] text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
            {error}
          </div>
        )}
      </div>
    );
  }

  // Result Mode (Evaluation Completed)
  if (result) {
    const isHighScore = result.score >= 80;
    const isMediumScore = result.score >= 50 && result.score < 80;

    return (
      <div
        className={`w-full p-4 rounded-2xl bg-slate-900/95 border-2 ${
          isHighScore
            ? "border-emerald-500/50 shadow-emerald-950/30"
            : isMediumScore
            ? "border-amber-500/50 shadow-amber-950/30"
            : "border-rose-500/50 shadow-rose-950/30"
        } shadow-2xl animate-in fade-in zoom-in-95 duration-200 space-y-3.5 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Score & Header Bar */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black tracking-wide border shadow-sm flex items-center gap-1.5 ${
                isHighScore
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : isMediumScore
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-rose-500/20 text-rose-300 border-rose-500/40"
              }`}
            >
              {isHighScore ? "🎉" : isMediumScore ? "👍" : "💪"}
              <span>
                {t("pronunciation_score", "Telaffuz Skoru: %{score}", {
                  score: result.score,
                })}
              </span>
            </span>

            <span className="text-[11px] text-slate-400 font-medium">
              ({result.correctWords}/{result.totalWords} kelime doğru)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleListenOriginal}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="Orijinal Telaffuzu Dinle"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleStart}
              className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition cursor-pointer border border-indigo-500/30"
              title="Tekrar Dene"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t("pronunciation_try_again", "Tekrar Dene")}</span>
            </button>
          </div>
        </div>

        {/* Word-by-Word Colored Feedback */}
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">
            Kelime Analizi:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {result.words.map((item, idx) => {
              const isCorrect = item.status === "correct";
              return (
                <span
                  key={idx}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold border transition ${
                    isCorrect
                      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                      : "bg-rose-500/15 text-rose-300 border-rose-500/30 line-through decoration-rose-500/60"
                  }`}
                  title={
                    isCorrect
                      ? "Doğru telaffuz edildi"
                      : "Bu kelime atlandı veya telaffuz algılanamadı"
                  }
                >
                  {isCorrect ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-3 h-3 text-rose-400 shrink-0" />
                  )}
                  <span>{item.raw}</span>
                </span>
              );
            })}
          </div>
        </div>

        {/* Spoken Text Preview */}
        {result.spokenTranscript && (
          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-baseline gap-1.5">
            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
              {t("pronunciation_heard", "Duyulan:")}
            </span>
            <span className="italic text-slate-300">&ldquo;{result.spokenTranscript}&rdquo;</span>
          </div>
        )}
      </div>
    );
  }

  // Idle Button Mode: "[ 🎙️ Telaffuzunu Test Et ]"
  return (
    <div className={`inline-block ${className}`} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={handleStart}
        className={`group relative overflow-hidden flex items-center gap-2 rounded-2xl font-bold transition-all duration-200 cursor-pointer shadow-lg active:scale-95 ${
          compact
            ? "px-3 py-1.5 text-xs bg-gradient-to-r from-indigo-600/30 to-violet-600/30 hover:from-indigo-600/50 hover:to-violet-600/50 border border-indigo-500/40 text-indigo-300 hover:text-white"
            : "px-4 py-2.5 text-xs sm:text-sm bg-gradient-to-r from-indigo-600/25 via-purple-600/25 to-pink-600/25 hover:from-indigo-600/40 hover:via-purple-600/40 hover:to-pink-600/40 border border-indigo-500/40 hover:border-indigo-400/70 text-indigo-200 hover:text-white shadow-indigo-950/50"
        }`}
        title="Mikrofon ile telaffuzunu test et ve anında kelime analizi al"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <span className="relative z-10 flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-500/20 group-hover:bg-indigo-500/30 text-indigo-300 group-hover:text-white transition">
          <Mic className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
        </span>
        <span className="relative z-10 font-bold tracking-tight">
          [ 🎙️ {t("btn_test_pronunciation", "Telaffuzunu Test Et")} ]
        </span>
      </button>
    </div>
  );
}
