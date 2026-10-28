"use client";

import React, { useState, useEffect, useRef } from "react";
import { Shuffle, Clock, X, Trophy, Sparkles, Check, RotateCcw } from "lucide-react";
import GameOverScreen from "./GameOverScreen";

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
  deckTitle = "Genel Deste",
  onClose,
  onAwardXP,
}: MatchGameProps) {
  const [gridItems, setGridItems] = useState<MatchPairItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [mismatchedIds, setMismatchedIds] = useState<string[]>([]);
  const [seconds, setSeconds] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [combos, setCombos] = useState(0);

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
          setScore((s) => s + 100 + combos * 15);
          setCombos((c) => c + 1);

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

        setTimeout(() => {
          setSelectedIds([]);
          setMismatchedIds([]);
        }, 650);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-slate-100 p-4 sm:p-6 overflow-y-auto">
      {/* Üst Kontrol & Durum Çubuğu */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Shuffle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white">
              Kart Eşleştirme (Match)
            </h2>
            <p className="text-xs text-slate-400 font-medium">{deckTitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Süre Sayacı */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs font-bold text-indigo-300">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{seconds}s</span>
          </div>

          {/* Skor */}
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs font-bold text-yellow-400">
            {score} Puan
          </div>

          {/* Çıkış */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            title="Oyundan Çık"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 12'li Karışık Izgara */}
      <div className="max-w-4xl mx-auto w-full flex-1 flex items-center justify-center py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 w-full">
          {gridItems.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            const isMismatched = mismatchedIds.includes(item.id);

            return (
              <button
                key={item.id}
                type="button"
                disabled={item.isMatched}
                onClick={() => handleCardClick(item)}
                className={`h-24 sm:h-28 p-3 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-center text-center transition-all duration-200 cursor-pointer select-none relative overflow-hidden ${
                  item.isMatched
                    ? "opacity-0 scale-95 pointer-events-none transition-all duration-300"
                    : isMismatched
                    ? "bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse ring-2 ring-rose-500/50"
                    : isSelected
                    ? "bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/40 scale-105 ring-2 ring-indigo-400"
                    : "bg-slate-900/90 hover:bg-slate-850 border-slate-800 hover:border-indigo-500/50 text-slate-200 shadow-md hover:-translate-y-0.5"
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

      {/* Oyun Sonu Ekranı */}
      {isFinished && (
        <GameOverScreen
          gameTitle="Kart Eşleştirme (Match)"
          deckTitle={deckTitle}
          score={score}
          timeSeconds={seconds}
          awardedXP={80}
          awardedGold={35}
          streakCount={combos}
          onPlayAgain={initGame}
          onBackToArena={onClose}
        />
      )}
    </div>
  );
}
