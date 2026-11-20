"use client";

import React from "react";
import PlatformStandardLayout, { PlatformGamificationPanel } from "../layout/PlatformStandardLayout";
import Link from "next/link";
import { ArrowLeft, BookOpen, Layers, Coins, Share2, Sparkles, CheckCircle2 } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

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
  deckTitle,
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
  const { t } = useLanguage();
  const resolvedDeckTitle = deckTitle || t("study_default_deck_title", "Kelime Destesi");
  // Sol Panel: Deste Bilgisi ve Kelime Listesi
  const leftSidebar = (
    <div className="space-y-4">
      <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-3 text-slate-100">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold shadow-sm transition"
        >
          <ArrowLeft className="w-4 h-4 text-indigo-300" />
          <span>{t("study_back_all_decks", "Tüm Destelere Dön")}</span>
        </Link>

        <div className="space-y-1 pt-1">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="truncate">{resolvedDeckTitle}</span>
          </h2>
          {deckDescription && (
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
              {deckDescription}
            </p>
          )}
        </div>

        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>{t("study_total_words", "Toplam {count} Kelime").replace("{count}", String(cardsCount))}</span>
          {onShare && (
            <button
              type="button"
              onClick={onShare}
              className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{t("share", "Paylaş")}</span>
            </button>
          )}
        </div>
      </div>

      {/* Deste Kelime Kartları Önizleme Listesi */}
      {cardsList.length > 0 && (
        <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-3 text-slate-100">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t("study_deck_words_hdr", "Deste Kelimeleri")}</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">
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
                      ? "bg-indigo-600/25 text-indigo-200 border border-indigo-500/50 font-bold shadow-sm"
                      : "bg-slate-950/70 hover:bg-slate-800/80 text-slate-300 border border-slate-800"
                  }`}
                >
                  <span className="truncate">{c.word}</span>
                  {c.needs_review && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold shrink-0 border border-rose-500/30">
                      {t("study_weak_badge", "Zayıf")}
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

  return (
    <PlatformStandardLayout
      leftSidebar={leftSidebar}
      headerTitle={deckTitle}
      headerSubtitle="Spaced Repetition (SM-2) Flashcard Çalışması"
    >
      {children}
    </PlatformStandardLayout>
  );
}
