"use client";

import React, { useState, useEffect, useRef } from "react";
import { Shuffle, Clock, X, Trophy, Sparkles, Check, RotateCcw, Volume2, VolumeX } from "lucide-react";
import GameOverScreen from "./GameOverScreen";
import MysteryChestModal, { MysteryReward } from "./MysteryChestModal";
import { saveArenaMistake } from "../../utils/arenaMistakes";
import {
  calculateWordReward,
  shouldTriggerMysteryChest,
} from "../../utils/gamificationEngine";
import { GameMistakeItem } from "./GameOverSummary";
import StreakMilestoneBar from "./StreakMilestoneBar";
import { playArenaSound } from "../../utils/soundEffects";
import { useLanguage } from "../../context/LanguageContext";

export interface MatchPairItem {
  id: string;
  text: string;
  pairId: string;
  type: "word" | "meaning";
  isMatched: boolean;
  word?: string;
}

export interface MatchGameProps {
  cards: Array<{ word: string; meaning: string }>;
  deckTitle?: string;
  onClose: () => void;
  onAwardXP?: (xp: number, label: string) => void;
}

export default function MatchGame({
  cards,
  deckTitle,
  onClose,
  onAwardXP,
}: MatchGameProps) {
  const { t } = useLanguage();
  const resolvedDeckTitle = deckTitle || t("game_default_deck", "Genel Deste");
  const [gridItems, setGridItems] = useState<MatchPairItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [mismatchedIds, setMismatchedIds] = useState<string[]>([]);
  const [seconds, setSeconds] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [combos, setCombos] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isMysteryOpen, setIsMysteryOpen] = useState(false);
  const [mysteryBuff, setMysteryBuff] = useState(1.0);
  const [mysteryBuffCount, setMysteryBuffCount] = useState(0);
  const [sessionMistakes, setSessionMistakes] = useState<GameMistakeItem[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Oyunu başlat ve 12 kartlık (6 çift) ızgarayı karıştır
  const initGame = () => {
    const selectedPairs = cards.slice(0, 6);
    const items: MatchPairItem[] = [];

    selectedPairs.forEach((p, idx) => {
      items.push({
        id: `w_${idx}`,
        text: p.word,
        pairId: `pair_${idx}`,
        type: "word",
        isMatched: false,
        word: p.word,
      });
      items.push({
        id: `m_${idx}`,
        text: p.meaning,
        pairId: `pair_${idx}`,
        type: "meaning",
        isMatched: false,
        word: p.word,
      });
    });

    // Fisher-Yates karıştırma
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }

    setGridItems(items);
    setSelectedIds([]);
    setMismatchedIds([]);
    setSeconds(0);
    setIsFinished(false);
    setScore(0);
    setCombos(0);
    setSessionMistakes([]);
    setCombos(0);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
  };

  useEffect(() => {
    initGame();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [cards]);

  // Kart tıklama işlemi
  const handleCardClick = (item: MatchPairItem) => {
    if (item.isMatched || selectedIds.includes(item.id) || selectedIds.length >= 2) return;

    const newSelected = [...selectedIds, item.id];
    setSelectedIds(newSelected);

    if (newSelected.length === 2) {
      const first = gridItems.find((c) => c.id === newSelected[0]);
      const second = item;

      if (first && first.pairId === second.pairId) {
        // DOĞRU EŞLEŞME: Yeşil Parlayıp Kaybolma
        setTimeout(() => {
          setGridItems((prev) =>
            prev.map((c) => (c.pairId === first.pairId ? { ...c, isMatched: true } : c))
          );
          setSelectedIds([]);

          const nextCombos = combos + 1;
          setCombos(nextCombos);
          if (nextCombos % 5 === 0) {
            playArenaSound("milestone", soundEnabled);
          } else {
            playArenaSound("correct", soundEnabled);
          }

          // Ortak Oyunlaştırma Motoru: Azalan verim, CEFR & Kombo Çarpanı
          const wordKey = first.word || item.word || "word";
          const reward = calculateWordReward({
            word: wordKey,
            streak: nextCombos,
            isCorrect: true,
            activeBuffMultiplier: mysteryBuff,
          });

          if (mysteryBuffCount > 0) {
            const nextC = mysteryBuffCount - 1;
            setMysteryBuffCount(nextC);
            if (nextC <= 0) setMysteryBuff(1.0);
          }

          setScore((s) => s + reward.totalXP);

          // Her 3 doğru seride 3 Gizemli Sandık Aç
          if (shouldTriggerMysteryChest(nextCombos)) {
            setTimeout(() => setIsMysteryOpen(true), 400);
          }

          // Tüm kartlar eşleşti mi kontrolü
          const remaining = gridItems.filter((c) => !c.isMatched && c.pairId !== first.pairId);
          if (remaining.length === 0) {
            setIsFinished(true);
            if (timerRef.current) clearInterval(timerRef.current);
          }
        }, 280);
      } else {
        // HATALI EŞLEŞME: Kırmızı Titreme (Shake)
        setMismatchedIds(newSelected);
        setCombos(0);
        playArenaSound("wrong", soundEnabled);

        const wordCard = cards.find(
          (c) =>
            c.word.toLowerCase() === (first?.word || "").toLowerCase() ||
            c.word.toLowerCase() === (item.word || "").toLowerCase()
        );
        if (wordCard) {
          setSessionMistakes((prev) => {
            if (prev.some((m) => m.word.toLowerCase() === wordCard.word.toLowerCase())) return prev;
            return [...prev, { word: wordCard.word, meaning: wordCard.meaning }];
          });
        }

        if (first?.word) {
          saveArenaMistake({ word: first.word, gameType: "match" });
        }
        if (item.word && item.word !== first?.word) {
          saveArenaMistake({ word: item.word, gameType: "match" });
        }

        setTimeout(() => {
          setSelectedIds([]);
          setMismatchedIds([]);
        }, 650);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#dce3ec] text-slate-900 dark:bg-slate-950 dark:text-slate-100 px-3 sm:px-6 py-3 sm:py-6 pb-24 overflow-y-auto overflow-x-hidden">
      {/* Üst Kontrol & Durum Çubuğu */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between gap-2 pb-2.5 sm:pb-4 border-b border-slate-300 dark:border-slate-800">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="p-2 rounded-2xl bg-indigo-100 text-indigo-700 border border-indigo-300 dark:bg-indigo-600/20 dark:text-indigo-400 dark:border-indigo-500/30 shrink-0">
            <Shuffle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-lg font-extrabold text-slate-900 dark:text-white truncate">
              {t("game_match_title", "Kart Eşleştirme (Match)")}
            </h2>
            <p className="text-xs text-slate-600 font-medium dark:text-slate-400 truncate">{resolvedDeckTitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Süre Sayacı */}
          <div className="flex items-center space-x-1 px-2.5 py-1 sm:py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 font-mono text-xs font-bold text-indigo-700 dark:text-indigo-300 whitespace-nowrap">
            <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{seconds}s</span>
          </div>

          {/* Skor */}
          <div className="px-2.5 py-1 sm:py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 font-mono text-xs font-bold text-amber-700 dark:text-yellow-400 whitespace-nowrap">
            {score} {t("game_points_unit", "Puan")}
          </div>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
            title={soundEnabled ? t("game_sound_off", "Sesi Kapat") : t("game_sound_on", "Sesi Aç")}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Çıkış */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            title={t("game_exit", "Oyundan Çık")}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 5 Kademeli Seri Çubuğu (0/5 -> 5/5) */}
      <div className="max-w-4xl mx-auto w-full pt-2 mb-2">
        <StreakMilestoneBar streak={combos} />
      </div>

      {/* 12'li Karışık Izgara */}
      <div className="max-w-4xl mx-auto w-full flex-1 flex items-center justify-center py-2 sm:py-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3.5 w-full">
          {gridItems.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            const isMismatched = mismatchedIds.includes(item.id);

            return (
              <button
                key={item.id}
                type="button"
                disabled={item.isMatched}
                onClick={() => handleCardClick(item)}
                className={`min-h-[58px] sm:min-h-[84px] py-2 px-2.5 sm:p-3 rounded-2xl border text-xs sm:text-sm leading-snug font-bold flex items-center justify-center text-center transition-all duration-200 cursor-pointer select-none relative overflow-hidden ${
                  item.isMatched
                    ? "opacity-0 scale-95 pointer-events-none transition-all duration-300"
                    : isMismatched
                    ? "bg-rose-100 border-rose-400 text-rose-900 dark:bg-rose-500/20 dark:border-rose-500 dark:text-rose-300 animate-pulse ring-2 ring-rose-500/50"
                    : isSelected
                    ? "bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/40 scale-105 ring-2 ring-indigo-400"
                    : "bg-white hover:bg-indigo-50 border-slate-300 text-slate-900 dark:bg-slate-900/90 dark:hover:bg-slate-850 dark:border-slate-800 dark:text-slate-200 hover:border-indigo-500/50 shadow-md hover:-translate-y-0.5"
                }`}
              >
                <span className="leading-snug px-1 break-words line-clamp-3">
                  {item.text}
                </span>

                {/* Eşleşme Işıltısı */}
                {isSelected && !isMismatched && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-300" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Oyun Sonu Ekranı (5 Saniyelik Hata Telafisi ile) */}
      {isFinished && (
        <GameOverScreen
          gameTitle={t("game_match_over_title", "🃏 Kart Eşleştirme")}
          deckTitle={resolvedDeckTitle}
          score={score}
          timeSeconds={seconds}
          awardedXP={Math.max(40, score)}
          awardedGold={Math.max(15, Math.round(score * 0.35))}
          streakCount={combos}
          mistakes={sessionMistakes}
          onPlayAgain={initGame}
          onBackToArena={onClose}
        />
      )}

      {/* 3 Kapalı Gizemli Sandık Modalı (Pedagojik Kayıpsız) */}
      <MysteryChestModal
        isOpen={isMysteryOpen}
        streak={combos}
        onClose={() => setIsMysteryOpen(false)}
        onClaimReward={(reward: MysteryReward) => {
          if (reward.multiplier) {
            setMysteryBuff(reward.multiplier);
            setMysteryBuffCount(reward.buffQuestions || 3);
          }
        }}
      />
    </div>
  );
}
