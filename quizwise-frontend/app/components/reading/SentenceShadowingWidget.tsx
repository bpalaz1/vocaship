"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  RotateCcw,
  Sparkles,
  Trophy,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
  VolumeX,
  ChevronRight,
  Headphones,
} from "lucide-react";
import {
  evaluatePronunciation,
  PronunciationResult,
  WordAccuracy,
  cleanToken,
} from "../../utils/pronunciationMatcher";

export interface SentenceShadowingWidgetProps {
  sentence: string;
  sentenceIndex?: number;
  totalSentences?: number;
  isOpen?: boolean;
  onClose?: () => void;
  onNextSentence?: () => void;
  onScoreEarned?: (xp: number, score: number) => void;
}

export default function SentenceShadowingWidget({
  sentence,
  sentenceIndex,
  totalSentences,
  isOpen = true,
  onClose,
  onNextSentence,
  onScoreEarned,
}: SentenceShadowingWidgetProps) {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [interimText, setInterimText] = useState<string>("");
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [activeSpeakingWord, setActiveSpeakingWord] = useState<string | null>(null);
  const [isModelSpeaking, setIsModelSpeaking] = useState<boolean>(false);
  const [hasAwardedXP, setHasAwardedXP] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);

  // Cümle değiştiğinde önceki sonucu sıfırla
  useEffect(() => {
    setResult(null);
    setInterimText("");
    setIsRecording(false);
    setHasAwardedXP(false);
  }, [sentence]);

  // 1. WEB SPEECH API (SESLİ OKUMA & TEK KELİME SESLENDİRME)
  const speakWordSlowly = useCallback((word: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const cleaned = cleanToken(word);
      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.lang = "en-US";
      utterance.rate = 0.7; // Yavaş ve net telaffuz (rate: 0.7)
      utterance.pitch = 1.0;

      setActiveSpeakingWord(cleaned);
      utterance.onend = () => setActiveSpeakingWord(null);
      utterance.onerror = () => setActiveSpeakingWord(null);

      window.speechSynthesis.speak(utterance);
    } catch {}
  }, []);

  const speakFullSentence = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.lang = "en-US";
      utterance.rate = 0.85; // Net model okuma hızı

      setIsModelSpeaking(true);
      utterance.onend = () => setIsModelSpeaking(false);
      utterance.onerror = () => setIsModelSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch {}
  }, [sentence]);

  // 2. SPEECH RECOGNITION (SES TANIMA & GÖLGELEME MOTORU)
  const handleStartRecording = useCallback(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      window.speechSynthesis?.cancel();
      setIsModelSpeaking(false);
      setActiveSpeakingWord(null);

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
        setInterimText("");
        setResult(null);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = "";
        let finalSpoken = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptPiece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalSpoken += transcriptPiece + " ";
          } else {
            currentInterim += transcriptPiece;
          }
        }

        const effectiveText = (finalSpoken || currentInterim).trim();
        setInterimText(effectiveText);

        if (finalSpoken.trim().length > 0) {
          const evalResult = evaluatePronunciation(sentence, effectiveText);
          setResult(evalResult);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("[SpeechRecognition Error]:", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn("SpeechRecognition start error:", err);
      setIsRecording(false);
    }
  }, [sentence]);

  const handleStopRecording = useCallback(() => {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setIsRecording(false);
      }
    } catch {}
  }, []);

  // Simülasyon testi (mikrofonsuz cihazlar için)
  const handleSimulateSentence = useCallback(
    (spokenVariation: string) => {
      const evalResult = evaluatePronunciation(sentence, spokenVariation);
      setResult(evalResult);
      setInterimText(spokenVariation);
    },
    [sentence]
  );

  // Skor kazanımı ve XP tetikleyicisi
  useEffect(() => {
    if (result && !hasAwardedXP && result.xpBonus > 0 && onScoreEarned) {
      setHasAwardedXP(true);
      onScoreEarned(result.xpBonus, result.overallScore);
    }
  }, [result, hasAwardedXP, onScoreEarned]);

  if (!isOpen) return null;

  // Henüz sonuç çıkmadıysa cümlenin ham token'larını hazırla
  const rawTokens = sentence.trim().split(/\s+/).filter(Boolean);

  return (
    <div
      role="region"
      aria-label="Mikro Telaffuz ve Gölgeleme Penceresi"
      className="fixed inset-x-0 bottom-0 sm:bottom-6 sm:inset-x-auto sm:right-6 sm:left-auto z-50 w-full sm:w-[540px] max-w-full p-4 sm:p-0 animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      <div className="bg-slate-950/95 border border-indigo-500/30 rounded-3xl p-5 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10 text-slate-100 flex flex-col space-y-4">
        {/* ============================================================== */}
        {/* ÜST BAŞLIK VE KONTROLLER                                       */}
        {/* ============================================================== */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-600/30">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-black text-white tracking-tight">
                  Mikro Telaffuz & Gölgeleme (Shadowing)
                </h3>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  AI COACH
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Cümleyi sesli oku; kelime kelime anlık doğruluk rengini gör.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {typeof sentenceIndex === "number" && typeof totalSentences === "number" && (
              <span className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
                {sentenceIndex + 1}/{totalSentences}
              </span>
            )}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Pencereyi Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tarayıcı API Desteği Uyarısı */}
        {!isSupported && (
          <div className="p-3 rounded-2xl bg-amber-950/70 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Tarayıcınızda SpeechRecognition mikrofon desteği bulunamadı.</span>
            </div>
            <button
              type="button"
              onClick={() => handleSimulateSentence(sentence)}
              className="px-2.5 py-1 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold shrink-0 hover:bg-amber-400 cursor-pointer"
            >
              Simüle Et
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* KELİME KELİME ETKİLEŞİMLİ CÜMLE ALANI                           */}
        {/* ============================================================== */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-inner space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span>Hedef Cümle</span>
              {result && (
                <span className="text-[10px] text-slate-500 font-normal lowercase">
                  (Kırmızı/sarı kelimelere tıklayarak yavaşça dinleyin)
                </span>
              )}
            </span>

            {/* Orijinal Cümleyi Dinle Butonu */}
            <button
              type="button"
              onClick={speakFullSentence}
              disabled={isModelSpeaking}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                isModelSpeaking
                  ? "bg-indigo-600 text-white animate-pulse"
                  : "bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700/80"
              }`}
              title="Model Telaffuzu Dinle"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{isModelSpeaking ? "Okunuyor..." : "Modeli Dinle"}</span>
            </button>
          </div>

          {/* Kelimelerin Yan Yana Dizilimi ve Renkleri */}
          <div className="flex flex-wrap gap-1.5 items-center leading-relaxed">
            {result ? (
              result.words.map((wObj, idx) => {
                const isCorrect = wObj.status === "correct";
                const isNear = wObj.status === "near";
                const isIncorrect = wObj.status === "incorrect";
                const isCurrentlySpeaking = activeSpeakingWord === wObj.cleanWord;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => speakWordSlowly(wObj.word)}
                    title={`Doğruluk: %${wObj.score}${
                      wObj.spokenWord ? ` (Söylenen: "${wObj.spokenWord}")` : ""
                    } - Tıkla: Yavaş telaffuzu dinle (0.7x)`}
                    className={`group relative px-2.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer flex items-center gap-1 shadow-sm active:scale-95 ${
                      isCorrect
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 shadow-emerald-950/20"
                        : isNear
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 shadow-amber-950/20"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 shadow-rose-950/20 animate-pulse"
                    } ${isCurrentlySpeaking ? "ring-2 ring-indigo-400 scale-105" : ""}`}
                  >
                    <span>{wObj.word}</span>
                    <Volume2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </button>
                );
              })
            ) : (
              rawTokens.map((rawWord, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 rounded-xl bg-slate-800/60 text-slate-200 border border-slate-700/60 text-xs sm:text-sm font-medium"
                >
                  {rawWord}
                </span>
              ))
            )}
          </div>

          {/* Konuşma Sırasında Anlık Canlı Metin Göstergesi */}
          {isRecording && (
            <div className="pt-2 border-t border-slate-800 flex items-center gap-2 text-xs text-amber-300">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              <span className="font-semibold italic truncate">
                {interimText || "Dinleniyor... Cümleyi mikrofonunuza sesli okuyun."}
              </span>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* SKOR VE ROZET ALANI (DEĞERLENDİRME BİTTİĞİNDE)                  */}
        {/* ============================================================== */}
        {result && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-black text-sm border shadow-lg ${
                  result.overallScore >= 85
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-emerald-900/30"
                    : result.overallScore >= 60
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-amber-900/30"
                    : "bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-rose-900/30"
                }`}
              >
                <span>%{result.overallScore}</span>
                <span className="text-[9px] font-mono uppercase font-bold">Skor</span>
              </div>

              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                  <span>{result.badge}</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  {result.correctCount} / {result.totalCount} kelime tam doğrulukla telaffuz edildi.
                </p>
              </div>
            </div>

            {/* Sonraki Cümleye Geç (Varsa) */}
            {onNextSentence && (
              <button
                type="button"
                onClick={onNextSentence}
                className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1 shadow-md shadow-indigo-600/30 shrink-0"
              >
                <span>Sonraki</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* ALT KONTROL PANELİ & MİKROFON BUTONU                           */}
        {/* ============================================================== */}
        <div className="flex items-center justify-between gap-3 pt-1">
          {/* Sol: Tekrar Sıfırla / Dene */}
          <button
            type="button"
            onClick={() => {
              setResult(null);
              setInterimText("");
            }}
            disabled={!result && !interimText}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Sıfırla</span>
          </button>

          {/* Merkez: Büyük Ses Dalgalı Mikrofon Butonu */}
          <div className="flex items-center gap-2">
            {isRecording ? (
              <button
                type="button"
                onClick={handleStopRecording}
                className="relative px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 text-white font-black text-xs sm:text-sm shadow-xl shadow-rose-900/50 flex items-center gap-2.5 animate-pulse cursor-pointer"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
                <MicOff className="w-4 h-4" />
                <span>Kaydı Bitir</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartRecording}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-indigo-600/30 ring-1 ring-white/20 active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer"
              >
                <Mic className="w-4 h-4" />
                <span>{result ? "Tekrar Oku & Test Et" : "Sesli Oku (Konuş)"}</span>
              </button>
            )}
          </div>

          {/* Sağ: Renk Rehberi İpucu */}
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>≥%85</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>%60-84</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              <span>&lt;%60</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

