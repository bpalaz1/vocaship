"use client";

import React from "react";
import { Sparkles, Trophy, BookOpen, Mic, Award, Crown } from "lucide-react";

export interface VocabHoneycombWidgetProps {
  learnedWordsCount: number;
  readingStoriesCount?: number;
  speakingTurnsCount?: number;
}

interface HexCellConfig {
  tier: number;
  minWords: number;
  maxWords: number;
  title: string;
  icon: string;
}

const HONEYCOMB_TIERS: HexCellConfig[] = [
  { tier: 1, minWords: 0, maxWords: 100, title: "Tohum", icon: "🌱" },
  { tier: 2, minWords: 100, maxWords: 200, title: "Filiz", icon: "🌿" },
  { tier: 3, minWords: 200, maxWords: 300, title: "Bronz", icon: "🥉" },
  { tier: 4, minWords: 300, maxWords: 400, title: "Safir I", icon: "💎" },
  { tier: 5, minWords: 400, maxWords: 500, title: "Safir II", icon: "🔷" },
  { tier: 6, minWords: 500, maxWords: 600, title: "Safir III", icon: "💠" },
  { tier: 7, minWords: 600, maxWords: 700, title: "Zümrüt I", icon: "🟢" },
  { tier: 8, minWords: 700, maxWords: 800, title: "Zümrüt II", icon: "❇️" },
  { tier: 9, minWords: 800, maxWords: 900, title: "Üstat", icon: "⚡" },
  { tier: 10, minWords: 900, maxWords: 1000, title: "Grandmaster", icon: "👑" },
];

export default function VocabHoneycombWidget({
  learnedWordsCount,
  readingStoriesCount = 12,
  speakingTurnsCount = 45,
}: VocabHoneycombWidgetProps) {
  // Renge Dönüşüm Kuralı:
  // 0 - 299: Gri / Nötr Taş
  // 300 - 699: Safir Mavisi
  // 700 - 1000+: Zümrüt Yeşili & Altın Kehribar
  const getCellStatus = (cell: HexCellConfig) => {
    const isCompleted = learnedWordsCount >= cell.maxWords;
    const isCurrent =
      learnedWordsCount >= cell.minWords && learnedWordsCount < cell.maxWords;

    if (!isCompleted && !isCurrent) {
      // Kilitli / Gri Hücre
      return {
        bg: "bg-slate-950/80 border-slate-800 text-slate-600",
        glow: "",
        statusText: "Kilitli",
        isLit: false,
      };
    }

    if (cell.maxWords <= 300) {
      // Seviye 1: Başlangıç Gri-Gümüş
      return {
        bg: "bg-slate-800 border-slate-600 text-slate-200",
        glow: "shadow-[0_0_12px_rgba(148,163,184,0.3)]",
        statusText: "Temel Ustalık",
        isLit: true,
      };
    }

    if (cell.maxWords <= 700) {
      // Seviye 2: Safir Mavisi
      return {
        bg: "bg-gradient-to-br from-blue-600 via-cyan-600 to-indigo-700 border-cyan-400 text-white",
        glow: "shadow-[0_0_18px_rgba(6,182,212,0.45)]",
        statusText: "Safir Bellek",
        isLit: true,
      };
    }

    // Seviye 3: Zümrüt Yeşili & Grandmaster Altını
    return {
      bg: "bg-gradient-to-br from-emerald-500 via-teal-500 to-amber-500 border-amber-300 text-slate-950 font-black",
      glow: "shadow-[0_0_22px_rgba(16,185,129,0.55)]",
      statusText: "Zümrüt Ustalık",
      isLit: true,
    };
  };

  const currentTier = HONEYCOMB_TIERS.find(
    (t) => learnedWordsCount >= t.minWords && learnedWordsCount < t.maxWords
  ) || HONEYCOMB_TIERS[HONEYCOMB_TIERS.length - 1];

  const overallPercent = Math.min(100, Math.round((learnedWordsCount / 1000) * 100));

  return (
    <div className="w-full rounded-3xl bg-slate-900/95 border-2 border-indigo-500/30 p-5 sm:p-7 shadow-2xl relative overflow-hidden backdrop-blur-md space-y-6">
      {/* Arka plan atmosferik ışıltısı */}
      <div className="absolute top-0 right-1/4 w-80 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* ÜST BAŞLIK VE ÖZET SAYILARI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold font-mono">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>SM-2 Kelime Hakimiyet Peteği</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Ustalık Peteği (1000 Kelime)</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
              %{overallPercent} Tamamlandı
            </span>
          </h2>
          <p className="text-xs text-slate-400 max-w-lg">
            Kelimeler kalıcı hafızana yerleştikçe petek hücreleri <strong>Gri</strong> →{" "}
            <span className="text-cyan-400 font-semibold">Safir Mavisi</span> →{" "}
            <span className="text-emerald-400 font-semibold">Zümrüt & Altın</span> rengine dönüşür.
          </p>
        </div>

        {/* 3'LÜ BAŞARI İSTATİSTİĞİ KARTLARI */}
        <div className="grid grid-cols-3 gap-2 shrink-0">
          <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-0.5">
            <span className="text-[10px] text-slate-500 uppercase font-bold block flex items-center justify-center gap-1">
              <Trophy className="w-3 h-3 text-amber-400" /> Kelime
            </span>
            <span className="text-sm sm:text-base font-black text-white font-mono">
              {learnedWordsCount}
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-0.5">
            <span className="text-[10px] text-slate-500 uppercase font-bold block flex items-center justify-center gap-1">
              <BookOpen className="w-3 h-3 text-indigo-400" /> Okuma
            </span>
            <span className="text-sm sm:text-base font-black text-indigo-300 font-mono">
              {readingStoriesCount} 📜
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-0.5">
            <span className="text-[10px] text-slate-500 uppercase font-bold block flex items-center justify-center gap-1">
              <Mic className="w-3 h-3 text-rose-400" /> Speaking
            </span>
            <span className="text-sm sm:text-base font-black text-rose-300 font-mono">
              {speakingTurnsCount} 🎙️
            </span>
          </div>
        </div>
      </div>

      {/* 10 HÜCRELİ İNTERAKTİF PETEK IZGARASI */}
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2 sm:gap-2.5">
        {HONEYCOMB_TIERS.map((cell) => {
          const status = getCellStatus(cell);
          const isCurrent =
            learnedWordsCount >= cell.minWords && learnedWordsCount < cell.maxWords;

          return (
            <div
              key={cell.tier}
              className={`relative rounded-2xl p-2.5 border text-center transition-all duration-300 flex flex-col items-center justify-between min-h-[92px] ${
                status.bg
              } ${status.glow} ${isCurrent ? "ring-2 ring-amber-400 scale-105" : ""}`}
            >
              {/* Petek İkonu */}
              <span className="text-xl sm:text-2xl block">{cell.icon}</span>

              {/* Başlık ve Hedef */}
              <div className="space-y-0.5 my-1">
                <span className="text-[11px] font-black leading-tight block">
                  {cell.title}
                </span>
                <span className="text-[9px] font-mono opacity-75 block">
                  {cell.maxWords} K.
                </span>
              </div>

              {/* Durum Rozeti */}
              <span
                className={`text-[8px] font-mono px-1.5 py-0.2 rounded uppercase font-bold ${
                  status.isLit
                    ? "bg-black/30 text-white"
                    : "bg-slate-900 text-slate-500 border border-slate-800"
                }`}
              >
                {isCurrent ? "Aktif" : status.isLit ? "✓ Tamam" : "Kilit"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

