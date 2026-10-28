"use client";

import React from "react";
import { Zap, X, BrainCircuit } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import type { AcademicWord } from "./CipherLabModal";

export interface SpeedTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  speedCountdown: number;
  speedGameOver: boolean;
  speedScore: { known: number; forgotten: number };
  speedIndex: number;
  speedFlipped: boolean;
  startSpeedTest: () => void;
  handleSpeedAnswer: (known: boolean) => void;
  words: AcademicWord[];
}

export default function SpeedTestModal({
  isOpen,
  onClose,
  speedCountdown,
  speedGameOver,
  speedScore,
  speedIndex,
  speedFlipped,
  startSpeedTest,
  handleSpeedAnswer,
  words,
}: SpeedTestModalProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{t("card_speed_title", "SM-2 Bilişsel Hız Testi")}</h3>
              <p className="text-xs text-slate-400">5 saniyede anlamı zihninizde çağırın</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border ${
              speedCountdown <= 2 ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse" : "bg-slate-950 text-purple-300 border-slate-800"
            }`}>
              ⏱️ {speedCountdown}s
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {speedGameOver ? (
          <div className="text-center py-10 space-y-4">
            <div className="w-16 h-16 rounded-full bg-purple-500/20 text-purple-400 mx-auto flex items-center justify-center border border-purple-500/30">
              <BrainCircuit className="w-8 h-8" />
            </div>
            <h4 className="text-2xl font-black text-white">Hız Testi Tamamlandı</h4>
            <p className="text-sm text-slate-300">
              Hatırlanan: <strong className="text-emerald-400">{speedScore.known}</strong> • Tekrar Gereken: <strong className="text-rose-400">{speedScore.forgotten}</strong>
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                type="button"
                onClick={startSpeedTest}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition cursor-pointer"
              >
                Tekrar Dene
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Kelime Kartı */}
            <div className="min-h-[160px] p-6 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3 shadow-inner">
              <span className="text-[10px] uppercase font-bold text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                Kart {speedIndex + 1} / {words.length}
              </span>
              <h4 className="text-2xl font-black text-white font-mono">
                {words[speedIndex]?.word}
              </h4>

              {speedFlipped ? (
                <div className="pt-2 animate-in fade-in duration-200">
                  <p className="text-sm text-emerald-300 font-bold">
                    {words[speedIndex]?.meaning}
                  </p>
                  <p className="text-xs text-slate-400 italic mt-1">
                    "{words[speedIndex]?.sentence}"
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Zihninde Türkçe anlamını hatırla... (Kart açılacak)
                </p>
              )}
            </div>

            {/* Eylem Butonları */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSpeedAnswer(false)}
                className="py-3 px-4 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition active:scale-95 cursor-pointer"
              >
                ❌ Unuttum / Hatırlayamadım
              </button>
              <button
                type="button"
                onClick={() => handleSpeedAnswer(true)}
                className="py-3 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition active:scale-95 cursor-pointer"
              >
                ✅ Hatırladım (Hızlı)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
