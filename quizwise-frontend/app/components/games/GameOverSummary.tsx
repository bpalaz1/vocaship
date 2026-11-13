"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  Trophy,
  RotateCcw,
  Sparkles,
  Flame,
  Home,
  Volume2,
  CheckCircle2,
  BookmarkCheck,
  AlertCircle,
  Coins,
} from "lucide-react";
import { awardGamificationReward } from "../../utils/gamificationEngine";
import { saveArenaMistake } from "../../utils/arenaMistakes";

export interface GameMistakeItem {
  word: string;
  meaning: string;
  phonetic?: string;
}

export interface GameOverSummaryProps {
  gameTitle: string;
  deckTitle?: string;
  score: number;
  timeSeconds?: number;
  accuracyPercent?: number;
  awardedXP: number;
  awardedGold?: number;
  streakCount?: number;
  mistakes?: GameMistakeItem[];
  onPlayAgain: () => void;
  onBackToArena: () => void;
  onViewPodium?: () => void;
}

export default function GameOverSummary({
  gameTitle,
  deckTitle,
  score,
  timeSeconds = 0,
  accuracyPercent = 100,
  awardedXP,
  awardedGold = 0,
  streakCount = 0,
  mistakes = [],
  onPlayAgain,
  onBackToArena,
  onViewPodium,
}: GameOverSummaryProps) {
  // Telafi edilmiş kelimeler (kelime -> boolean)
  const [compensatedWords, setCompensatedWords] = useState<Record<string, boolean>>({});
  const [activeSpeakingWord, setActiveSpeakingWord] = useState<string | null>(null);

  // Oyun sonu yanlışları (en fazla 3 kelime)
  const reviewMistakes = mistakes.slice(0, 3);

  useEffect(() => {
    // 1. Kutlama Konfetisi
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}

    // 2. XP & Altın Ödülünü Kaydet
    awardGamificationReward(awardedXP, awardedGold, `🎮 ${gameTitle}`);

    // 3. Hataları otomatik olarak "🎯 Oyun Hatalarım" destesine ekle
    if (mistakes.length > 0) {
      mistakes.forEach((m) => {
        saveArenaMistake({
          word: m.word,
          meaning: m.meaning,
          phonetic: m.phonetic,
          gameType: gameTitle,
        });
      });
    }
  }, [gameTitle, score, awardedXP, awardedGold]);

  // Web Speech API Sesli Telaffuz ve Telafi Altını Teslimi
  const handleListenAndCompensate = (item: GameMistakeItem) => {
    const wordKey = item.word.toLowerCase();
    setActiveSpeakingWord(wordKey);

    // Telaffuz Oynat
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(item.word);
        utterance.lang = "en-US";
        utterance.rate = 0.85;
        utterance.onend = () => setActiveSpeakingWord(null);
        utterance.onerror = () => setActiveSpeakingWord(null);
        window.speechSynthesis.speak(utterance);
      } catch {
        setActiveSpeakingWord(null);
      }
    } else {
      setTimeout(() => setActiveSpeakingWord(null), 500);
    }

    // Henüz telafi edilmediyse +15 Telafi Altını ver
    if (!compensatedWords[wordKey]) {
      setCompensatedWords((prev) => ({ ...prev, [wordKey]: true }));
      awardGamificationReward(0, 15, `🎯 Telafi: ${item.word}`);
      saveArenaMistake({
        word: item.word,
        meaning: item.meaning,
        phonetic: item.phonetic,
        gameType: `${gameTitle}_compensated`,
      });
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins > 0 ? `${mins}dk ` : ""}${rem}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border-2 border-indigo-500/40 p-5 sm:p-7 shadow-2xl shadow-indigo-950/70 text-center space-y-5 animate-in zoom-in-95 duration-200 relative overflow-hidden my-auto">
        {/* Arka plan ışıltısı */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Kupa İkonu */}
        <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-500 flex items-center justify-center text-slate-950 shadow-xl shadow-amber-400/30">
          <Trophy className="w-8 h-8 sm:w-10 sm:h-10 animate-bounce" />
          <div className="absolute -top-1 -right-1 p-1 bg-indigo-600 rounded-full text-white text-xs">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </div>
        </div>

        {/* Başlık & Tebrik */}
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Harika Performans!
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-medium truncate">
            {gameTitle} {deckTitle ? `• ${deckTitle}` : ""}
          </p>
        </div>

        {/* İstatistikler Izgarası */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Toplam Skor</span>
            <span className="text-base sm:text-lg font-black text-white font-mono">{score}</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Kazanılan XP</span>
            <span className="text-base sm:text-lg font-black text-indigo-400 font-mono">+{awardedXP}</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Altın</span>
            <span className="text-base sm:text-lg font-black text-amber-400 font-mono">+{awardedGold} 🪙</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Süre / Başarı</span>
            <span className="text-xs sm:text-sm font-bold text-emerald-400 font-mono">
              {timeSeconds > 0 ? formatTime(timeSeconds) : `%${accuracyPercent}`}
            </span>
          </div>
        </div>

        {/* Seri Bonusu Rozeti */}
        {streakCount > 0 && (
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center gap-2 text-xs font-bold text-amber-300">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>{streakCount}x Seri Çarpanı Uygulandı!</span>
          </div>
        )}

        {/* ======================================================================= */}
        {/* 5 SANİYELİK HATA TELAFİSİ KARTLARI (EN FAZLA 3 KELİME)                  */}
        {/* ======================================================================= */}
        {reviewMistakes.length > 0 && (
          <div className="p-3 sm:p-4 rounded-2xl bg-slate-950/90 border border-amber-500/30 text-left space-y-2.5">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>🎯 5 Saniyelik Hata Telafisi</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold">
                Her Dinlemede +15 🪙
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-snug">
              Bu turda takıldığın kelimeleri dinle; hem telaffuzunu pekiştir hem de anında telafi altını kazan!
            </p>

            <div className="space-y-1.5 pt-1">
              {reviewMistakes.map((m) => {
                const wordKey = m.word.toLowerCase();
                const isCompensated = Boolean(compensatedWords[wordKey]);
                const isSpeaking = activeSpeakingWord === wordKey;

                return (
                  <div
                    key={m.word}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2 transition hover:border-slate-700"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-black text-white font-mono">
                          {m.word}
                        </span>
                        {m.phonetic && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            {m.phonetic}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-300 truncate">
                        {m.meaning}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleListenAndCompensate(m)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
                        isCompensated
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm active:scale-95"
                      }`}
                    >
                      {isCompensated ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>+15 🪙 Alındı</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? "animate-pulse text-amber-300" : ""}`} />
                          <span>Dinle & +15 🪙</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span className="flex items-center gap-1">
                <BookmarkCheck className="w-3 h-3 text-indigo-400" />
                <span>"🎯 Oyun Hatalarım" destesine kaydedildi</span>
              </span>
            </div>
          </div>
        )}

        {/* Eylem Butonları: Tekrar Oyna & Arenaya Dön */}
        <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/80">
          {onViewPodium && (
            <button
              type="button"
              onClick={onViewPodium}
              className="w-full py-2.5 sm:py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition active:scale-95 cursor-pointer"
            >
              <Trophy className="w-4 h-4 fill-current" />
              <span>🏆 Sınıf Podyumunu & Ödülleri Gör</span>
            </button>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            <button
              type="button"
              onClick={onPlayAgain}
              className="w-full sm:w-auto flex-1 py-2.5 sm:py-3 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Tekrar Oyna</span>
            </button>

            <button
              type="button"
              onClick={onBackToArena}
              className="w-full sm:w-auto flex-1 py-2.5 sm:py-3 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-700 transition active:scale-95 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Arenaya Dön</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

