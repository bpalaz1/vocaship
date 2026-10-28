"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import confetti from "canvas-confetti";
import { Zap, Clock, X, Trophy, Flame, Check, AlertCircle } from "lucide-react";
import GameOverScreen from "./GameOverScreen";

export interface SpeedRecallGameProps {
  cards: Array<{ word: string; meaning: string }>;
  deckTitle?: string;
  onClose: () => void;
  onAwardXP?: (xp: number, label: string) => void;
}

export default function SpeedRecallGame({
  cards,
  deckTitle = "Genel Deste",
  onClose,
  onAwardXP,
}: SpeedRecallGameProps) {
  const [currentRound, setCurrentRound] = useState(0);
  const [timer, setTimer] = useState(5);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const totalRounds = Math.min(10, Math.max(5, cards.length));
  const activeCard = cards[currentRound % cards.length] || {
    word: "mitigate",
    meaning: "Hafifletmek, etkisini azaltmak",
  };

  // 4 seçenek oluştur (1 doğru, 3 çeldirici)
  const options = useMemo(() => {
    const correct = activeCard.meaning;
    const others = cards
      .filter((c) => c.meaning !== correct)
      .map((c) => c.meaning);

    // Çeldiricileri karıştır ve 3 tanesini al
    const shuffledOthers = [...others].sort(() => 0.5 - Math.random()).slice(0, 3);
    const all = [correct, ...shuffledOthers].sort(() => 0.5 - Math.random());
    return all;
  }, [currentRound, cards]);

  // 5 saniye zamanlayıcı
  useEffect(() => {
    if (gameOver || isAnswered) return;

    setTimer(5);
    countdownRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          // Süre bitti! Yanlış say
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [currentRound, gameOver, isAnswered]);

  const handleTimeout = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setIsAnswered(true);
    setCombo(0);

    setTimeout(() => {
      advanceRound();
    }, 900);
  };

  const handleSelectOption = (opt: string) => {
    if (isAnswered) return;
    if (countdownRef.current) clearInterval(countdownRef.current);

    setSelectedOption(opt);
    setIsAnswered(true);

    const isCorrect = opt === activeCard.meaning;
    if (isCorrect) {
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      setMaxCombo((prev) => Math.max(prev, nextCombo));
      setCorrectCount((c) => c + 1);

      // Çarpanlı puan
      const earned = 100 + nextCombo * 20;
      setScore((s) => s + earned);

      if (nextCombo >= 3) {
        confetti({ particleCount: 25, spread: 40 });
      }
    } else {
      setCombo(0);
    }

    setTimeout(() => {
      advanceRound();
    }, 900);
  };

  const advanceRound = () => {
    setSelectedOption(null);
    setIsAnswered(false);

    if (currentRound + 1 >= totalRounds) {
      setGameOver(true);
    } else {
      setCurrentRound((r) => r + 1);
    }
  };

  const resetGame = () => {
    setCurrentRound(0);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setCorrectCount(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setGameOver(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-slate-100 p-4 sm:p-6 overflow-y-auto">
      {/* 1. Üst Bar: Zamanlayıcı, Skor, Kombo, Çıkış */}
      <div className="max-w-2xl mx-auto w-full flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-white">5s Hızlı Kombo (Speed Recall)</h2>
            <p className="text-xs text-slate-400 font-medium">{deckTitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Kombo Sayacı */}
          {combo > 1 && (
            <div className="flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-xl text-amber-300 font-bold text-xs animate-bounce">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>{combo}x Kombo!</span>
            </div>
          )}

          {/* Skor */}
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-yellow-400">
            {score} Puan
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. Merkez Oyun Kartı */}
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col justify-center py-6 space-y-6">
        {/* 5 Saniyelik Nabız Çemberi */}
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-mono text-slate-400">
            Tur {currentRound + 1} / {totalRounds}
          </span>

          <div
            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-black font-mono text-lg transition-all ${
              timer <= 2
                ? "border-rose-500 text-rose-400 bg-rose-500/10 animate-ping"
                : "border-purple-500 text-purple-300 bg-purple-500/10"
            }`}
          >
            {timer}
          </div>
        </div>

        {/* Hedef Kelime Kartı */}
        <div className="p-8 rounded-3xl bg-slate-900 border-2 border-indigo-500/30 shadow-2xl text-center space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">
            Hedef Kelime:
          </span>
          <h3 className="text-3xl sm:text-4xl font-black text-white font-mono tracking-wide">
            {activeCard.word}
          </h3>
        </div>

        {/* 4 Çoktan Seçmeli Seçenek */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {options.map((opt, i) => {
            const isCorrect = opt === activeCard.meaning;
            const isSelected = selectedOption === opt;

            let btnStyle = "bg-slate-900/90 border-slate-800 hover:border-indigo-500 text-slate-200";

            if (isAnswered) {
              if (isCorrect) {
                btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/40";
              } else if (isSelected) {
                btnStyle = "bg-rose-500/20 border-rose-500 text-rose-300 ring-2 ring-rose-500/40";
              } else {
                btnStyle = "bg-slate-950/60 border-slate-800 text-slate-600 opacity-40";
              }
            }

            return (
              <button
                key={i}
                type="button"
                disabled={isAnswered}
                onClick={() => handleSelectOption(opt)}
                className={`p-4 rounded-2xl border text-xs sm:text-sm font-bold text-left transition-all duration-200 cursor-pointer shadow-md flex items-center justify-between gap-2 ${btnStyle}`}
              >
                <span>{opt}</span>
                {isAnswered && isCorrect && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Oyun Sonu Ekranı */}
      {gameOver && (
        <GameOverScreen
          gameTitle="5s Hızlı Kombo (Speed Recall)"
          deckTitle={deckTitle}
          score={score}
          accuracyPercent={Math.round((correctCount / totalRounds) * 100)}
          awardedXP={85}
          awardedGold={30}
          streakCount={maxCombo}
          onPlayAgain={resetGame}
          onBackToArena={onClose}
        />
      )}
    </div>
  );
}
