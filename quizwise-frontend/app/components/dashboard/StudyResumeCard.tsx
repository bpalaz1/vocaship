"use client";

import React from "react";
import { Play, Zap, ArrowRight, Brain } from "lucide-react";

export interface StudyResumeDeckInfo {
  id: string;
  title: string;
  description: string;
  icon?: string;
  totalCards?: number;
  studiedCards?: number;
  progressPercent?: number;
  isPersonal?: boolean;
}

interface StudyResumeCardProps {
  deck: StudyResumeDeckInfo;
  onContinue: () => void;
  weakSpotCount?: number;
  onOpenWeakSpots?: () => void;
}

export default function StudyResumeCard({
  deck,
  onContinue,
  weakSpotCount = 0,
  onOpenWeakSpots,
}: StudyResumeCardProps) {
  const percent = deck.progressPercent ?? 36;
  const studied = deck.studiedCards ?? 12;
  const total = deck.totalCards ?? 20;

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 p-6 sm:p-7 backdrop-blur-xl shadow-xl">
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        <div className="space-y-3 flex-1 max-w-xl">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-wider border border-indigo-500/40 flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-indigo-400" />
              <span>ÇALIŞMAYA DEVAM ET</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">
              SuperMemo-2 • Aralıklı Tekrar
            </span>
          </div>

          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{deck.icon || "🎓"}</span>
              <span className="truncate">{deck.title}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-2">
              {deck.description}
            </p>
          </div>

          {/* İlerleme Çubuğu */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-400">Öğrenme İlerlemesi</span>
              <span className="text-indigo-400 font-mono font-bold">%{percent} Tamamlandı</span>
            </div>
            <div className="w-full h-2.5 bg-slate-950 rounded-full border border-slate-800 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
              <span>🧠 {studied} / {total} Kart Çalışıldı</span>
              <span>⏱️ SM-2 Hatırlama Eşiği</span>
            </div>
          </div>
        </div>

        {/* Eylem Butonları */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 lg:w-64">
          <button
            type="button"
            onClick={onContinue}
            className="w-full flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Devam Et</span>
          </button>

          {weakSpotCount > 0 && onOpenWeakSpots && (
            <button
              type="button"
              onClick={onOpenWeakSpots}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 text-xs font-bold transition active:scale-95 cursor-pointer shadow-sm"
            >
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                <span>🎯 Zayıf Noktaları Erit ({weakSpotCount})</span>
              </div>
              <span className="text-[10px] font-mono text-rose-400">2 Dk ➔</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
