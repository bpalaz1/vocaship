"use client";

import React from "react";
import PlatformStandardLayout, { PlatformGamificationPanel } from "../layout/PlatformStandardLayout";
import Link from "next/link";
import { ArrowLeft, BookOpen, Layers, Coins, Share2, Sparkles, CheckCircle2 } from "lucide-react";

export interface DeckStudyContainerProps {
  deckTitle?: string;
  deckDescription?: string;
  cardsCount?: number;
  currentIndex?: number;
  learnedCount?: number;
  weakCount?: number;
  gold?: number;
  xp?: number;
  streak?: number;
  onShare?: () => void;
  cardsList?: Array<{ id: string; word: string; meaning?: string; needs_review?: boolean }>;
  onSelectCardIndex?: (index: number) => void;
  children: React.ReactNode;
}

export default function DeckStudyContainer({
  deckTitle = "Kelime Destesi",
  deckDescription,
  cardsCount = 0,
  currentIndex = 0,
  learnedCount = 0,
  weakCount = 0,
  gold = 240,
  xp = 450,
  streak = 5,
  onShare,
  cardsList = [],
  onSelectCardIndex,
  children,
}: DeckStudyContainerProps) {
  // Sol Panel: Deste Bilgisi ve Kelime Listesi (Dual-Tone Beyaz Kartlar)
  const leftSidebar = (
    <div className="space-y-4">
      <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3 text-slate-800">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition"
        >
          <ArrowLeft className="w-4 h-4 text-indigo-300" />
          <span>Tüm Destelere Dön</span>
        </Link>

        <div className="space-y-1 pt-1">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="truncate">{deckTitle}</span>
          </h2>
          {deckDescription && (
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {deckDescription}
            </p>
          )}
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>Toplam {cardsCount} Kelime</span>
          {onShare && (
            <button
              type="button"
              onClick={onShare}
              className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Paylaş</span>
            </button>
          )}
        </div>
      </div>

      {/* Deste Kelime Kartları Önizleme Listesi */}
      {cardsList.length > 0 && (
        <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3 text-slate-800">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Deste Kelimeleri</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              {currentIndex + 1} / {cardsList.length}
            </span>
          </div>

          <div className="space-y-1.5 max-h-[360px] overflow-y-auto scrollbar-none pr-1">
            {cardsList.map((c, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={c.id || idx}
                  type="button"
                  onClick={() => onSelectCardIndex && onSelectCardIndex(idx)}
                  className={`w-full p-2.5 rounded-xl text-left text-xs transition flex items-center justify-between gap-2 cursor-pointer ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-300 font-bold shadow-sm"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80"
                  }`}
                >
                  <span className="truncate">{c.word}</span>
                  {c.needs_review && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 font-bold shrink-0 border border-rose-200">
                      Zayıf
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  // Sağ Panel: Gamification Özeti
  const rightSidebar = (
    <PlatformGamificationPanel
      title={`${deckTitle} Çalışması`}
      streak={streak}
      gold={gold}
      xp={xp}
      level="Akıllı Çalışma"
      learnedCount={learnedCount}
      totalCount={cardsCount}
      weakCount={weakCount}
    />
  );

  return (
    <PlatformStandardLayout
      leftSidebar={leftSidebar}
      rightSidebar={rightSidebar}
      headerTitle={deckTitle}
      headerSubtitle="Spaced Repetition (SM-2) Flashcard Çalışması"
    >
      {children}
    </PlatformStandardLayout>
  );
}
