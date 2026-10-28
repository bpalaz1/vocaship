"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import {
  Trophy,
  RotateCcw,
  ArrowRight,
  Zap,
  Coins,
  Clock,
  CheckCircle2,
  Sparkles,
  Flame,
  Home
} from "lucide-react";
import { API_BASE } from "../../config";

export interface GameOverScreenProps {
  gameTitle: string;
  deckTitle?: string;
  score: number;
  timeSeconds?: number;
  accuracyPercent?: number;
  awardedXP: number;
  awardedGold?: number;
  streakCount?: number;
  onPlayAgain: () => void;
  onBackToArena: () => void;
}

export default function GameOverScreen({
  gameTitle,
  deckTitle,
  score,
  timeSeconds = 0,
  accuracyPercent = 100,
  awardedXP,
  awardedGold = 0,
  streakCount = 0,
  onPlayAgain,
  onBackToArena,
}: GameOverScreenProps) {
  // Patlama ve XP Kaydı
  useEffect(() => {
    // 1. Kutlama Konfetisi
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    // 2. XP & Altın Ödülünü Kaydet
    const awardGamification = async () => {
      try {
        await fetch(`${API_BASE}/api/v1/gamification/award-xp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "custom",
            amount: awardedXP,
            details: { game: gameTitle, score },
          }),
        });
      } catch (err) {
        console.warn("Gamification API XP ödülü verilemedi (offline mode):", err);
      }

      // Floating XP animasyonu için yerel event fırlat
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("quizwise_floating_xp", {
            detail: { amount: awardedXP, label: `🎮 ${gameTitle} (+${awardedXP} XP)` },
          })
        );

        // Altın ve XP yerel hafızaya kaydet
        const curGold = parseInt(localStorage.getItem("vocaship_gold") || "240", 10);
        localStorage.setItem("vocaship_gold", String(curGold + awardedGold));
      }
    };

    awardGamification();
  }, [gameTitle, score, awardedXP, awardedGold]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins > 0 ? `${mins}dk ` : ""}${rem}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border-2 border-indigo-500/40 p-6 sm:p-8 shadow-2xl shadow-indigo-950/70 text-center space-y-6 animate-in zoom-in-95 duration-200 relative overflow-hidden">
        {/* Arka plan ışıltısı */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Kupa İkonu */}
        <div className="relative mx-auto w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-500 flex items-center justify-center text-slate-950 shadow-xl shadow-amber-400/30">
          <Trophy className="w-10 h-10 animate-bounce" />
          <div className="absolute -top-1 -right-1 p-1 bg-indigo-600 rounded-full text-white text-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Başlık & Tebrik */}
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Harika Performans!
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            {gameTitle} {deckTitle ? `• ${deckTitle}` : ""}
          </p>
        </div>

        {/* İstatistikler Izgarası */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Toplam Skor</span>
            <span className="text-base sm:text-lg font-black text-white font-mono">{score}</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Kazanılan XP</span>
            <span className="text-base sm:text-lg font-black text-indigo-400 font-mono">+{awardedXP}</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Altın</span>
            <span className="text-base sm:text-lg font-black text-amber-400 font-mono">+{awardedGold} 🪙</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Süre / Başarı</span>
            <span className="text-xs sm:text-sm font-bold text-emerald-400 font-mono">
              {timeSeconds > 0 ? formatTime(timeSeconds) : `%${accuracyPercent}`}
            </span>
          </div>
        </div>

        {/* Seri Bonusu Rozeti */}
        {streakCount > 0 && (
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center gap-2 text-xs font-bold text-amber-300">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>{streakCount}x Seri Çarpanı Uygulandı!</span>
          </div>
        )}

        {/* Eylem Butonları: Tekrar Oyna & Arenaya Dön */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 border-t border-slate-800/80">
          <button
            type="button"
            onClick={onPlayAgain}
            className="w-full sm:w-auto flex-1 py-3 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Tekrar Oyna</span>
          </button>

          <button
            type="button"
            onClick={onBackToArena}
            className="w-full sm:w-auto flex-1 py-3 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-700 transition active:scale-95 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Arenaya Dön</span>
          </button>
        </div>
      </div>
    </div>
  );
}
