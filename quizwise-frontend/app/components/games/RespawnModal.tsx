"use client";

import React, { useState, useEffect, useMemo } from "react";
import confetti from "canvas-confetti";
import {
  HeartCrack,
  Heart,
  Sparkles,
  Flame,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldAlert,
  RotateCcw,
} from "lucide-react";
import { saveArenaMistake } from "../../utils/arenaMistakes";

export interface RespawnModalProps {
  isOpen: boolean;
  cards: Array<{ word: string; meaning: string; phonetic?: string }>;
  onRespawn: () => void;
  onGiveUp: () => void;
}

export default function RespawnModal({
  isOpen,
  cards,
  onRespawn,
  onGiveUp,
}: RespawnModalProps) {
  const [consecutiveCount, setConsecutiveCount] = useState(0);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  // Soru Havuzu
  const safeCards = cards && cards.length >= 3 ? cards : [
    { word: "resilient", meaning: "Dirençli, esnek, çabuk toparlanan" },
    { word: "mitigate", meaning: "Hafifletmek, etkisini azaltmak" },
    { word: "allocate", meaning: "Tahsis etmek, ayırmak" },
    { word: "variance", meaning: "Farklılık, sapma" },
  ];

  const activeCard = safeCards[currentCardIndex % safeCards.length];

  // 4 Seçenek Üret
  const options = useMemo(() => {
    if (!activeCard) return [];
    const correct = activeCard.meaning;
    const others = safeCards
      .filter((c) => c.meaning !== correct)
      .map((c) => c.meaning);

    const shuffledOthers = [...others].sort(() => 0.5 - Math.random()).slice(0, 3);
    return [correct, ...shuffledOthers].sort(() => 0.5 - Math.random());
  }, [currentCardIndex, safeCards, activeCard]);

  // Ses Efekti
  const playRespawnSound = (type: "correct" | "wrong" | "revive") => {
    if (typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === "revive") {
        [440, 554, 659, 880].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
          gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.08);
          osc.stop(ctx.currentTime + idx * 0.08 + 0.25);
        });
      } else if (type === "correct") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(587, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch {}
  };

  const handleSelectOption = (opt: string) => {
    if (isAnswered) return;
    setSelectedOption(opt);
    setIsAnswered(true);

    const isCorrect = opt === activeCard.meaning;

    if (isCorrect) {
      const nextCount = consecutiveCount + 1;
      setFeedback("correct");
      setConsecutiveCount(nextCount);
      playRespawnSound("correct");

      if (nextCount >= 3) {
        // 3 Doğru Tamamlandı! Canlanma Kutlaması
        playRespawnSound("revive");
        try {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
        } catch {}

        setTimeout(() => {
          setConsecutiveCount(0);
          setIsAnswered(false);
          setSelectedOption(null);
          setFeedback(null);
          onRespawn();
        }, 800);
      } else {
        setTimeout(() => {
          setIsAnswered(false);
          setSelectedOption(null);
          setFeedback(null);
          setCurrentCardIndex((i) => i + 1);
        }, 600);
      }
    } else {
      // Yanlış: Sayaç sıfırlanır, tekrar 3 doğru gerekir
      setFeedback("wrong");
      setConsecutiveCount(0);
      playRespawnSound("wrong");

      saveArenaMistake({
        word: activeCard.word,
        meaning: activeCard.meaning,
        phonetic: activeCard.phonetic,
        gameType: "respawn_recovery",
      });

      setTimeout(() => {
        setIsAnswered(false);
        setSelectedOption(null);
        setFeedback(null);
        setCurrentCardIndex((i) => i + 1);
      }, 800);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Parıltı Efekti */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* ÜST BAŞLIK */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-br from-rose-500/20 via-emerald-500/20 to-emerald-500/10 border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <Heart className="w-8 h-8 text-emerald-400 animate-pulse" />
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            ❤️‍🩹 Kurtarma Odası: Yeniden Canlanma!
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Canın tükendi ama oyun bitmedi! <strong>3 kelimeyi arka arkaya</strong> doğru bil, 1 canla hemen savaşa geri dön!
          </p>
        </div>

        {/* İLERLEME ADIMLARI (3'TE KAÇ DOĞRU) */}
        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-around">
          {[1, 2, 3].map((step) => {
            const isCompleted = consecutiveCount >= step;
            return (
              <div key={step} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-all ${
                    isCompleted
                      ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 scale-110"
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step}
                </div>
                <span className="text-xs font-bold text-slate-300 hidden sm:inline">
                  {step}. Doğru
                </span>
              </div>
            );
          })}
        </div>

        {/* AKTİF KELİME KARTI */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Kelime Anlamını Seç
          </span>
          <h4 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-wide">
            {activeCard.word}
          </h4>
          {activeCard.phonetic && (
            <p className="text-xs text-slate-400 font-mono">{activeCard.phonetic}</p>
          )}
        </div>

        {/* 4 ŞIKLI SEÇENEK BUTONLARI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {options.map((opt) => {
            const isSelected = selectedOption === opt;
            const isCorrect = opt === activeCard.meaning;

            let btnStyle = "bg-slate-950/80 hover:bg-slate-800/80 border-slate-800 text-slate-200";

            if (isAnswered) {
              if (isCorrect) {
                btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-black shadow-md shadow-emerald-500/20";
              } else if (isSelected) {
                btnStyle = "bg-rose-500/20 border-rose-500 text-rose-300";
              }
            }

            return (
              <button
                key={opt}
                type="button"
                disabled={isAnswered}
                onClick={() => handleSelectOption(opt)}
                className={`p-3.5 rounded-2xl border text-xs sm:text-sm font-semibold text-left transition-all cursor-pointer ${btnStyle}`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {/* GERİ BİLDİRİM / PES ET BUTONU */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <button
            type="button"
            onClick={onGiveUp}
            className="text-xs text-slate-400 hover:text-rose-400 transition underline underline-offset-4 cursor-pointer"
          >
            Pes Et ve Skoru Gör
          </button>

          <span className="text-[11px] font-mono text-emerald-400 font-bold">
            ⚡ Sıfır Eleme Garantisi
          </span>
        </div>
      </div>
    </div>
  );
}

